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

  // tools/importer/import-solutions.js
  var import_solutions_exports = {};
  __export(import_solutions_exports, {
    default: () => import_solutions_default
  });

  // tools/importer/parsers/cards-hub-tiles.js
  var SELECTOR = ".imageText.hubpage__tiles--view";
  function isFiller(p) {
    return !p.querySelector("img, picture") && !p.textContent.replace(/\u00a0/g, " ").trim();
  }
  function buildRow(tile, document) {
    const img = tile.querySelector("img");
    const heading = [...tile.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((h) => h.textContent.trim());
    const linkEl = heading && heading.querySelector("a[href]") || tile.querySelector("a[href]");
    const href = linkEl ? linkEl.getAttribute("href") : "";
    const imageCell = [];
    if (img) {
      const image = document.createElement("img");
      image.src = img.getAttribute("src");
      image.alt = img.getAttribute("alt") || "";
      imageCell.push(image);
    }
    const textCell = [];
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      const title = heading.textContent.replace(/\s+/g, " ").trim();
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = title;
        h.append(a);
      } else {
        h.textContent = title;
      }
      textCell.push(h);
    }
    const textCol = heading && heading.parentElement || tile;
    textCol.querySelectorAll("p").forEach((p) => {
      if (!isFiller(p)) textCell.push(p);
    });
    if (!imageCell.length && !textCell.length) return null;
    return [imageCell.length ? imageCell : "", textCell.length ? textCell : ""];
  }
  function parse(element, { document }) {
    if (!element.parentNode) return;
    const prev = element.previousElementSibling;
    if (prev && prev.matches(SELECTOR)) return;
    const tiles = [element];
    let next = element.nextElementSibling;
    while (next && next.matches(SELECTOR)) {
      tiles.push(next);
      next = next.nextElementSibling;
    }
    const cells = tiles.map((tile) => buildRow(tile, document)).filter(Boolean);
    tiles.slice(1).forEach((el) => el.remove());
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-hub-tiles", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-brands.js
  function isFiller2(p) {
    return !p.querySelector("img, picture") && !p.textContent.replace(/\u00a0/g, " ").trim();
  }
  function stripLeadingBreaks(p) {
    let node = p.firstChild;
    while (node) {
      const nextNode = node.nextSibling;
      if (node.nodeType === 3 && !node.textContent.replace(/\u00a0/g, " ").trim()) {
        node.remove();
      } else if (node.nodeType === 1 && node.tagName === "BR") {
        node.remove();
      } else {
        if (node.nodeType === 3) node.textContent = node.textContent.replace(/^\s+/, "");
        break;
      }
      node = nextNode;
    }
  }
  function buildColumn(col, document) {
    const content = [];
    const img = col.querySelector("img");
    if (img) {
      const image = document.createElement("img");
      image.src = img.getAttribute("src");
      image.alt = img.getAttribute("alt") || "";
      const link = img.closest("a[href]");
      if (link) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.append(image);
        content.push(a);
      } else {
        content.push(image);
      }
    }
    col.querySelectorAll(".customrte p, .text p").forEach((p) => {
      if (content.includes(p) || isFiller2(p)) return;
      stripLeadingBreaks(p);
      content.push(p);
    });
    return content.length ? content : "";
  }
  function parse2(element, { document }) {
    let cols = [...element.querySelectorAll('.containercustom > .row > [class*="col-"]')];
    if (!cols.length) cols = [...element.querySelectorAll('.row > [class*="col-"]')];
    const row = cols.map((col) => buildColumn(col, document)).filter((c) => c !== "");
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-brands", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/lcn-cleanup.js
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      removeAll(element, [
        ".cmp-page__skiptomaincontent",
        // Only the global header/footer fragments; in-page fragments (Allegion promo) reuse the class.
        "body > div.xf-content-height",
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        "#mktoStyleLoaded",
        "form.mktoForm",
        "#MktoForms2XDIframe",
        "#newsletter-modal",
        "#searchModal",
        ".inbenta-search-results",
        // Breadcrumb trail is site chrome, not authored content.
        ".cmp-breadcrumb"
      ]);
    }
    if (hookName === "afterTransform") {
      removeAll(element, [
        "header",
        "footer",
        "nav",
        "script",
        "style",
        "noscript",
        "link",
        "iframe",
        "form.mktoForm",
        "#onetrust-consent-sdk",
        ".cmp-page__skiptomaincontent",
        // Product detail chrome: back/share/print row, empty finish picker, empty ratings.
        // Removed after parsing because the product intro section selector anchors on .upperRow.
        ".default-product-detail-component .upperRow",
        ".default-product-detail-component .finisheImgsRow",
        ".default-product-detail-component .productRatingRow",
        // Decorative line-drawing section backgrounds left over after the hero parsers ran.
        'div.background-image > div[class*="backgroundImage"] > img'
      ]);
      element.querySelectorAll('div.background-image, div.background-image > div[class*="backgroundImage"]').forEach((el) => {
        el.style.backgroundImage = "none";
      });
      element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        if (!h.textContent.trim() && !h.querySelector("img, picture")) h.remove();
      });
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        const m = href.match(/^https?:\/\/(www\.)?lcnclosers\.com\/+(.*)$/i);
        if (m) a.setAttribute("href", `/${m[2]}`);
      });
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("data-cmp-") || n.startsWith("data-analytics") || n.startsWith("data-track") || n === "onclick") {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/transformers/lcn-sections.js
  var MARKER = "data-excat-section-id";
  var EL_MARKER = "data-excat-section-el";
  function findSection(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
      if (sel) {
        try {
          const el = root.querySelector(sel);
          if (el) return el;
        } catch (e) {
        }
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const document = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSection(element, section);
        if (el && (i > 0 || section.style)) {
          const hr = document.createElement("hr");
          if (section.style) {
            hr.setAttribute(MARKER, section.id);
            el.setAttribute(EL_MARKER, section.id);
          }
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (section.style) {
          const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
          const meta = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          const sectionEl = element.querySelector(`[${EL_MARKER}="${section.id}"]`);
          let anchor = null;
          if (sectionEl) {
            sectionEl.appendChild(meta);
            sectionEl.removeAttribute(EL_MARKER);
            anchor = marker;
          } else if (marker) {
            let n = marker.nextElementSibling;
            while (n && n.tagName !== "HR") n = n.nextElementSibling;
            if (n) {
              n.parentNode.insertBefore(meta, n);
            } else {
              const surviving = findSection(element, section);
              if (surviving && surviving.parentNode === marker.parentNode) {
                surviving.after(meta);
              } else {
                marker.parentNode.appendChild(meta);
              }
            }
            anchor = marker;
          } else {
            const surviving = findSection(element, section);
            if (surviving) surviving.after(meta);
          }
          if (anchor) {
            if (i === 0) anchor.remove();
            else anchor.removeAttribute(MARKER);
          }
        }
      }
    }
  }

  // tools/importer/import-solutions.js
  var PAGE_TEMPLATE = {
    "name": "solutions",
    "urls": [
      "https://www.lcnclosers.com/en/solutions.html",
      "https://www.lcnclosers.com/en/resources.html"
    ],
    "representativeUrl": "https://www.lcnclosers.com/en/solutions.html",
    "description": "LCN solutions hub: page title, intro + stacked solution tiles on light grey, related brands on a blue gradient",
    "blocks": [
      {
        "name": "cards-hub-tiles",
        "instances": [
          "#resources-container .imageText.hubpage__tiles--view"
        ]
      },
      {
        "name": "columns-brands",
        "instances": [
          "#simple-related-brands .columnselector"
        ]
      }
    ],
    "urlPattern": "/en/*",
    "sections": [
      {
        "id": "section-1",
        "name": "Page Title",
        "selector": [
          "#root-main > div.aem-Grid > div.contentcontainer"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "#root-main > div.aem-Grid > div.contentcontainer .cmp-title"
        ]
      },
      {
        "id": "section-2",
        "name": "Solutions Hub Tiles",
        "selector": [
          "#resources-container"
        ],
        "style": "light-grey",
        "blocks": [
          "cards-hub-tiles"
        ],
        "defaultContent": [
          "#resources-container div.col-xs-12 > div > div.allegion-container"
        ]
      },
      {
        "id": "section-3",
        "name": "Related Brands",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-xf.experiencefragment"
        ],
        "style": "blue-gradient, centered",
        "blocks": [
          "columns-brands"
        ],
        "defaultContent": [
          "#simple-related-brands h3"
        ]
      }
    ]
  };
  var parsers = {
    "cards-hub-tiles": parse,
    "columns-brands": parse2
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_solutions_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "").replace(/^\/en\/index$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_solutions_exports);
})();
