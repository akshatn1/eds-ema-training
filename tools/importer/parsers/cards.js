/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards
 * Base block: cards
 * Source: https://wknd-trendsetters.site/ (hero-landing template)
 * Generated: 2026-08-27
 *
 * Library structure (Cards): 2 columns, one row per card.
 *   Cell 1: image/icon (mandatory).
 *   Cell 2: text content — title (heading), description, and CTA link.
 * Source: each card is an <a> (e.g. .article-card on blog/index pages, or
 * .trend-card on category pages) wrapping an image div (*-card-image) and a
 * body (*-card-body) with meta tags/date, a heading, and an optional
 * description. The card link href becomes the CTA.
 */
export default function parse(element, { document }) {
  // Match any direct-child card link, regardless of the site's card-class prefix
  // (article-card, trend-card, etc.). Fall back to any direct-child anchor.
  let cards = Array.from(element.querySelectorAll(':scope > a[class*="-card"], :scope > [class*="-card"]'));
  if (!cards.length) {
    cards = Array.from(element.querySelectorAll(':scope > a'));
  }

  // Empty-block guard.
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cards.forEach((card) => {
    const img = card.querySelector('[class*="-card-image"] img, img');
    const body = card.querySelector('[class*="-card-body"]');

    // Preserve the card's destination by turning its heading into a link
    // (avoids duplicating heading text with a separate CTA).
    const href = card.getAttribute('href');
    const heading = body ? body.querySelector('h1, h2, h3, h4, h5, h6') : null;
    if (href && heading) {
      const link = document.createElement('a');
      link.href = href;
      while (heading.firstChild) link.appendChild(heading.firstChild);
      heading.appendChild(link);
    }

    const textCell = [];
    if (body) textCell.push(...Array.from(body.childNodes));

    cells.push([img || '', textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
