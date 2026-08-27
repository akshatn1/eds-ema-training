/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (cards-grid)
const PAGE_TEMPLATE = {
  name: 'cards-grid',
  description: 'Category page with a hero followed by a repeating grid of cards (heading, text, image) and closing CTA sections',
  urls: [
    'https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport',
  ],
  blocks: [
    {
      name: 'columns',
      instances: [
        '#main-content > header.section.secondary-section .grid-layout.grid-gap-xxl',
        '#main-content > section.section.secondary-section .grid-layout.grid-gap-lg',
      ],
    },
    {
      name: 'cards',
      instances: [
        '#trends .grid-layout.desktop-4-column.grid-gap-md',
      ],
    },
  ],
  sections: [
    {
      id: 'rc1', name: 'Intro hero', selector: '#main-content > header.section.secondary-section', style: 'grey', blocks: ['columns'], defaultContent: [],
    },
    {
      id: 'rc2', name: 'Trend alert card grid', selector: '#trends', style: null, blocks: ['cards'], defaultContent: ['#trends > div.container > div.utility-text-align-center'],
    },
    {
      id: 'rc3', name: 'Blog teaser', selector: '#main-content > section.section.secondary-section', style: 'grey', blocks: ['columns'], defaultContent: [],
    },
    {
      id: 'rc4', name: 'Closing CTA', selector: '#main-content > section.section.accent-section', style: 'accent', blocks: [], defaultContent: ['#main-content > section.section.accent-section .container'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  columns: columnsParser,
  cards: cardsParser,
};

// TRANSFORMER REGISTRY - cleanup first, sections after (sections run in afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - DOM element to transform (typically document.body)
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Restore any carousel-collapsed card grids from the pristine same-origin server HTML.
 *
 * The source category page ships all cards in its server HTML, but a client-side
 * carousel script collapses the #trends card grid to a single active slide shortly
 * after load — removing the other cards from the DOM before our parser runs (the
 * collapse fires asynchronously, so restoring at onLoad time is futile: it re-collapses).
 * We re-fetch the raw HTML and, with NO further await before parsing, overwrite the
 * collapsed grid so the cards parser sees every card. Best-effort: failures are ignored.
 * @param {Document} document
 */
async function restoreCollapsedGrids(document) {
  try {
    const gridSelector = '#trends .grid-layout.desktop-4-column.grid-gap-md';
    const liveGrid = document.querySelector(gridSelector);
    if (!liveGrid) return;

    const res = await fetch(window.location.href, { cache: 'no-store' });
    if (!res.ok) return;
    const rawHtml = await res.text();
    // No awaits past this point — parsing runs synchronously right after, so the
    // carousel script can't re-collapse the grid before block discovery.
    const rawDoc = new DOMParser().parseFromString(rawHtml, 'text/html');
    const rawGrid = rawDoc.querySelector(gridSelector);
    if (!rawGrid) return;

    const rawCards = rawGrid.querySelectorAll('a[class*="-card"]').length;
    const liveCards = liveGrid.querySelectorAll('a[class*="-card"]').length;
    if (rawCards > liveCards) {
      liveGrid.innerHTML = rawGrid.innerHTML;
    }
  } catch (e) {
    console.error('restoreCollapsedGrids failed:', e);
  }
}

// EXPORT DEFAULT CONFIGURATION
export default {
  /**
   * Main transformation function (Helix Importer one-input/multiple-outputs).
   * Async so it can restore carousel-collapsed grids before block discovery.
   */
  transform: async (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 0. Restore any card grid the source carousel collapsed after load (await first,
    //    then everything below runs synchronously so the grid can't re-collapse).
    await restoreCollapsedGrids(document);

    // 1. beforeTransform transformers (initial cleanup + section markers)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path; map root URL to /index to avoid empty-path crash
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
