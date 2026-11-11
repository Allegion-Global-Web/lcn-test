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

  // tools/importer/import-why-lcn.js
  var import_why_lcn_exports = {};
  __export(import_why_lcn_exports, {
    default: () => import_why_lcn_default
  });

  // tools/importer/parsers/columns-video.js
  function cleanText(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function buildGenericColumn(col, document) {
    const nodes = [...col.querySelectorAll("h1, h2, h3, h4, h5, h6, p, .button-link a[href], img")].filter((n) => !n.parentElement.closest("h1, h2, h3, h4, h5, h6, p"));
    const headingCount = nodes.filter((n) => /^H[1-6]$/.test(n.tagName)).length;
    let headingIndex = 0;
    const content = [];
    nodes.forEach((n) => {
      if (/^H[1-6]$/.test(n.tagName)) {
        const text = cleanText(n);
        if (!text) return;
        let level = "h2";
        if (headingCount > 1) level = headingIndex === 0 ? "h1" : "h3";
        headingIndex += 1;
        const h = document.createElement(level);
        h.textContent = text;
        content.push(h);
      } else if (n.tagName === "P") {
        if (!cleanText(n) && !n.querySelector("img")) return;
        content.push(n);
      } else if (n.tagName === "A") {
        const text = cleanText(n);
        if (!text) return;
        const a = document.createElement("a");
        a.href = n.getAttribute("href");
        a.textContent = text;
        const p = document.createElement("p");
        p.append(a);
        content.push(p);
      } else if (n.tagName === "IMG" && n.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = n.getAttribute("src");
        img.alt = (n.getAttribute("alt") || "").trim();
        const link = n.closest("a[href]");
        if (link && col.contains(link)) {
          const a = document.createElement("a");
          a.href = link.getAttribute("href");
          a.append(img);
          content.push(a);
        } else {
          content.push(img);
        }
      }
    });
    return content.length ? content : "";
  }
  function parse(element, { document }) {
    const root = element.querySelector(".columnselector.home-video") || element;
    const columns = [...root.querySelectorAll('[class*="columnselector"] > .row > [class*="col-"]')].filter((c) => c.closest(".columnselector") === root);
    if (!columns.length) {
      const cs = element.matches(".columnselector") ? element : element.querySelector(".columnselector");
      const genericCols = cs ? [...cs.querySelectorAll(':scope > .clearfix > .containercustom > .row > [class*="col-"]')] : [];
      if (genericCols.length) {
        const row = genericCols.map((col) => buildGenericColumn(col, document));
        while (row.length < 2) row.push("");
        const genericBlock = WebImporter.Blocks.createBlock(document, { name: "columns-video", cells: [row] });
        element.replaceWith(genericBlock);
        return;
      }
    }
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

  // tools/importer/parsers/cards-icon-links.js
  function cleanText2(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function parseTextWithIcon(items, document) {
    const cells = [];
    items.forEach((item) => {
      const srcImg = item.querySelector(".icon img, img");
      const textBox = item.querySelector(".text") || item;
      const titleEl = textBox.querySelector("h1, h2, h3, h4, h5, h6");
      const title = cleanText2(titleEl);
      let imageCell = "";
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = srcImg.getAttribute("src");
        img.alt = title || (srcImg.getAttribute("alt") || "").trim();
        const link = srcImg.closest("a[href]");
        if (link) {
          const a = document.createElement("a");
          a.href = link.getAttribute("href");
          a.append(img);
          imageCell = a;
        } else {
          imageCell = img;
        }
      }
      const content = [];
      if (title) {
        const h = document.createElement("h3");
        h.textContent = title;
        content.push(h);
      }
      textBox.querySelectorAll("p").forEach((p) => {
        if (!cleanText2(p)) return;
        if (p.querySelector("a[href]")) {
          content.push(p);
        } else {
          const para = document.createElement("p");
          para.textContent = cleanText2(p);
          content.push(para);
        }
      });
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : ""]);
    });
    return cells;
  }
  function parse2(element, { document }) {
    const iconItems = [...element.querySelectorAll(".imageText")].filter((item) => item.querySelector(".textWithIcon .text h1, .textWithIcon .text h2, .textWithIcon .text h3, .textWithIcon .text h4, .textWithIcon .text h5, .textWithIcon .text h6"));
    if (iconItems.length) {
      const iconCells = parseTextWithIcon(iconItems, document);
      const iconBlock = WebImporter.Blocks.createBlock(document, { name: "cards-icon-links", cells: iconCells });
      element.replaceWith(iconBlock);
      return;
    }
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

  // tools/importer/parsers/embed-video.js
  var KNOWN_TITLES = {
    FopATTmz1js: "LCN - Leaders in Door Control & Safety Solutions"
  };
  function cleanText3(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function youtubeId(src) {
    if (!src) return null;
    let url;
    try {
      url = new URL(src, "https://www.youtube.com/");
    } catch (e) {
      return null;
    }
    const host = url.hostname.replace(/^(www|m)\./, "");
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || null;
    if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;
    const v = url.searchParams.get("v");
    if (v) return v;
    const [type, id] = url.pathname.split("/").filter(Boolean);
    return ["embed", "shorts", "live", "v"].includes(type) ? id || null : null;
  }
  function parse3(element, { document }) {
    const iframe = element.querySelector("iframe[src]");
    const iframeSrc = iframe ? iframe.getAttribute("src") : "";
    const srcLink = element.querySelector('a[href*="youtu"]');
    const id = youtubeId(iframeSrc) || srcLink && youtubeId(srcLink.getAttribute("href"));
    let href = "";
    if (id) href = `https://www.youtube.com/watch?v=${id}`;
    else if (srcLink) href = srcLink.getAttribute("href");
    else if (iframeSrc) href = iframeSrc;
    const textBox = element.querySelector(".text");
    const title = iframe && (iframe.getAttribute("title") || "").trim() || id && KNOWN_TITLES[id] || cleanText3(textBox && textBox.querySelector("h1, h2, h3, h4, h5, h6")) || srcLink && cleanText3(srcLink) || href;
    const content = [];
    const srcImg = [...element.querySelectorAll("img")].find((img) => img.getAttribute("src"));
    let posterSrc = "";
    if (srcImg) posterSrc = srcImg.getAttribute("src");
    else if (id) posterSrc = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    if (posterSrc) {
      const img = document.createElement("img");
      img.src = posterSrc;
      img.alt = srcImg && (srcImg.getAttribute("alt") || "").trim() || title;
      content.push(img);
    }
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = title;
      const p = document.createElement("p");
      p.append(a);
      content.push(p);
    }
    const cells = content.length ? [[content]] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-solutions.js
  function cleanText4(el) {
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
      const title = cleanText4(titleEl);
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
      const desc = cleanText4(descEl);
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
  function parse4(element, { document }) {
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

  // tools/importer/parsers/columns-brands.js
  function isFiller(p) {
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
      if (content.includes(p) || isFiller(p)) return;
      stripLeadingBreaks(p);
      content.push(p);
    });
    return content.length ? content : "";
  }
  function parse5(element, { document }) {
    let cols = [...element.querySelectorAll('.containercustom > .row > [class*="col-"]')];
    if (!cols.length) cols = [...element.querySelectorAll('.row > [class*="col-"]')];
    const row = cols.map((col) => buildColumn(col, document)).filter((c) => c !== "");
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-brands", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function firstStyleBackground(element) {
    const styleText = [...element.querySelectorAll("style")].map((s) => s.textContent).join("\n");
    const m = styleText.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m ? m[1] : null;
  }
  function parse6(element, { document }) {
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

  // tools/importer/import-why-lcn.js
  var PAGE_TEMPLATE = {
    "name": "why-lcn",
    "urls": [
      "https://www.lcnclosers.com/en/why-lcn.html"
    ],
    "representativeUrl": "https://www.lcnclosers.com/en/why-lcn.html",
    "description": "LCN Why LCN page: intro card (text + photo) on the blueprint band, brand pillars (icon cards) on dark blue, Our Story columns on light grey, LCN Performance video, solutions cards, related brands on a blue gradient, boxed Allegion promo",
    "blocks": [
      {
        "name": "columns-video",
        "instances": [
          "#root-main > div.aem-Grid > div.background-image > div > div.contentcontainer .columnselector",
          "#root-main > div.aem-Grid > div.av-container > div.allegion-container .columnselector"
        ]
      },
      {
        "name": "cards-icon-links",
        "instances": [
          "#root-main > div.aem-Grid > div.background-image > div > div.av-container .columnselector"
        ]
      },
      {
        "name": "embed-video",
        "instances": [
          "#root-main > div.aem-Grid > div.av-container .imageText:has(.option-text-with-video)"
        ]
      },
      {
        "name": "cards-solutions",
        "instances": [
          "#root-main > div.aem-Grid > div.av-container > div.contentcontainer .columnselector"
        ]
      },
      {
        "name": "columns-brands",
        "instances": [
          "#simple-related-brands .columnselector"
        ]
      },
      {
        "name": "hero-promo",
        "instances": [
          "#root-main .allegion-xf.experiencefragment:has(.all-in-one)"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Why LCN Intro",
        "selector": [
          "#root-main > div.aem-Grid > div.background-image.page__backgroundimage--position > div > div.contentcontainer",
          "#root-main > div.aem-Grid > div.background-image > div > div.contentcontainer"
        ],
        "style": "card, dark-blue",
        "blocks": [
          "columns-video"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Brand Pillars",
        "selector": [
          "#root-main > div.aem-Grid > div.background-image.page__backgroundimage--position > div > div.av-container",
          "#root-main > div.aem-Grid > div.background-image > div > div.av-container"
        ],
        "style": "dark-blue, flush",
        "blocks": [
          "cards-icon-links"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "Our Story",
        "selector": [
          "#root-main > div.aem-Grid > div.av-container:has(.columnselector .cmp-image)",
          "#root-main > div.aem-Grid > div.av-container:nth-of-type(2)"
        ],
        "style": "light-grey",
        "blocks": [
          "columns-video"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "LCN Performance",
        "selector": [
          "#root-main > div.aem-Grid > div.av-container:has(.option-text-with-video)",
          "#root-main > div.aem-Grid > div.av-container:nth-of-type(3)"
        ],
        "style": "contained",
        "blocks": [
          "embed-video"
        ],
        "defaultContent": [
          "#root-main > div.aem-Grid > div.av-container:has(.option-text-with-video) .customrte.text",
          "#root-main > div.aem-Grid > div.av-container:has(.option-text-with-video) .button-link"
        ]
      },
      {
        "id": "section-5",
        "name": "Solutions Made Easy",
        "selector": [
          "#root-main > div.aem-Grid > div.av-container:has(.columnselector .imageText)",
          "#root-main > div.aem-Grid > div.av-container:nth-of-type(4)"
        ],
        "style": "centered-heading",
        "blocks": [
          "cards-solutions"
        ],
        "defaultContent": [
          "#root-main > div.aem-Grid > div.av-container > div.contentcontainer .customrte.text"
        ]
      },
      {
        "id": "section-6",
        "name": "Related Brands",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-xf.experiencefragment:has(#simple-related-brands)"
        ],
        "style": "blue-gradient, centered",
        "blocks": [
          "columns-brands"
        ],
        "defaultContent": [
          "#simple-related-brands h3"
        ]
      },
      {
        "id": "section-7",
        "name": "All in One. Allegion.",
        "selector": [
          "#root-main > div.aem-Grid > div.allegion-xf.experiencefragment:has(.all-in-one)"
        ],
        "style": "boxed, flush",
        "blocks": [
          "hero-promo"
        ],
        "defaultContent": []
      }
    ],
    "urlPattern": "/en/why-lcn*"
  };
  var parsers = {
    "columns-video": parse,
    "cards-icon-links": parse2,
    "embed-video": parse3,
    "cards-solutions": parse4,
    "columns-brands": parse5,
    "hero-promo": parse6
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
  var import_why_lcn_default = {
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
  return __toCommonJS(import_why_lcn_exports);
})();
