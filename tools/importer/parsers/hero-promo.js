/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-promo.
 * Source: div.allegion-xf.experiencefragment ("All in One. Allegion." banner).
 * Rows: 1) background photo (outermost background-image)
 *       2) logo picture, heading, paragraphs, CTA, badge picture.
 * The inner orange gradient background is panel styling and is dropped.
 */
function firstStyleBackground(element) {
  const styleText = [...element.querySelectorAll('style')].map((s) => s.textContent).join('\n');
  const m = styleText.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  return m ? m[1] : null;
}

export default function parse(element, { document }) {
  const cells = [];

  // Outermost background-image wrapper holds the office photo
  const bgWrapper = element.querySelector('div.background-image');
  let bgImg = bgWrapper ? bgWrapper.querySelector(':scope > div > img') : null;
  if (!bgImg) {
    const src = firstStyleBackground(element);
    if (src) {
      bgImg = document.createElement('img');
      bgImg.src = src;
      bgImg.alt = '';
    }
  }
  element.querySelectorAll('style').forEach((s) => s.remove());
  if (bgImg) cells.push([bgImg]);

  const content = [];
  // Homepage XF: logo sits inside the .columnselector. Product-page XF: logo is a
  // standalone .cmp-image above the .columnselector (same fragment, other layout).
  let logo = element.querySelector('.columnselector .cmp.cmp-image img');
  if (!logo) {
    logo = [...element.querySelectorAll('.cmp.cmp-image img')]
      .find((img) => !img.closest('.columnselector') && img !== bgImg) || null;
  }
  if (logo) content.push(logo);

  const rte = element.querySelector('.columnselector .customrte');
  if (rte) {
    const heading = rte.querySelector('h1, h2, h3, h4');
    if (heading) content.push(heading);
    rte.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim()) content.push(p);
    });
  }

  const cta = element.querySelector('.columnselector .button-link a[href]');
  if (cta) {
    const p = document.createElement('p');
    p.append(cta);
    content.push(p);
  }

  const badge = element.querySelector('.columnselector .image .cmp-image img, .columnselector img.cmp-image__image');
  if (badge && badge !== logo) content.push(badge);

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
