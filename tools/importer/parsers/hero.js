/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: https://wknd-trendsetters.site/ (hero-landing template)
 * Generated: 2026-08-27
 *
 * Library structure (Hero): 1 column, up to 3 rows.
 *   Row 1: block name (added by createBlock).
 *   Row 2: background image (optional) — single cell.
 *   Row 3: title (heading), subheading, CTA — single cell.
 * Source: a relative-positioned card with a cover-image background, an overlay,
 * and a .card-body containing the heading, subheading paragraph, and button-group.
 */
export default function parse(element, { document }) {
  const bgImage = element.querySelector('img.cover-image, img[class*="overlay"], img');
  const body = element.querySelector('.card-body') || element;

  const heading = body.querySelector('h1, h2, h3, .h1-heading, [class*="heading"]');
  const subheading = body.querySelector('p, .subheading');
  const ctas = Array.from(body.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard.
  if (!heading && !subheading && !ctas.length && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (single cell), only when present.
  if (bgImage) cells.push([bgImage]);

  // Row 3: text content collected into ONE cell (hero is single-column).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctas);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
