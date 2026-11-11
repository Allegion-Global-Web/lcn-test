/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-solutions.
 * Two source structures (detected by markup):
 *  A) Homepage: .columnselector inside the solutions background-image band; .imageText cards.
 *     One row per card: [ card image | two-line heading, description, CTA link ].
 *  B) Product detail: .related-products component; .related__product--card items
 *     (slick carousel). The component's own "Related Products" title is not
 *     copied (the section carries it as default content).
 *     One row per product: [ product image | linked title heading, description ].
 */
function cleanText(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function parseRelatedProducts(element, document) {
  const cells = [];
  // stable inner wrapper of each card; slick clones (if any) are skipped
  const cards = [...element.querySelectorAll('.related__product--details')]
    .filter((card) => !card.closest('.slick-cloned'));

  cards.forEach((card) => {
    const titleEl = card.querySelector('.related__product--title');
    const descEl = card.querySelector('.related__product--desc');
    const srcImg = card.querySelector('img');
    const link = (titleEl && titleEl.closest('a[href]'))
      || card.querySelector('a.related__product--button[href]')
      || card.querySelector('a[href]');
    // source hrefs carry a doubled slash after the host (".com//en/...")
    const href = link ? link.getAttribute('href').trim().replace(/^(https?:\/\/[^/]+)\/{2,}/, '$1/') : '';

    let imageCell = '';
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = (srcImg.getAttribute('alt') || '').trim();
      imageCell = img;
    }

    const content = [];
    const title = cleanText(titleEl);
    if (title) {
      const heading = document.createElement('h4');
      if (href) {
        const a = document.createElement('a');
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
      const p = document.createElement('p');
      p.textContent = desc;
      content.push(p);
    }

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '']);
  });
  return cells;
}

export default function parse(element, { document }) {
  if (element.matches('.related-products') || element.querySelector('.related__product--card, .related__product--details')) {
    const relatedCells = parseRelatedProducts(element, document);
    const relatedBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-solutions', cells: relatedCells });
    element.replaceWith(relatedBlock);
    return;
  }

  const cells = [];
  const cards = element.querySelectorAll('.imageText');

  cards.forEach((card) => {
    const img = card.querySelector('img');
    const imageCell = img ? [img] : [''];

    const content = [];
    const h = card.querySelector('h1, h2, h3, h4');
    if (h) {
      // Rebuild the two-line heading ("Solutions by" <br> "Market") from its spans
      let lines = [...h.querySelectorAll('span')]
        .map((s) => s.textContent.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      // First line as a bare text node outside the spans ("Solutions by<span><br></span><span>Role</span>"):
      // split the heading at its <br>s instead.
      if (lines.length < 2 && h.querySelector('br')) {
        const clone = h.cloneNode(true);
        clone.querySelectorAll('br').forEach((br) => br.replaceWith('\u0000'));
        lines = clone.textContent.split('\u0000')
          .map((s) => s.replace(/\s+/g, ' ').trim())
          .filter(Boolean);
      }
      const heading = document.createElement(h.tagName.toLowerCase());
      if (lines.length > 1) {
        lines.forEach((line, i) => {
          if (i > 0) heading.append(document.createElement('br'));
          heading.append(document.createTextNode(line));
        });
      } else {
        heading.textContent = h.textContent.replace(/\s+/g, ' ').trim();
      }
      content.push(heading);
    }

    card.querySelectorAll('.text p').forEach((p) => {
      const text = p.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        const para = document.createElement('p');
        para.textContent = text;
        content.push(para);
      }
    });

    const cta = card.querySelector('a.cta-button[href], .text a[href]');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    }

    cells.push([imageCell, content.length ? content : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-solutions', cells });
  element.replaceWith(block);
}
