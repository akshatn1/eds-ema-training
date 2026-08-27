/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion-faq
 * Base block: accordion
 * Source: https://wknd-trendsetters.site/ (hero-landing template)
 * Generated: 2026-08-27
 *
 * Library structure (Accordion): 2 columns, one row per item.
 *   Cell 1: Title (clickable label, mandatory).
 *   Cell 2: Content (body shown when expanded, mandatory).
 * The block JS (blocks/accordion-faq/accordion-faq.js) uses row.children[0] as the
 * summary label and row.children[1] as the body.
 * Source: each item is <details class="faq-item"> with a <summary class="faq-question">
 * (contains a <span> label + toggle icon) and a <div class="faq-answer"> body.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > details.faq-item, :scope > .faq-item'));

  // Empty-block guard.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const summary = item.querySelector('summary, .faq-question');
    const answer = item.querySelector('.faq-answer');

    // Title cell: prefer the question text (drop the toggle icon image).
    const label = summary ? (summary.querySelector('span') || summary) : null;
    const titleCell = label ? label.textContent.trim() : '';

    // Content cell: the answer body.
    const contentCell = answer ? Array.from(answer.childNodes) : '';

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
