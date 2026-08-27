/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters section boundaries + section metadata.
 * hero-landing template has 7 sections (page-templates.json).
 *
 * Expected outputs on the test page:
 *  - Section breaks (<hr>): 6  (one before every section except the first)
 *  - Section Metadata blocks: 4 (rc1=grey, rc3=grey, rc5=grey, rc7=inverse)
 *    rc2/rc4/rc6 have style=null → no metadata block.
 *
 * Section selectors come directly from page-templates.json (DOM-verified during analysis)
 * and match the captured DOM in migration-work/cleaned.html, e.g.:
 *   rc1 -> #main-content > header.section.secondary-section
 *   rc7 -> #main-content > section.section.inverse-section
 *
 * Uses BOTH hooks: breaks are inserted in beforeTransform (while every section element still
 * exists, before block parsers replace them), anchored via a temporary marker attribute so the
 * Section Metadata blocks can be attached reliably in afterTransform.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert <hr> breaks now, before parsers can replace any section element.
    // Reverse order so live-element inserts never shift not-yet-processed sections.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      // First section (rc1) gets no leading <hr>, but it IS styled (grey), so it still
      // needs a marker to anchor its metadata block in afterTransform.
      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have run and may have replaced section elements. Anchor each styled section's
    // Section Metadata block to the surviving marker <hr> (or the original element as fallback).
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        // rc1 is the first section: it never gets a real leading break, remove its marker <hr>.
        if (i === 0) marker.remove();
      }
    }
  }
}
