/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-product.
 * Source: div.background-image (home page top banner, LCN index template).
 * Rows: 1) background photo  2) heading, intro copy, CTA, product cutout image.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Background photo: direct img of the background-image wrapper (not inside content)
  let bgImg = element.querySelector(':scope > div > img, :scope > img');
  if (!bgImg) {
    // Live page: background photo is set via an inline <style> rule
    const styleText = [...element.querySelectorAll('style')].map((s) => s.textContent).join('\n');
    const m = styleText.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (m) {
      bgImg = document.createElement('img');
      bgImg.src = m[1];
      bgImg.alt = '';
    }
  }
  element.querySelectorAll('style').forEach((s) => s.remove());
  if (bgImg) cells.push([bgImg]);

  const content = [];
  const heading = element.querySelector('.customrte h1, .customrte h2, .customrte h3, h1, h2');
  if (heading) content.push(heading);

  const rte = element.querySelector('.customrte');
  if (rte) {
    rte.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim()) content.push(p);
    });
  }

  const cta = element.querySelector('.button-link a[href], .alle-core-buttonlink a[href]');
  if (cta) {
    const p = document.createElement('p');
    p.append(cta);
    content.push(p);
  }

  const productImg = element.querySelector('.cmp-image img');
  if (productImg && productImg !== bgImg) content.push(productImg);

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-product', cells });
  element.replaceWith(block);
}
