const grid = document.querySelector('#photo-grid');
const dialog = document.querySelector('#lightbox');
const viewerImage = document.querySelector('#viewer-image');
let photos = [];
let current = 0;

async function loadPhotos() {
  const response = await fetch('photos.json');
  if (!response.ok) {
    throw new Error(`Could not load photos.json (${response.status})`);
  }

  photos = await response.json();
  if (!Array.isArray(photos)) {
    throw new Error('photos.json must contain a list of photos');
  }

  render();
}

function render() {
  grid.replaceChildren();
  grid.setAttribute('aria-busy', 'false');

  if (photos.length === 0) {
    grid.textContent = 'No photos yet. Add images to the images folder to get started.';
    grid.classList.add('empty');
    return;
  }

  grid.classList.remove('empty');
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

    const caption = document.createElement('figcaption');
    caption.textContent = photo.title;
    button.append(image, caption);
    button.addEventListener('click', () => openPhoto(index));
    card.append(button);
    grid.append(card);
  });
}

function showPhoto() {
  const photo = photos[current];
  viewerImage.src = photo.src;
  viewerImage.alt = photo.title;
  document.querySelector('#viewer-title').textContent = photo.title;
  document.querySelector('#viewer-index').textContent = `${current + 1} / ${photos.length}`;
}

function openPhoto(index) {
  current = index;
  showPhoto();
  dialog.showModal();
}

function move(step) {
  current = (current + step + photos.length) % photos.length;
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
  grid.setAttribute('aria-busy', 'false');
  grid.textContent = 'Photos could not be loaded. Please try again later.';
  console.error(error);
});
