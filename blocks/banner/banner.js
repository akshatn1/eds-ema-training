/**
 * Decorates the banner block.
 * Expected authoring model: an image row followed by a title row.
 * @param {Element} block the banner block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const mediaCell = cells.find((cell) => cell.querySelector('picture, img')) || cells[0];
  const contentCell = cells.find((cell) => (
    cell !== mediaCell && cell.textContent.trim()
  )) || cells[1];

  mediaCell?.classList.add('banner-media');
  contentCell?.classList.add('banner-content');

  const image = mediaCell?.querySelector('img');
  if (image && !image.alt) image.alt = '';

  const title = contentCell?.querySelector('h1, h2, h3, h4, h5, h6');
  if (!title && contentCell?.textContent.trim()) {
    const heading = document.createElement('h2');
    heading.textContent = contentCell.textContent.trim();
    contentCell.replaceChildren(heading);
  }

  if (mediaCell && contentCell) block.replaceChildren(mediaCell, contentCell);
}
