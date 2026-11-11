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

  // tools/importer/import-product-detail.js
  var import_product_detail_exports = {};
  __export(import_product_detail_exports, {
    default: () => import_product_detail_default
  });

  // tools/importer/parsers/carousel-gallery.js
  function fullSizeSrc(src) {
    return (src || "").trim().replace(/\/_jcr_content\/renditions\/[^?#]*$/, "");
  }
  function parse(element, { document }) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const slideImgs = [...element.querySelectorAll(".carousel-inner .item img")];
    const thumbImgs = [...element.querySelectorAll(".carousel-indicators img")];
    let candidates = slideImgs.length ? slideImgs : thumbImgs;
    if (!candidates.length) {
      candidates = [...element.querySelectorAll("img")].filter((img) => !img.closest(".carousel-control"));
    }
    candidates.forEach((source) => {
      const raw = source.getAttribute("src") || source.getAttribute("data-src") || "";
      const src = fullSizeSrc(raw);
      const alt = (source.getAttribute("alt") || "").trim();
      if (!src || /^\/?_jcr_content\//.test(src)) return;
      if (/^image of finish$/i.test(alt) || source.matches(".finishImg, .replaceImg")) return;
      if (seen.has(src)) return;
      seen.add(src);
      const img = document.createElement("img");
      img.src = src;
      img.alt = /^productimg$/i.test(alt) ? "" : alt;
      cells.push([img, ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-attributes.js
  var WS = /^[\s ]+|[\s ]+$/g;
  function trimEdges(container) {
    const walker = container.ownerDocument.createTreeWalker(
      container,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    const first = texts.find((t) => t.textContent.replace(WS, ""));
    const last = [...texts].reverse().find((t) => t.textContent.replace(WS, ""));
    texts.forEach((t) => {
      if (t === first || t === last) return;
      const before = first && first.compareDocumentPosition(t) & 2;
      const after = last && last.compareDocumentPosition(t) & 4;
      if (before || after) t.remove();
    });
    if (first) first.textContent = first.textContent.replace(/^[\s ]+/, "");
    if (last) last.textContent = last.textContent.replace(/[\s ]+$/, "");
  }
  function buildLabel(item, document) {
    const label = document.createElement("p");
    [...item.childNodes].forEach((node) => {
      if (node.nodeType === 1 && (node.matches("img, picture, br") || node.querySelector("img, picture"))) {
        if (node.matches("a[href]") && node.textContent.replace(WS, "")) {
          const a = document.createElement("a");
          a.href = node.getAttribute("href");
          [...node.childNodes].forEach((c) => {
            if (!(c.nodeType === 1 && c.matches("img, picture"))) a.append(c.cloneNode(true));
          });
          label.append(a);
        }
        return;
      }
      label.append(node.cloneNode(true));
    });
    label.querySelectorAll("a").forEach((a) => {
      if (!a.textContent.replace(WS, "")) a.remove();
    });
    trimEdges(label);
    return label;
  }
  function parse2(element, { document }) {
    const cells = [];
    const items = [...element.querySelectorAll("p, li")].filter(
      (el) => el.querySelector("img") && !el.parentElement.closest("p, li")
    );
    items.forEach((item) => {
      const icon = item.querySelector("img");
      const img = document.createElement("img");
      img.src = icon.getAttribute("src");
      img.alt = (icon.getAttribute("alt") || "").trim();
      const label = buildLabel(item, document);
      const hasLabel = !!label.textContent.replace(WS, "");
      if (!img.getAttribute("src") && !hasLabel) return;
      cells.push([img.getAttribute("src") ? img : "", hasLabel ? label : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-attributes", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-product.js
  var WRAPPERS = /* @__PURE__ */ new Set(["DIV", "SECTION", "ARTICLE", "SPAN"]);
  var DROP = "script, style, link, noscript, meta, button";
  function isEmpty(el) {
    return !el.textContent.replace(/[\s ]+/g, "") && !el.querySelector("img, picture, video, iframe, hr");
  }
  function collectContent(container, out) {
    [...container.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        const text = node.textContent.replace(/\s+/g, " ").trim();
        if (text) {
          const p = container.ownerDocument.createElement("p");
          p.textContent = text;
          out.push(p);
        }
        return;
      }
      if (node.nodeType !== 1 || node.matches(DROP)) return;
      if (WRAPPERS.has(node.tagName) && node.children.length) {
        collectContent(node, out);
        return;
      }
      if (isEmpty(node)) return;
      out.push(node);
    });
  }
  function getBody(panel, heading, root) {
    var _a;
    let body = panel && panel.querySelector(".panel-body, .panel-collapse");
    if (body) return body;
    const href = heading && ((_a = heading.querySelector('a[href^="#"]')) == null ? void 0 : _a.getAttribute("href"));
    if (href && href.length > 1) {
      try {
        body = root.querySelector(href);
      } catch (e) {
      }
    }
    if (!body && heading) body = heading.nextElementSibling;
    return body ? body.querySelector(".panel-body") || body : null;
  }
  function parse3(element, { document }) {
    const cells = [];
    let panels = [...element.querySelectorAll(".panel")].filter((p) => p.querySelector(".panel-heading, .panel-title"));
    const items = panels.length ? panels.map((panel) => ({ panel, heading: panel.querySelector(".panel-heading, .panel-title") })) : [...element.querySelectorAll(".panel-heading")].map((heading) => ({ panel: null, heading }));
    items.forEach(({ panel, heading }) => {
      const titleEl = heading && heading.querySelector(".panel-title") || heading;
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const body = getBody(panel, heading, element);
      const content = [];
      if (body) {
        body.querySelectorAll(DROP).forEach((el) => el.remove());
        body.querySelectorAll("a").forEach((a) => {
          if (isEmpty(a)) a.remove();
        });
        body.querySelectorAll("li > br:last-child").forEach((br) => br.remove());
        collectContent(body, content);
      }
      if (!title && !content.length) return;
      cells.push([title, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta-banner.js
  function parse4(element, { document }) {
    const row = element.querySelector(".row");
    const cols = row ? [...row.children].filter((c) => /\bcol-/.test(c.className)) : [];
    const textCol = cols.find((c) => c.querySelector(".customrte, .text, h1, h2, h3, h4, h5, h6, p, .button-link")) || element;
    const iconCol = cols.find((c) => c !== textCol && c.querySelector("img"));
    const textCell = [];
    textCol.querySelectorAll(".customrte h1, .customrte h2, .customrte h3, .customrte h4, .customrte h5, .customrte h6, .customrte p, .customrte ul, .customrte ol").forEach((el) => {
      if (el.parentElement.closest("ul, ol")) return;
      if (el.textContent.replace(/[\s ]+/g, "")) {
        const clean = el.cloneNode(true);
        clean.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
        textCell.push(clean);
      }
    });
    textCol.querySelectorAll(".button-link a[href], a.alle-core-btn-link[href]").forEach((link) => {
      if (textCell.some((el) => el.contains(link))) return;
      const text = link.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = text;
      const p = document.createElement("p");
      p.append(a);
      textCell.push(p);
    });
    const iconCell = [];
    const icon = iconCol && iconCol.querySelector("img");
    if (icon) {
      const img = document.createElement("img");
      img.src = icon.getAttribute("src");
      img.alt = (icon.getAttribute("alt") || "").trim();
      iconCell.push(img);
    }
    const cells = [[textCell.length ? textCell : "", iconCell.length ? iconCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-solutions.js
  function cleanText(el) {
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
      const title = cleanText(titleEl);
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
      const desc = cleanText(descEl);
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
  function parse5(element, { document }) {
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
        let lines = [...h.querySelectorAll("span")].map((s) => s.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
        if (lines.length < 2 && h.querySelector("br")) {
          const clone = h.cloneNode(true);
          clone.querySelectorAll("br").forEach((br) => br.replaceWith("\0"));
          lines = clone.textContent.split("\0").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
        }
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
  function parseColumnSelector(element, document) {
    const row = element.querySelector(".row");
    const cols = row ? [...row.children].filter((c) => /\bcol-/.test(c.className)) : [];
    const textCol = cols.find((c) => c.querySelector(".customrte, .text")) || element;
    const mediaCol = cols.find((c) => c !== textCol && c.querySelector("img")) || element;
    const textCell = [];
    textCol.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
      if (!el.textContent.replace(/[\s ]+/g, "")) return;
      const clean = el.cloneNode(true);
      clean.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
      clean.removeAttribute("role");
      clean.removeAttribute("aria-level");
      textCell.push(clean);
    });
    const mediaCell = [];
    const srcImg = mediaCol.querySelector("img");
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = (srcImg.getAttribute("alt") || "").trim();
      const link = srcImg.closest("a[href]");
      if (link) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.append(img);
        mediaCell.push(a);
      } else {
        mediaCell.push(img);
      }
    }
    return [[textCell.length ? textCell : "", mediaCell.length ? mediaCell : ""]];
  }
  function parse6(element, { document }) {
    if (!element.querySelector(".textWithIcon") && element.querySelector('.row > [class*="col-"]')) {
      const csCells = parseColumnSelector(element, document);
      const csBlock = WebImporter.Blocks.createBlock(document, { name: "columns-stat", cells: csCells });
      element.replaceWith(csBlock);
      return;
    }
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

  // tools/importer/parsers/hero-promo.js
  function firstStyleBackground(element) {
    const styleText = [...element.querySelectorAll("style")].map((s) => s.textContent).join("\n");
    const m = styleText.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m ? m[1] : null;
  }
  function parse7(element, { document }) {
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
    let logo = element.querySelector(".columnselector .cmp.cmp-image img");
    if (!logo) {
      logo = [...element.querySelectorAll(".cmp.cmp-image img")].find((img) => !img.closest(".columnselector") && img !== bgImg) || null;
    }
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

  // tools/importer/import-product-detail.js
  var PAGE_TEMPLATE = {
    "name": "product-detail",
    "urls": [
      "https://www.lcnclosers.com/en/products/automatic-door-operators/9500-2800-senior-swing-series-operators.html",
      "https://www.lcnclosers.com/en/products/automatic-door-operators/8310-series-actuators-sensors-accessories.html"
    ],
    "representativeUrl": "https://www.lcnclosers.com/en/products/automatic-door-operators/9500-2800-senior-swing-series-operators.html",
    "description": "LCN product detail page: product image gallery beside title/description/CTA (light grey), Overview text beside attribute list (dark blue), product details accordion, replacement parts CTA banner, related products cards (light grey), Did You Know stat columns, Allegion promo fragment",
    "blocks": [
      {
        "name": "carousel-gallery",
        "instances": [
          ".default-product-detail-component .productCarousel"
        ]
      },
      {
        "name": "cards-attributes",
        "instances": [
          ".xtra-xtra-parsys .fullWidthColumnSelector"
        ]
      },
      {
        "name": "accordion-product",
        "instances": [
          ".xtra-xtra-parsys .accordian-tab"
        ]
      },
      {
        "name": "columns-cta-banner",
        "instances": [
          ".columnselector.flex-text-center-align"
        ]
      },
      {
        "name": "cards-solutions",
        "instances": [
          ".related-products"
        ]
      },
      {
        "name": "columns-stat",
        "instances": [
          ".product-banner ~ div.allegion-container .columnselector:not(.flex-text-center-align)"
        ]
      },
      {
        "name": "hero-promo",
        "instances": [
          "#root-main .allegion-xf.experiencefragment"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Product Intro",
        "selector": [
          ".default-product-detail-component .upperRow + .row",
          ".default-product-detail-component > .clearfix > .container > .row:nth-of-type(2)"
        ],
        "style": "card, gradient, split",
        "blocks": [
          "carousel-gallery"
        ],
        "defaultContent": [
          ".productDescriptionHalf h1.alle-product-Title",
          ".productDescriptionHalf .alle-xtra-parsys .customrte.text",
          ".productDescriptionHalf .alle-xtra-parsys .button-link"
        ]
      },
      {
        "id": "section-2",
        "name": "Overview",
        "selector": [
          ".xtra-xtra-parsys > div > div.allegion-container"
        ],
        "style": "gradient, split",
        "blocks": [
          "cards-attributes"
        ],
        "defaultContent": [
          ".xtra-xtra-parsys .containercustom > .row > div > .customrte.text"
        ]
      },
      {
        "id": "section-3",
        "name": "Product Details Accordion",
        "selector": [
          ".xtra-xtra-parsys .accordian-tab",
          ".accordian-tab"
        ],
        "style": "contained, gradient-mobile",
        "blocks": [
          "accordion-product"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "Need Replacement Parts",
        "selector": [
          ".columnselector.flex-text-center-align"
        ],
        "style": "contained, inset",
        "blocks": [
          "columns-cta-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "section-5",
        "name": "Related Products",
        "selector": [
          ".product-banner ~ div.allegion-container:has(.related-products)"
        ],
        "style": "contained, padded, centered-heading",
        "blocks": [
          "cards-solutions"
        ],
        "defaultContent": [
          ".customrte.text:has(+ div.allegion-container .related-products) h3"
        ]
      },
      {
        "id": "section-6",
        "name": "Did You Know",
        "selector": [
          ".product-banner ~ div.allegion-container .columnselector:not(.flex-text-center-align)"
        ],
        "style": "spaced",
        "blocks": [
          "columns-stat"
        ],
        "defaultContent": []
      },
      {
        "id": "section-7",
        "name": "All in One. Allegion.",
        "selector": [
          "#root-main .allegion-xf.experiencefragment",
          "#root-main > div.aem-Grid > div.allegion-container:nth-of-type(2)"
        ],
        "style": "boxed",
        "blocks": [
          "hero-promo"
        ],
        "defaultContent": []
      }
    ],
    "urlPattern": "/en/products/*"
  };
  var parsers = {
    "carousel-gallery": parse,
    "cards-attributes": parse2,
    "accordion-product": parse3,
    "columns-cta-banner": parse4,
    "cards-solutions": parse5,
    "columns-stat": parse6,
    "hero-promo": parse7
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
  var import_product_detail_default = {
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
  return __toCommonJS(import_product_detail_exports);
})();
