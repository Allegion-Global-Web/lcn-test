/* eslint-disable */
/* global WebImporter */

import columnsVideoParser from './parsers/columns-video.js';
import cardsIconLinksParser from './parsers/cards-icon-links.js';
import embedVideoParser from './parsers/embed-video.js';
import cardsSolutionsParser from './parsers/cards-solutions.js';
import columnsBrandsParser from './parsers/columns-brands.js';
import heroPromoParser from './parsers/hero-promo.js';
import lcnCleanupTransformer from './transformers/lcn-cleanup.js';
import lcnSectionsTransformer from './transformers/lcn-sections.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'columns-video': columnsVideoParser,
  'cards-icon-links': cardsIconLinksParser,
  'embed-video': embedVideoParser,
  'cards-solutions': cardsSolutionsParser,
  'columns-brands': columnsBrandsParser,
  'hero-promo': heroPromoParser,
};
const transformers = [lcnCleanupTransformer, lcnSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // The source homepage lives at /en/index.html; it becomes the site root page.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '')
      .replace(/^\/en\/index$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
