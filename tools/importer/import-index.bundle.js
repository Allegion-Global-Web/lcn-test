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

  // tools/importer/import-index.js
  var import_index_exports = {};
  __export(import_index_exports, {
    default: () => import_index_default
  });

  // tools/importer/parsers/hero-product.js
  function parse(element, { document }) {
    const cells = [];
    let bgImg = element.querySelector(":scope > div > img, :scope > img");
    if (!bgImg) {
      const styleText = [...element.querySelectorAll("style")].map((s) => s.textContent).join("\n");
      const m = styleText.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m) {
        bgImg = document.createElement("img");
        bgImg.src = m[1];
        bgImg.alt = "";
      }
    }
    element.querySelectorAll("style").forEach((s) => s.remove());
    if (bgImg) cells.push([bgImg]);
    const content = [];
    const heading = element.querySelector(".customrte h1, .customrte h2, .customrte h3, h1, h2");
    if (heading) content.push(heading);
    const rte = element.querySelector(".customrte");
    if (rte) {
      rte.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) content.push(p);
      });
    }
    const cta = element.querySelector(".button-link a[href], .alle-core-buttonlink a[href]");
    if (cta) {
      const p = document.createElement("p");
      p.append(cta);
      content.push(p);
    }
    const productImg = element.querySelector(".cmp-image img");
    if (productImg && productImg !== bgImg) content.push(productImg);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-featured.js
  function parse2(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll(".carousel-inner > .item");
    slides.forEach((slide) => {
      const img = slide.querySelector(":scope > picture img, :scope > img, picture img");
      const imageCell = img ? [img] : [""];
      const content = [];
      const headingEl = slide.querySelector(".caption-heading");
      if (headingEl) {
        const parts = [...headingEl.querySelectorAll(":scope > p")].filter((p) => p.textContent.trim());
        if (parts.length === 0) {
          const h = document.createElement("h2");
          h.textContent = headingEl.textContent.trim();
          if (h.textContent) content.push(h);
        } else {
          let titleIdx = parts.findIndex((p) => p.querySelector("b, strong"));
          if (titleIdx === -1) titleIdx = parts.length - 1;
          parts.forEach((p, i) => {
            const text = p.textContent.replace(/\s+/g, " ").trim();
            if (i === titleIdx) {
              const h = document.createElement("h2");
              h.textContent = text;
              content.push(h);
            } else {
              const para = document.createElement("p");
              para.textContent = text;
              content.push(para);
            }
          });
        }
      }
      slide.querySelectorAll(".carousel-text p").forEach((p) => {
        if (p.textContent.trim()) content.push(p);
      });
      const ctaSrc = slide.querySelector("a.caption-button[href], .carousel-caption a[href]");
      if (ctaSrc) {
        const a = document.createElement("a");
        a.href = ctaSrc.getAttribute("href");
        a.textContent = ctaSrc.textContent.replace(/\s+/g, " ").trim();
        const p = document.createElement("p");
        p.append(a);
        content.push(p);
      }
      cells.push([imageCell, content.length ? content : [""]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-links.js
  function parse3(element, { document }) {
    const cells = [];
    const columns = element.querySelectorAll('.row > [class*="col-"]');
    columns.forEach((col) => {
      const img = col.querySelector("img");
      const link = col.querySelector("a[href]");
      if (!img && !link) return;
      const label = img && (img.getAttribute("alt") || "").trim() || link && link.textContent.trim() || "";
      const imageCell = img ? [img] : [""];
      let textCell = [""];
      if (link) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = label || a.href;
        const p = document.createElement("p");
        p.append(a);
        textCell = [p];
      } else if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        textCell = [p];
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-video.js
  function parse4(element, { document }) {
    const root = element.querySelector(".columnselector.home-video") || element;
    const columns = [...root.querySelectorAll('[class*="columnselector"] > .row > [class*="col-"]')].filter((c) => c.closest(".columnselector") === root);
    const [textCol, mediaCol] = columns;
    const textCell = [];
    if (textCol) {
      const rte = textCol.querySelector(".customrte");
      if (rte) {
        rte.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
          if (el.textContent.trim()) textCell.push(el);
        });
      }
      const cta = textCol.querySelector(".button-link a[href]");
      if (cta) {
        const a = document.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.trim();
        const p = document.createElement("p");
        p.append(a);
        textCell.push(p);
      }
      const sideImg = textCol.querySelector(".cmp-image img");
      if (sideImg) textCell.push(sideImg);
    }
    const mediaCell = [];
    if (mediaCol) {
      const img = mediaCol.querySelector("img");
      const link = mediaCol.querySelector("a[href]");
      if (img && link) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.append(img);
        mediaCell.push(a);
      } else if (img) {
        mediaCell.push(img);
      } else if (link) {
        mediaCell.push(link);
      }
    }
    const cells = [[textCell.length ? textCell : "", mediaCell.length ? mediaCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-solutions.js
  function parse5(element, { document }) {
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

  // tools/importer/parsers/columns-stat.js
  function parse6(element, { document }) {
    const textCell = [];
    const textCol = element.querySelector(".textWithIcon .text");
    if (textCol) {
      textCol.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
        if (el.textContent.trim()) textCell.push(el);
      });
    }
    const mediaCell = [];
    const img = element.querySelector(".textWithIcon img");
    if (img) {
      const linkSrc = img.closest("a[href]") || element.querySelector(".textWithIcon a[href]");
      if (linkSrc) {
        const a = document.createElement("a");
        a.href = linkSrc.getAttribute("href");
        a.append(img);
        mediaCell.push(a);
      } else {
        mediaCell.push(img);
      }
    }
    const cells = [[textCell.length ? textCell : "", mediaCell.length ? mediaCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-stat", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-mosaic.js
  var SELECTOR = ".columnselector.home_img--hover";
  function buildTile(col, document) {
    const content = [];
    const rte = col.querySelector(".customrte");
    if (rte) {
      const headings = [...rte.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => h.textContent.trim());
      if (headings.length) {
        const heading = document.createElement(headings[0].tagName.toLowerCase());
        headings.forEach((h, i) => {
          if (i > 0) heading.append(document.createElement("br"));
          heading.append(document.createTextNode(h.textContent.replace(/\s+/g, " ").trim()));
        });
        content.push(heading);
      }
      rte.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) content.push(p);
      });
      return content.length ? content : "";
    }
    const img = col.querySelector("img");
    const link = col.querySelector("a[href]");
    if (img && link) {
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      a.append(img);
      content.push(a);
    } else if (img) {
      content.push(img);
    } else if (link) {
      content.push(link);
    }
    return content.length ? content : "";
  }
  function buildRow(rowEl, document) {
    const cols = [...rowEl.querySelectorAll(':scope > div > div > .row > [class*="col-"]')];
    return cols.map((col) => buildTile(col, document));
  }
  function parse7(element, { document }) {
    if (!element.parentNode) return;
    const doc = element.ownerDocument || document;
    const all = [...doc.querySelectorAll(SELECTOR)];
    const idx = all.indexOf(element);
    if (idx > 0 && all[idx - 1].parentNode === element.parentNode) return;
    const rowEls = [element];
    let next = element.nextElementSibling;
    while (next && next.matches(SELECTOR)) {
      rowEls.push(next);
      next = next.nextElementSibling;
    }
    const cells = rowEls.map((rowEl) => buildRow(rowEl, document)).filter((row) => row.length);
    rowEls.slice(1).forEach((el) => el.remove());
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-mosaic", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function firstStyleBackground(element) {
    const styleText = [...element.querySelectorAll("style")].map((s) => s.textContent).join("\n");
    const m = styleText.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m ? m[1] : null;
  }
  function parse8(element, { document }) {
    const cells = [];
    const bgWrapper = element.querySelector("div.background-image");
    let bgImg = bgWrapper ? bgWrapper.querySelector(":scope > div > img") : null;
    if (!bgImg) {
      const src = firstStyleBackground(element);
      if (src) {
        bgImg = document.createElement("img");
        bgImg.src = src;
        bgImg.alt = "";
      }
    }
    element.querySelectorAll("style").forEach((s) => s.remove());
    if (bgImg) cells.push([bgImg]);
    const content = [];
    const logo = element.querySelector(".columnselector .cmp.cmp-image img");
    if (logo) content.push(logo);
    const rte = element.querySelector(".columnselector .customrte");
    if (rte) {
      const heading = rte.querySelector("h1, h2, h3, h4");
      if (heading) content.push(heading);
      rte.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) content.push(p);
      });
    }
    const cta = element.querySelector(".columnselector .button-link a[href]");
    if (cta) {
      const p = document.createElement("p");
      p.append(cta);
      content.push(p);
    }
    const badge = element.querySelector(".columnselector .image .cmp-image img, .columnselector img.cmp-image__image");
    if (badge && badge !== logo) content.push(badge);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
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
        ".inbenta-search-results"
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
        // Decorative line-drawing section backgrounds left over after the hero parsers ran.
        'div.background-image > div[class*="backgroundImage"] > img'
      ]);
      element.querySelectorAll('div.background-image, div.background-image > div[class*="backgroundImage"]').forEach((el) => {
        el.style.backgroundImage = "none";
      });
      element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        if (!h.textContent.trim() && !h.querySelector("img, picture")) h.remove();
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

  // tools/importer/import-index.js
  var PAGE_TEMPLATE = {
    "name": "index",
    "urls": [
      "https://www.lcnclosers.com/en/index.html"
    ],
    "representativeUrl": "https://www.lcnclosers.com/en/index.html",
    "description": "LCN homepage: product hero, featured product carousel, quick links, Why LCN video, solutions cards, precision stats/mosaic, Allegion promo",
    "blocks": [
      {
        "name": "hero-product",
        "instances": [
          "#root-main > div.aem-Grid > div.background-image"
        ]
      },
      {
        "name": "carousel-featured",
        "instances": [
          '#root-main > div.aem-Grid > div.av-container [id^="carousel-"]'
        ]
      },
      {
        "name": "cards-icon-links",
        "instances": [
          ".columnselector.Icon_size--mobile"
        ]
      },
      {
        "name": "columns-video",
        "instances": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.allegion-container"
        ]
      },
      {
        "name": "cards-solutions",
        "instances": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.background-image .columnselector"
        ]
      },
      {
        "name": "columns-stat",
        "instances": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.av-container div.contentcontainer:nth-of-type(2)"
        ]
      },
      {
        "name": "columns-mosaic",
        "instances": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.av-container .columnselector.home_img--hover"
        ]
      },
      {
        "name": "hero-promo",
        "instances": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.allegion-xf.experiencefragment"
        ]
      }
    ],
    "urlPattern": "/en/*",
    "sections": [
      {
        "id": "section-1",
        "name": "Hero - Taking Control",
        "selector": [
          "#root-main > div.aem-Grid > div.background-image"
        ],
        "style": null,
        "blocks": [
          "hero-product"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Featured Product Carousel",
        "selector": [
          "#root-main > div.aem-Grid > div.av-container"
        ],
        "style": null,
        "blocks": [
          "carousel-featured"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "Quick Links",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(3)"
        ],
        "style": "light-grey",
        "blocks": [
          "cards-icon-links"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "Why LCN",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.allegion-container"
        ],
        "style": null,
        "blocks": [
          "columns-video"
        ],
        "defaultContent": []
      },
      {
        "id": "section-5",
        "name": "Door Control Solutions",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.background-image"
        ],
        "style": "dark-blue, centered",
        "blocks": [
          "cards-solutions"
        ],
        "defaultContent": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.background-image .customrte.text"
        ]
      },
      {
        "id": "section-6",
        "name": "Precision Matters",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.av-container"
        ],
        "style": "centered",
        "blocks": [
          "columns-stat",
          "columns-mosaic"
        ],
        "defaultContent": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.av-container div.contentcontainer:nth-of-type(1)"
        ]
      },
      {
        "id": "section-7",
        "name": "All in One. Allegion.",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(4) > div.clearfix > div > div.row > div.col-xs-12 > div > div.allegion-xf.experiencefragment"
        ],
        "style": null,
        "blocks": [
          "hero-promo"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "hero-product": parse,
    "carousel-featured": parse2,
    "cards-icon-links": parse3,
    "columns-video": parse4,
    "cards-solutions": parse5,
    "columns-stat": parse6,
    "columns-mosaic": parse7,
    "hero-promo": parse8
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
  var import_index_default = {
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
  return __toCommonJS(import_index_exports);
})();
