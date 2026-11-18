# Stillframe

A simple photo gallery hosted on GitHub Pages.

## Public uploads

Visitors can upload photos from the **Explore** page. Uploads are published immediately; the site has no delete control. Uploaded files are public. Only JPG, PNG, and WebP files up to 10 MB are accepted. Turnstile verification and a five-uploads-per-minute per-IP limit help reduce abuse.

The upload service uses Cloudflare Workers to write files to this repository. The website never receives the GitHub token. The free Cloudflare plan is subject to Cloudflare's current limits.

### One-time setup

1. Create a Cloudflare account and a Turnstile widget for `saibhargav-sys.github.io`. Keep the Turnstile secret key private.
2. Create a GitHub fine-grained personal access token for **only** `Saibhargav-sys/Pictures`, with **Contents: Read and write** permission. Never put this token in the website or share it in chat.
3. From the repository root, sign in and deploy the Worker:

   ```sh
   npx wrangler@4 login
   npx wrangler@4 deploy --config cloudflare/wrangler.toml
   npx wrangler@4 secret put GITHUB_TOKEN --config cloudflare/wrangler.toml
   npx wrangler@4 secret put TURNSTILE_SECRET_KEY --config cloudflare/wrangler.toml
   ```

   Paste each secret only at Wrangler's private prompt. The deploy output shows the Worker URL.
4. In `upload-config.js`, set `endpoint` to the Worker URL followed by `/upload`, and set `turnstileSiteKey` to the Turnstile **site key** (not its secret key).
5. Commit and push `upload-config.js` to `main`. Once GitHub Pages finishes deploying, the upload form is active.

To remove an upload, delete its file from `images/uploads/` on GitHub and commit the change. There is intentionally no delete option for visitors.

## Manual upload from GitHub

If you prefer, add photos manually using GitHub's website:

1. Open the [images folder](https://github.com/Saibhargav-sys/Pictures/tree/main/images) in your browser to add photos to Explore, or the [Spotlight folder](https://github.com/Saibhargav-sys/Pictures/tree/main/images/spotlight) to feature selected photos on Home.
2. Select **Add file → Upload files** and choose photos from your device.
3. Commit the upload to `main`.
4. Wait for the **Deploy to GitHub Pages** workflow to finish. The photos will then appear on the site.

Photos in Explore also appear in Spotlight when uploaded to `images/spotlight/`. Keep images reasonably small for faster page loads.

## Local preview

Run `python3 -m http.server 8000` from the repository root and open `http://localhost:8000`. To preview newly added images locally, run `python3 scripts/build-photo-manifest.py` first.
