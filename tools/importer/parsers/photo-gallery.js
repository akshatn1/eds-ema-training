/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: photo-gallery
 * Base block: photo-gallery (custom — no library convention available)
 * Source: https://wknd-trendsetters.site/ (hero-landing template)
 * Generated: 2026-08-27
 *
 * Structure derived from blocks/photo-gallery/photo-gallery.js: the block reads
 * one image per row. Table is 1 column, one row per gallery image, each cell
 * holding the image (and optional caption text).
 */
export default function parse(element, { document }) {
  // Each direct child cell in the grid contains one image.
  const items = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    if (img) cells.push([img]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'photo-gallery', cells });
  element.replaceWith(block);
}
