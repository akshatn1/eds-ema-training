const SLIDESHOW_DELAY = 3500;

function getImageData(row, index) {
  const image = row.querySelector('img');
  if (!image) return null;

  const media = image.closest('picture') || image;
  const captionCell = [...row.children].find((cell) => !cell.contains(image));
  const caption = captionCell?.textContent.trim() || '';
  const alt = image.alt.trim() || caption || `Gallery image ${index + 1}`;

  image.alt = alt;
  return {
    alt,
    caption,
    media,
  };
}

function createIconButton(className, label, icon) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);

  const symbol = document.createElement('span');
  symbol.setAttribute('aria-hidden', 'true');
  symbol.textContent = icon;
  button.append(symbol);
  return button;
}

function createDialog(images, galleryId) {
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-gallery-dialog';
  dialog.setAttribute('aria-label', 'Photo gallery viewer');

  const viewer = document.createElement('div');
  viewer.className = 'photo-gallery-dialog-viewer';

  const toolbar = document.createElement('div');
  toolbar.className = 'photo-gallery-dialog-toolbar';

  const counter = document.createElement('p');
  counter.className = 'photo-gallery-dialog-counter';
  counter.setAttribute('aria-live', 'polite');

  const playButton = createIconButton('photo-gallery-dialog-play', 'Start slideshow', '\u25b6');
  const closeButton = createIconButton('photo-gallery-dialog-close', 'Close gallery', '\u00d7');
  toolbar.append(counter, playButton, closeButton);

  const stage = document.createElement('div');
  stage.className = 'photo-gallery-dialog-stage';
  const previousButton = createIconButton('photo-gallery-dialog-nav previous', 'Previous image', '\u2039');
  const nextButton = createIconButton('photo-gallery-dialog-nav next', 'Next image', '\u203a');

  const figure = document.createElement('figure');
  figure.className = 'photo-gallery-dialog-figure';
  const media = document.createElement('div');
  media.className = 'photo-gallery-dialog-media';
  const caption = document.createElement('figcaption');
  caption.id = `${galleryId}-dialog-caption`;
  figure.append(media, caption);
  stage.append(previousButton, figure, nextButton);

  const thumbnails = document.createElement('div');
  thumbnails.className = 'photo-gallery-dialog-thumbnails';
  thumbnails.setAttribute('aria-label', 'Choose an image');

  const thumbnailButtons = images.map((image, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-gallery-dialog-thumbnail';
    button.setAttribute('aria-label', `Show image ${index + 1}: ${image.caption || image.alt}`);

    const thumbnailMedia = image.media.cloneNode(true);
    thumbnailMedia.querySelector?.('img')?.setAttribute('alt', '');
    button.append(thumbnailMedia);
    thumbnails.append(button);
    return button;
  });

  viewer.append(toolbar, stage, thumbnails);
  dialog.append(viewer);

  let currentIndex = 0;
  let slideshowInterval;

  const stopSlideshow = () => {
    if (slideshowInterval) window.clearInterval(slideshowInterval);
    slideshowInterval = undefined;
    playButton.classList.remove('playing');
    playButton.setAttribute('aria-label', 'Start slideshow');
    playButton.querySelector('span').textContent = '\u25b6';
  };

  const showImage = (index, stopPlayback = true) => {
    if (stopPlayback) stopSlideshow();
    currentIndex = (index + images.length) % images.length;
    const current = images[currentIndex];
    const currentMedia = current.media.cloneNode(true);
    const currentImage = currentMedia.matches?.('img')
      ? currentMedia
      : currentMedia.querySelector('img');
    if (currentImage) currentImage.alt = current.alt;

    media.replaceChildren(currentMedia);
    caption.textContent = current.caption;
    caption.hidden = !current.caption;
    counter.textContent = `${currentIndex + 1} of ${images.length}`;

    thumbnailButtons.forEach((button, thumbnailIndex) => {
      const isCurrent = thumbnailIndex === currentIndex;
      button.classList.toggle('current', isCurrent);
      button.setAttribute('aria-current', isCurrent ? 'true' : 'false');
      if (isCurrent) button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  };

  const startSlideshow = () => {
    playButton.classList.add('playing');
    playButton.setAttribute('aria-label', 'Pause slideshow');
    playButton.querySelector('span').textContent = '\u275a\u275a';
    slideshowInterval = window.setInterval(
      () => showImage(currentIndex + 1, false),
      SLIDESHOW_DELAY,
    );
  };

  previousButton.addEventListener('click', () => showImage(currentIndex - 1));
  nextButton.addEventListener('click', () => showImage(currentIndex + 1));
  thumbnailButtons.forEach((button, index) => {
    button.addEventListener('click', () => showImage(index));
  });
  playButton.addEventListener('click', () => {
    if (slideshowInterval) stopSlideshow();
    else startSlideshow();
  });
  closeButton.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', ({ target }) => {
    if (target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(currentIndex + 1);
    }
  });
  dialog.addEventListener('close', stopSlideshow);
  dialog.addEventListener('cancel', stopSlideshow);

  return {
    dialog,
    open(index) {
      showImage(index);
      dialog.showModal();
      closeButton.focus();
    },
  };
}

/**
 * Decorates a grid of authored images with an accessible lightbox and slideshow.
 * @param {Element} block The photo gallery block.
 */
export default function decorate(block) {
  const images = [...block.children]
    .map((row, index) => getImageData(row, index))
    .filter(Boolean);
  if (!images.length) return;

  const galleryId = `photo-gallery-${Math.random().toString(36).slice(2, 9)}`;
  const grid = document.createElement('div');
  grid.className = 'photo-gallery-grid';

  const { dialog, open } = createDialog(images, galleryId);
  images.forEach((image, index) => {
    const figure = document.createElement('figure');
    figure.className = 'photo-gallery-item';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-gallery-trigger';
    button.setAttribute('aria-label', `Open image ${index + 1}: ${image.caption || image.alt}`);
    button.append(image.media);

    figure.append(button);
    if (image.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = image.caption;
      figure.append(caption);
    }
    grid.append(figure);
    button.addEventListener('click', () => open(index));
  });

  block.replaceChildren(grid);
  block.after(dialog);
}
