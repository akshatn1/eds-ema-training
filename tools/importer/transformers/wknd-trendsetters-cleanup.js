/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html.
 *
 * Non-authorable site chrome found in captured DOM:
 *  - <a href="#main-content" class="skip-link">          (skip link)
 *  - <div class="navbar"> ... </div>                     (top nav / header shell, incl. mega menu, mobile toggle)
 *  - <footer class="footer inverse-footer"> ... </footer> (site footer)
 *  - <img src="data:image/svg+xml;base64,...">           (decorative inline SVG icons: nav carets, social icons, faq +, button arrows)
 *  - data-astro-cid-* attributes on <body> and various SVG-derived elements (Astro build artifacts)
 *
 * NOTE: the first authorable content section rc1 is <header class="section secondary-section">
 * INSIDE #main-content. We must NOT remove the `header` tag broadly — only the specific
 * `.navbar` shell. `main` scoping in the import pipeline already limits us to #main-content,
 * but selectors here are intentionally specific to avoid touching that content <header>.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove non-authorable site chrome before block parsing so it never interferes
    // with block matching. Selectors from captured DOM.
    WebImporter.DOMUtils.remove(element, [
      '.skip-link',   // <a class="skip-link">Skip to main content</a>
      '.navbar',      // top navigation / header shell
      'footer.footer',// site footer
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Belt-and-suspenders: remove chrome again in case the pipeline scopes element to #main-content
    // (where .navbar/footer may not exist) or content was re-parented during parsing.
    WebImporter.DOMUtils.remove(element, [
      '.skip-link',
      '.navbar',
      'footer.footer',
    ]);

    // Remove decorative inline data-URI / base64 SVG icons (non-authorable).
    // Real content images use ./images/*.png or absolute https src, so this only strips icons.
    element.querySelectorAll('img[src^="data:"]').forEach((img) => img.remove());

    // Strip Astro build artifact attributes (data-astro-cid-*) from every element.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-astro-cid-')) el.removeAttribute(attr.name);
      });
    });

    // Remove the decorative empty overlay wrapper in the closing hero (rc7) — visual gradient,
    // non-authorable, holds no content. Found as <div class="overlay utility-z-index-1"></div>.
    element.querySelectorAll('.overlay').forEach((el) => {
      if (el.children.length === 0 && !el.textContent.trim()) el.remove();
    });
  }
}
