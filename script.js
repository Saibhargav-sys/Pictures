const spotlightGrid = document.querySelector('#spotlight-grid');
const grid = document.querySelector('#photo-grid');
const dialog = document.querySelector('#lightbox');
const viewerImage = document.querySelector('#viewer-image');
let currentPhotos = [];
let current = 0;

async function loadPhotos() {
  const response = await fetch('photos.json');
  if (!response.ok) {
    throw new Error(`Could not load photos.json (${response.status})`);
  }

  const photos = await response.json();
  if (!Array.isArray(photos)) {
    throw new Error('photos.json must contain a list of photos');
  }

  render(spotlightGrid, photos.filter(photo => photo.spotlight));
  render(grid, photos);
}

function render(target, photos) {
  target.replaceChildren();
  target.setAttribute('aria-busy', 'false');

  if (photos.length === 0) {
    target.classList.add('empty');
    target.textContent = target === spotlightGrid
      ? 'No spotlight photos yet.'
      : 'No photos yet.';
    return;
  }

  target.classList.remove('empty');
  photos.forEach((photo, index) => {
    const card = document.createElement('figure');
    card.className = 'photo-card';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `View ${photo.title}`);

    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.title;
    image.loading = 'lazy';
    image.decoding = 'async';

    button.append(image);
    button.addEventListener('click', () => openPhoto(photos, index));
    card.append(button);
    target.append(card);
  });
}

function showPhoto() {
  const photo = currentPhotos[current];
  viewerImage.src = photo.src;
  viewerImage.alt = photo.title;
  document.querySelector('#viewer-title').textContent = photo.title;
  document.querySelector('#viewer-index').textContent = `${current + 1} / ${currentPhotos.length}`;
}

function openPhoto(photos, index) {
  currentPhotos = photos;
  current = index;
  showPhoto();
  dialog.showModal();
}

function move(step) {
  current = (current + step + currentPhotos.length) % currentPhotos.length;
  showPhoto();
}

document.querySelector('#close-viewer').addEventListener('click', () => dialog.close());
document.querySelector('#prev-photo').addEventListener('click', () => move(-1));
document.querySelector('#next-photo').addEventListener('click', () => move(1));
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
document.addEventListener('keydown', event => {
  if (!dialog.open) return;
  if (event.key === 'ArrowLeft') move(-1);
  if (event.key === 'ArrowRight') move(1);
});

loadPhotos().catch(error => {
  for (const target of [spotlightGrid, grid]) {
    target.setAttribute('aria-busy', 'false');
    target.classList.add('empty');
    target.textContent = 'Photos could not be loaded.';
  }
  console.error(error);
});
