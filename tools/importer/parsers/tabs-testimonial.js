/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs-testimonial
 * Base block: tabs
 * Source: https://wknd-trendsetters.site/ (hero-landing template)
 * Generated: 2026-08-27
 *
 * Library structure (Tabs): 2 columns, one row per tab.
 *   Cell 1: Tab label (mandatory).
 *   Cell 2: Tab content (mandatory).
 * The block JS (blocks/tabs-testimonial/tabs-testimonial.js) uses the first cell of
 * each row as the tab button and the remainder as the panel.
 * Source has parallel structures: `.tab-menu .tab-menu-link` buttons (labels: avatar +
 * name + role) and `.tabs-content .tab-pane` panes (content: image + name/role + quote),
 * matched by order.
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane'));
  const buttons = Array.from(element.querySelectorAll('.tab-menu > .tab-menu-link'));

  // Empty-block guard.
  if (!panes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  panes.forEach((pane, i) => {
    const button = buttons[i];
    // Label cell: content of the matching tab-menu button (name + role), falling back
    // to a plain index label if the button is missing.
    const labelCell = button
      ? Array.from(button.childNodes)
      : document.createTextNode(`Tab ${i + 1}`);
    // Content cell: the pane's inner content (image, name/role, quote).
    const contentCell = Array.from(pane.childNodes);
    cells.push([labelCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-testimonial', cells });
  element.replaceWith(block);
}
