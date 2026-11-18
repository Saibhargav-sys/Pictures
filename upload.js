const uploadForm = document.querySelector('#upload-form');
const choosePhoto = document.querySelector('#choose-photo');
const photoInput = document.querySelector('#photo-file');
const selectedFile = document.querySelector('#selected-file');
const submitUpload = document.querySelector('#submit-upload');
const uploadStatus = document.querySelector('#upload-status');
const uploadConfig = window.STILLFRAME_UPLOAD_CONFIG;
const maxFileSize = 10 * 1024 * 1024;
let turnstileWidget;
let turnstileToken = '';

function setUploadStatus(message, isError = false) {
  uploadStatus.textContent = message;
  uploadStatus.classList.toggle('error', isError);
}

function updateUploadButton() {
  submitUpload.disabled = !photoInput.files.length || !turnstileToken;
}

const uploadsConfigured = Boolean(uploadConfig.endpoint && uploadConfig.turnstileSiteKey);
if (!uploadsConfigured) {
  choosePhoto.disabled = true;
  setUploadStatus('Public uploads are being set up.');
}

choosePhoto.addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', () => {
  turnstileToken = '';
  if (window.turnstile && turnstileWidget !== undefined) {
    window.turnstile.reset(turnstileWidget);
  }

  const file = photoInput.files[0];
  if (!file) {
    selectedFile.textContent = '';
    submitUpload.hidden = true;
    return;
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    photoInput.value = '';
    selectedFile.textContent = '';
    submitUpload.hidden = true;
    setUploadStatus('Choose a JPG, PNG, or WebP image.', true);
    return;
  }

  if (file.size > maxFileSize) {
    photoInput.value = '';
    selectedFile.textContent = '';
    submitUpload.hidden = true;
    setUploadStatus('Images must be 10 MB or smaller.', true);
    return;
  }

  selectedFile.textContent = file.name;
  submitUpload.hidden = false;
  setUploadStatus('');
  updateUploadButton();
});

window.onStillframeTurnstileLoad = () => {
  if (!uploadsConfigured) {
    setUploadStatus('Public uploads are being set up.');
    submitUpload.disabled = true;
    return;
  }

  choosePhoto.disabled = false;
  turnstileWidget = window.turnstile.render('#turnstile-widget', {
    sitekey: uploadConfig.turnstileSiteKey,
    callback: token => {
      turnstileToken = token;
      updateUploadButton();
    },
    'expired-callback': () => {
      turnstileToken = '';
      updateUploadButton();
    },
    'error-callback': () => {
      turnstileToken = '';
      updateUploadButton();
      setUploadStatus('Verification could not load. Please try again later.', true);
    }
  });
};

uploadForm.addEventListener('submit', async event => {
  event.preventDefault();
  const file = photoInput.files[0];
  if (!file || !turnstileToken || !uploadConfig.endpoint) return;

  const body = new FormData();
  body.append('photo', file);
  body.append('turnstileToken', turnstileToken);
  submitUpload.disabled = true;
  choosePhoto.disabled = true;
  setUploadStatus('Uploading…');

  try {
    const response = await fetch(uploadConfig.endpoint, {
      method: 'POST',
      body
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Upload failed. Please try again.');
    }

    uploadForm.reset();
    selectedFile.textContent = '';
    submitUpload.hidden = true;
    turnstileToken = '';
    window.turnstile.reset(turnstileWidget);
    setUploadStatus('Photo uploaded. It will appear after the gallery updates.');
  } catch (error) {
    setUploadStatus(error.message || 'Upload failed. Please try again.', true);
    turnstileToken = '';
    if (window.turnstile && turnstileWidget !== undefined) {
      window.turnstile.reset(turnstileWidget);
    }
  } finally {
    choosePhoto.disabled = false;
    updateUploadButton();
  }
});
