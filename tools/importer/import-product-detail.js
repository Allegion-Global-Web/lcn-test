/* eslint-disable */
/* global WebImporter */

import carouselGalleryParser from './parsers/carousel-gallery.js';
import cardsAttributesParser from './parsers/cards-attributes.js';
import accordionProductParser from './parsers/accordion-product.js';
import columnsCtaBannerParser from './parsers/columns-cta-banner.js';
import cardsSolutionsParser from './parsers/cards-solutions.js';
import columnsStatParser from './parsers/columns-stat.js';
import heroPromoParser from './parsers/hero-promo.js';
import lcnCleanupTransformer from './transformers/lcn-cleanup.js';
import lcnSectionsTransformer from './transformers/lcn-sections.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'carousel-gallery': carouselGalleryParser,
  'cards-attributes': cardsAttributesParser,
  'accordion-product': accordionProductParser,
  'columns-cta-banner': columnsCtaBannerParser,
  'cards-solutions': cardsSolutionsParser,
  'columns-stat': columnsStatParser,
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
