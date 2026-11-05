/* eslint-disable */
/* global WebImporter */

import heroProductParser from './parsers/hero-product.js';
import carouselFeaturedParser from './parsers/carousel-featured.js';
import cardsIconLinksParser from './parsers/cards-icon-links.js';
import columnsVideoParser from './parsers/columns-video.js';
import cardsSolutionsParser from './parsers/cards-solutions.js';
import columnsStatParser from './parsers/columns-stat.js';
import columnsMosaicParser from './parsers/columns-mosaic.js';
import heroPromoParser from './parsers/hero-promo.js';
import lcnCleanupTransformer from './transformers/lcn-cleanup.js';
import lcnSectionsTransformer from './transformers/lcn-sections.js';

const PAGE_TEMPLATE = {
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
        "#root-main > div.aem-Grid > div.av-container [id^=\"carousel-\"]"
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

const parsers = {
  'hero-product': heroProductParser,
  'carousel-featured': carouselFeaturedParser,
  'cards-icon-links': cardsIconLinksParser,
  'columns-video': columnsVideoParser,
  'cards-solutions': cardsSolutionsParser,
  'columns-stat': columnsStatParser,
  'columns-mosaic': columnsMosaicParser,
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
