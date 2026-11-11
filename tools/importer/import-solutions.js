/* eslint-disable */
/* global WebImporter */

import cardsHubTilesParser from './parsers/cards-hub-tiles.js';
import columnsBrandsParser from './parsers/columns-brands.js';
import lcnCleanupTransformer from './transformers/lcn-cleanup.js';
import lcnSectionsTransformer from './transformers/lcn-sections.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'cards-hub-tiles': cardsHubTilesParser,
  'columns-brands': columnsBrandsParser,
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
