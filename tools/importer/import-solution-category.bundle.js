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

  // tools/importer/import-solution-category.js
  var import_solution_category_exports = {};
  __export(import_solution_category_exports, {
    default: () => import_solution_category_default
  });

  // tools/importer/parsers/cards-category.js
  var ROW_SELECTOR = ".columnselector";
  function isCardRow(el) {
    return !!el && el.matches(ROW_SELECTOR) && !!el.querySelector(".imageText");
  }
  function cleanText(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function cleanParagraph(p) {
    const clone = p.cloneNode(true);
    clone.querySelectorAll("a").forEach((a) => {
      const href = (a.getAttribute("href") || "").trim();
      if (!a.textContent.trim() && !a.querySelector("img")) a.remove();
      else if (href.startsWith("#_mso")) a.replaceWith(...a.childNodes);
    });
    const doc = clone.ownerDocument;
    const walker = doc.createTreeWalker(
      clone,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      t.textContent = t.textContent.replace(/[\s ]{2,}/g, " ");
    });
    if (texts.length) {
      texts[0].textContent = texts[0].textContent.replace(/^[\s ]+/, "");
      const last = texts[texts.length - 1];
      last.textContent = last.textContent.replace(/[\s ]+$/, "");
    }
    if (!cleanText(clone.textContent) && !clone.querySelector("img, picture")) return null;
    return clone;
  }
  function buildRow(card, document) {
    const srcImg = card.querySelector("img");
    const heading = [...card.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((h) => cleanText(h.textContent));
    const linkEl = [...card.querySelectorAll("a[href]")].find((a) => {
      const href2 = (a.getAttribute("href") || "").trim();
      return href2 && !href2.startsWith("#") && !href2.toLowerCase().startsWith("javascript:");
    });
    const href = linkEl ? linkEl.getAttribute("href").trim() : "";
    let imageCell = "";
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = (srcImg.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
      imageCell = img;
    }
    const textCell = [];
    const title = heading ? cleanText(heading.textContent) : "";
    if (title) {
      const h4 = document.createElement("h4");
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = title;
        h4.append(a);
      } else {
        h4.textContent = title;
      }
      textCell.push(h4);
    }
    const textCol = heading && heading.closest(".text") || card;
    textCol.querySelectorAll("p").forEach((p) => {
      if (p.closest("h1, h2, h3, h4, h5, h6")) return;
      const cleaned = cleanParagraph(p);
      if (cleaned) textCell.push(cleaned);
    });
    if (!imageCell && !textCell.length) return null;
    return [imageCell, textCell.length ? textCell : ""];
  }
  function parse(element, { document }) {
    if (!element.parentNode) return;
    let prev = element.previousElementSibling;
    while (prev && !prev.matches(ROW_SELECTOR)) prev = prev.previousElementSibling;
    if (isCardRow(prev)) return;
    const rows = [element];
    let next = element.nextElementSibling;
    while (next && isCardRow(next)) {
      rows.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    rows.forEach((row) => {
      row.querySelectorAll(".imageText").forEach((card) => {
        const r = buildRow(card, document);
        if (r) cells.push(r);
      });
    });
    rows.slice(1).forEach((el) => el.remove());
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-solutions.js
  function cleanText2(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function parseRelatedProducts(element, document) {
    const cells = [];
    const cards = [...element.querySelectorAll(".related__product--details")].filter((card) => !card.closest(".slick-cloned"));
    cards.forEach((card) => {
      const titleEl = card.querySelector(".related__product--title");
      const descEl = card.querySelector(".related__product--desc");
      const srcImg = card.querySelector("img");
      const link = titleEl && titleEl.closest("a[href]") || card.querySelector("a.related__product--button[href]") || card.querySelector("a[href]");
      const href = link ? link.getAttribute("href").trim().replace(/^(https?:\/\/[^/]+)\/{2,}/, "$1/") : "";
      let imageCell = "";
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = (srcImg.getAttribute("alt") || "").trim();
        imageCell = img;
      }
      const content = [];
      const title = cleanText2(titleEl);
      if (title) {
        const heading = document.createElement("h4");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          heading.append(a);
        } else {
          heading.textContent = title;
        }
        content.push(heading);
      }
      const desc = cleanText2(descEl);
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : ""]);
    });
    return cells;
  }
  function parse2(element, { document }) {
    if (element.matches(".related-products") || element.querySelector(".related__product--card, .related__product--details")) {
      const relatedCells = parseRelatedProducts(element, document);
      const relatedBlock = WebImporter.Blocks.createBlock(document, { name: "cards-solutions", cells: relatedCells });
      element.replaceWith(relatedBlock);
      return;
    }
    const cells = [];
    const cards = element.querySelectorAll(".imageText");
    cards.forEach((card) => {
      const img = card.querySelector("img");
      const imageCell = img ? [img] : [""];
      const content = [];
      const h = card.querySelector("h1, h2, h3, h4");
      if (h) {
        const lines = [...h.querySelectorAll("span")].map((s) => s.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
        const heading = document.createElement(h.tagName.toLowerCase());
        if (lines.length > 1) {
          lines.forEach((line, i) => {
            if (i > 0) heading.append(document.createElement("br"));
            heading.append(document.createTextNode(line));
          });
        } else {
          heading.textContent = h.textContent.replace(/\s+/g, " ").trim();
        }
        content.push(heading);
      }
      card.querySelectorAll(".text p").forEach((p) => {
        const text = p.textContent.replace(/\s+/g, " ").trim();
        if (text) {
          const para = document.createElement("p");
          para.textContent = text;
          content.push(para);
        }
      });
      const cta = card.querySelector("a.cta-button[href], .text a[href]");
      if (cta) {
        const a = document.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.trim();
        const p = document.createElement("p");
        p.append(a);
        content.push(p);
      }
      cells.push([imageCell, content.length ? content : [""]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-solutions", cells });
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

  // tools/importer/import-solution-category.js
  var PAGE_TEMPLATE = {
    "name": "solution-category",
    "urls": [
      "https://www.lcnclosers.com/en/solutions/by-market.html"
    ],
    "representativeUrl": "https://www.lcnclosers.com/en/solutions/by-market.html",
    "description": "LCN solution category pages (by market / role / requirement): page title, intro + category cards on light grey, other solution hubs on a blue gradient",
    "blocks": [
      {
        "name": "cards-category",
        "instances": [
          "#root-main > div.aem-Grid > div.allegion-container:has(.columnselector .imageText) .columnselector"
        ]
      },
      {
        "name": "cards-solutions",
        "instances": [
          "#root-main > div.aem-Grid > div.background-image .columnselector"
        ]
      }
    ],
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
        "name": "Category Cards",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-container:has(.columnselector .imageText)",
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(3)"
        ],
        "style": "light-grey",
        "blocks": [
          "cards-category"
        ],
        "defaultContent": [
          "#root-main > div.aem-Grid > div.allegion-container:has(.columnselector .imageText) .customrte.text"
        ]
      },
      {
        "id": "section-3",
        "name": "Other Solutions",
        "selector": [
          "#root-main > div.aem-Grid > div.background-image"
        ],
        "style": "blue-gradient, centered",
        "blocks": [
          "cards-solutions"
        ],
        "defaultContent": [
          "#root-main > div.aem-Grid > div.background-image .customrte.text"
        ]
      }
    ],
    "urlPattern": "/en/solutions/*"
  };
  var parsers = {
    "cards-category": parse,
    "cards-solutions": parse2
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
  var import_solution_category_default = {
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
  return __toCommonJS(import_solution_category_exports);
})();
