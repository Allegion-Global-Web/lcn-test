/* eslint-disable */
/* global WebImporter */

import cardsCategoryParser from './parsers/cards-category.js';
import cardsSolutionsParser from './parsers/cards-solutions.js';
import lcnCleanupTransformer from './transformers/lcn-cleanup.js';
import lcnSectionsTransformer from './transformers/lcn-sections.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'cards-category': cardsCategoryParser,
  'cards-solutions': cardsSolutionsParser,
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
