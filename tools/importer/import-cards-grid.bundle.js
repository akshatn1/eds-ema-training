/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-cards-grid.js
  var import_cards_grid_exports = {};
  __export(import_cards_grid_exports, {
    default: () => import_cards_grid_default
  });

  // tools/importer/parsers/columns.js
  function parse(element, { document: document2 }) {
    const columns = Array.from(element.querySelectorAll(":scope > div"));
    if (!columns.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push(columns.map((col) => Array.from(col.childNodes)));
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(':scope > a[class*="-card"], :scope > [class*="-card"]'));
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(":scope > a"));
    }
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector('[class*="-card-image"] img, img');
      const body = card.querySelector('[class*="-card-body"]');
      const href = card.getAttribute("href");
      const heading = body ? body.querySelector("h1, h2, h3, h4, h5, h6") : null;
      if (href && heading) {
        const link = document2.createElement("a");
        link.href = href;
        while (heading.firstChild) link.appendChild(heading.firstChild);
        heading.appendChild(link);
      }
      const textCell = [];
      if (body) textCell.push(...Array.from(body.childNodes));
      cells.push([img || "", textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-trendsetters-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".skip-link",
        // <a class="skip-link">Skip to main content</a>
        ".navbar",
        // top navigation / header shell
        "footer.footer"
        // site footer
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".skip-link",
        ".navbar",
        "footer.footer"
      ]);
      element.querySelectorAll('img[src^="data:"]').forEach((img) => img.remove());
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name.startsWith("data-astro-cid-")) el.removeAttribute(attr.name);
        });
      });
      element.querySelectorAll(".overlay").forEach((el) => {
        if (el.children.length === 0 && !el.textContent.trim()) el.remove();
      });
    }
  }

  // tools/importer/transformers/wknd-trendsetters-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-cards-grid.js
  var PAGE_TEMPLATE = {
    name: "cards-grid",
    description: "Category page with a hero followed by a repeating grid of cards (heading, text, image) and closing CTA sections",
    urls: [
      "https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport"
    ],
    blocks: [
      {
        name: "columns",
        instances: [
          "#main-content > header.section.secondary-section .grid-layout.grid-gap-xxl",
          "#main-content > section.section.secondary-section .grid-layout.grid-gap-lg"
        ]
      },
      {
        name: "cards",
        instances: [
          "#trends .grid-layout.desktop-4-column.grid-gap-md"
        ]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Intro hero",
        selector: "#main-content > header.section.secondary-section",
        style: "grey",
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "Trend alert card grid",
        selector: "#trends",
        style: null,
        blocks: ["cards"],
        defaultContent: ["#trends > div.container > div.utility-text-align-center"]
      },
      {
        id: "rc3",
        name: "Blog teaser",
        selector: "#main-content > section.section.secondary-section",
        style: "grey",
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Closing CTA",
        selector: "#main-content > section.section.accent-section",
        style: "accent",
        blocks: [],
        defaultContent: ["#main-content > section.section.accent-section .container"]
      }
    ]
  };
  var parsers = {
    columns: parse,
    cards: parse2
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function restoreCollapsedGrids(document2) {
    return __async(this, null, function* () {
      try {
        const gridSelector = "#trends .grid-layout.desktop-4-column.grid-gap-md";
        const liveGrid = document2.querySelector(gridSelector);
        if (!liveGrid) return;
        const res = yield fetch(window.location.href, { cache: "no-store" });
        if (!res.ok) return;
        const rawHtml = yield res.text();
        const rawDoc = new DOMParser().parseFromString(rawHtml, "text/html");
        const rawGrid = rawDoc.querySelector(gridSelector);
        if (!rawGrid) return;
        const rawCards = rawGrid.querySelectorAll('a[class*="-card"]').length;
        const liveCards = liveGrid.querySelectorAll('a[class*="-card"]').length;
        if (rawCards > liveCards) {
          liveGrid.innerHTML = rawGrid.innerHTML;
        }
      } catch (e) {
        console.error("restoreCollapsedGrids failed:", e);
      }
    });
  }
  var import_cards_grid_default = {
    /**
     * Main transformation function (Helix Importer one-input/multiple-outputs).
     * Async so it can restore carousel-collapsed grids before block discovery.
     */
    transform: (payload) => __async(void 0, null, function* () {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      yield restoreCollapsedGrids(document2);
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    })
  };
  return __toCommonJS(import_cards_grid_exports);
})();
