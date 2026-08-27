/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns
 * Source: https://wknd-trendsetters.site/ (hero-landing template)
 * Generated: 2026-08-27
 *
 * Library structure: flexible grid. First row = block name (added by createBlock).
 * Subsequent row(s) hold as many cells as there are natural columns.
 * Source has a single grid-layout whose direct child <div>s are the columns
 * (e.g. a text column with heading/subheading/CTAs and an image column).
 */
export default function parse(element, { document }) {
  // Each direct child <div> of the grid becomes a column cell.
  const columns = Array.from(element.querySelectorAll(':scope > div'));

  // Empty-block guard.
  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single content row: one cell per column, each cell holding that column's elements.
  cells.push(columns.map((col) => Array.from(col.childNodes)));

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
