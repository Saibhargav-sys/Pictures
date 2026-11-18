const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Map([
  ['image/jpeg', {extension: 'jpg', signature: bytes => bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9}],
  ['image/png', {extension: 'png', signature: bytes => bytes.length >= 20 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a && bytes.at(-8) === 0x49 && bytes.at(-7) === 0x45 && bytes.at(-6) === 0x4e && bytes.at(-5) === 0x44}],
  ['image/webp', {extension: 'webp', signature: bytes => bytes.length >= 20 && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' && new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) === bytes.length - 8 && String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP'}]
]);

function jsonResponse(body, status, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin'
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return new Response(status === 204 ? null : JSON.stringify(body), {status, headers});
}

function toBase64(bytes) {
  let binary = '';
  const chunkSize = 3 * 16384;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function verifyTurnstile(token, request, env) {
  const payload = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: request.headers.get('CF-Connecting-IP') || ''
  });
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: payload
  });
  if (!response.ok) return false;

  const result = await response.json();
  return result.success === true && result.hostname === env.TURNSTILE_HOSTNAME;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowedOrigin = origin === env.ALLOWED_ORIGIN ? origin : null;

    if (request.method === 'OPTIONS') {
      return allowedOrigin
        ? jsonResponse({}, 204, allowedOrigin)
        : jsonResponse({error: 'Origin not allowed.'}, 403, null);
    }

    if (request.method !== 'POST' || new URL(request.url).pathname !== '/upload') {
      return jsonResponse({error: 'Not found.'}, 404, allowedOrigin);
    }
    if (!allowedOrigin) {
      return jsonResponse({error: 'Origin not allowed.'}, 403, null);
    }

    const contentLength = Number(request.headers.get('Content-Length'));
    if (Number.isFinite(contentLength) && contentLength > maxFileSize + 1024 * 1024) {
      return jsonResponse({error: 'Images must be 10 MB or smaller.'}, 413, allowedOrigin);
    }

    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip) {
      return jsonResponse({error: 'Upload could not be processed.'}, 503, allowedOrigin);
    }
    const rateLimit = await env.UPLOAD_LIMITER.limit({key: ip});
    if (!rateLimit.success) {
      return jsonResponse({error: 'Too many uploads. Please wait a minute and try again.'}, 429, allowedOrigin);
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return jsonResponse({error: 'Invalid upload form.'}, 400, allowedOrigin);
    }

    const photo = form.get('photo');
    const token = form.get('turnstileToken');
    if (!photo || typeof photo.arrayBuffer !== 'function' || typeof token !== 'string' || token.length === 0 || token.length > 2048) {
      return jsonResponse({error: 'Choose an image and complete verification.'}, 400, allowedOrigin);
    }
    if (photo.size === 0 || photo.size > maxFileSize) {
      return jsonResponse({error: 'Images must be between 1 byte and 10 MB.'}, 413, allowedOrigin);
    }

    const type = allowedTypes.get(photo.type);
    if (!type) {
      return jsonResponse({error: 'Only JPG, PNG, and WebP images are accepted.'}, 415, allowedOrigin);
    }

    const bytes = new Uint8Array(await photo.arrayBuffer());
    if (!type.signature(bytes)) {
      return jsonResponse({error: 'The file contents do not match an allowed image type.'}, 415, allowedOrigin);
    }

    if (!env.GITHUB_TOKEN || !env.TURNSTILE_SECRET_KEY) {
      return jsonResponse({error: 'Uploads are not configured yet.'}, 503, allowedOrigin);
    }

    let verified;
    try {
      verified = await verifyTurnstile(token, request, env);
    } catch {
      return jsonResponse({error: 'Verification is temporarily unavailable.'}, 503, allowedOrigin);
    }
    if (!verified) {
      return jsonResponse({error: 'Verification failed. Please try again.'}, 403, allowedOrigin);
    }

    const basename = photo.name
      .replace(/\.[^.]*$/, '')
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-_]+|[-_]+$/g, '')
      .slice(0, 60) || 'photo';
    const path = `images/uploads/${basename}-${crypto.randomUUID()}.${type.extension}`;
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${path}`;
    let githubResponse;
    try {
      githubResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Stillframe-photo-upload',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          message: 'Add public photo upload',
          content: toBase64(bytes),
          branch: env.GITHUB_BRANCH
        })
      });
    } catch {
      return jsonResponse({error: 'Could not save the image. Please try again later.'}, 502, allowedOrigin);
    }

    if (!githubResponse.ok) {
      return jsonResponse({error: 'Could not save the image. Please try again later.'}, 502, allowedOrigin);
    }

    return jsonResponse({message: 'Photo uploaded.', path}, 201, allowedOrigin);
  }
};
