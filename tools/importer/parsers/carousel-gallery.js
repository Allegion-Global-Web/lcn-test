/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-gallery.
 * Source: .default-product-detail-component .productCarousel (Bootstrap carousel).
 *   - .carousel-inner .item img      -> full-size slide images
 *   - .carousel-indicators img       -> thumbnails (same images, used only as fallback)
 *   - .carousel-control              -> prev/next chrome (dropped)
 * One row per unique product image: [ image | caption (empty) ].
 * Images are deduped by full-size src; "Image of Finish" swatches, empty images
 * and unresolved AEM placeholders (src "/_jcr_content/...") are skipped.
 */
function fullSizeSrc(src) {
  // strip AEM rendition suffix: /x.png/_jcr_content/renditions/cq5dam.thumbnail.319.319.png -> /x.png
  return (src || '').trim().replace(/\/_jcr_content\/renditions\/[^?#]*$/, '');
}

export default function parse(element, { document }) {
  const cells = [];
  const seen = new Set();

  const slideImgs = [...element.querySelectorAll('.carousel-inner .item img')];
  const thumbImgs = [...element.querySelectorAll('.carousel-indicators img')];
  // Slides carry the full-size image; thumbnails only when no slides rendered.
  // Last resort: any image in the component that is not carousel chrome.
  let candidates = slideImgs.length ? slideImgs : thumbImgs;
  if (!candidates.length) {
    candidates = [...element.querySelectorAll('img')].filter((img) => !img.closest('.carousel-control'));
  }

  candidates.forEach((source) => {
    const raw = source.getAttribute('src') || source.getAttribute('data-src') || '';
    const src = fullSizeSrc(raw);
    const alt = (source.getAttribute('alt') || '').trim();
    if (!src || /^\/?_jcr_content\//.test(src)) return;
    if (/^image of finish$/i.test(alt) || source.matches('.finishImg, .replaceImg')) return;
    if (seen.has(src)) return;
    seen.add(src);

    const img = document.createElement('img');
    img.src = src;
    img.alt = /^productimg$/i.test(alt) ? '' : alt;
    cells.push([img, '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
