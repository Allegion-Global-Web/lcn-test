/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-video.
 * Source: div.allegion-container wrapping .columnselector.home-video (two columns).
 * One row, two cells:
 *   cell 1: heading, subheading, paragraph, CTA link (+ decorative product image)
 *   cell 2: video poster image linked to YouTube (link is preserved)
 */
function cleanText(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Generic column (why-lcn and similar pages): .columnselector > .clearfix >
 * .containercustom > .row > [col-*]. Content is taken in document order:
 * headings, paragraphs, button-link CTAs and images. Empty elements dropped.
 * Heading levels: a column with two or more headings follows the homepage
 * pattern (H1 title, H3 subheading); a lone heading becomes H2.
 */
function buildGenericColumn(col, document) {
  const nodes = [...col.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .button-link a[href], img')]
    .filter((n) => !n.parentElement.closest('h1, h2, h3, h4, h5, h6, p'));
  const headingCount = nodes.filter((n) => /^H[1-6]$/.test(n.tagName)).length;
  let headingIndex = 0;
  const content = [];
  nodes.forEach((n) => {
    if (/^H[1-6]$/.test(n.tagName)) {
      const text = cleanText(n);
      if (!text) return;
      let level = 'h2';
      if (headingCount > 1) level = headingIndex === 0 ? 'h1' : 'h3';
      headingIndex += 1;
      const h = document.createElement(level);
      h.textContent = text;
      content.push(h);
    } else if (n.tagName === 'P') {
      if (!cleanText(n) && !n.querySelector('img')) return;
      content.push(n);
    } else if (n.tagName === 'A') {
      const text = cleanText(n);
      if (!text) return;
      const a = document.createElement('a');
      a.href = n.getAttribute('href');
      a.textContent = text;
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    } else if (n.tagName === 'IMG' && n.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = n.getAttribute('src');
      img.alt = (n.getAttribute('alt') || '').trim();
      const link = n.closest('a[href]');
      if (link && col.contains(link)) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.append(img);
        content.push(a);
      } else {
        content.push(img);
      }
    }
  });
  return content.length ? content : '';
}

export default function parse(element, { document }) {
  const root = element.querySelector('.columnselector.home-video') || element;
  const columns = [...root.querySelectorAll('[class*="columnselector"] > .row > [class*="col-"]')]
    .filter((c) => c.closest('.columnselector') === root);

  // Generic two-column selector (no .home-video video card): keep source column order.
  if (!columns.length) {
    const cs = element.matches('.columnselector') ? element : element.querySelector('.columnselector');
    const genericCols = cs
      ? [...cs.querySelectorAll(':scope > .clearfix > .containercustom > .row > [class*="col-"]')]
      : [];
    if (genericCols.length) {
      const row = genericCols.map((col) => buildGenericColumn(col, document));
      while (row.length < 2) row.push('');
      const genericBlock = WebImporter.Blocks.createBlock(document, { name: 'columns-video', cells: [row] });
      element.replaceWith(genericBlock);
      return;
    }
  }

  const [textCol, mediaCol] = columns;

  // Text column
  const textCell = [];
  if (textCol) {
    const rte = textCol.querySelector('.customrte');
    if (rte) {
      rte.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
        if (el.textContent.trim()) textCell.push(el);
      });
    }
    const cta = textCol.querySelector('.button-link a[href]');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      textCell.push(p);
    }
    const sideImg = textCol.querySelector('.cmp-image img');
    if (sideImg) textCell.push(sideImg);
  }

  // Media column: poster image wrapped in its YouTube link
  const mediaCell = [];
  if (mediaCol) {
    const img = mediaCol.querySelector('img');
    const link = mediaCol.querySelector('a[href]');
    if (img && link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.append(img);
      mediaCell.push(a);
    } else if (img) {
      mediaCell.push(img);
    } else if (link) {
      mediaCell.push(link);
    }
  }

  const cells = [[textCell.length ? textCell : '', mediaCell.length ? mediaCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-video', cells });
  element.replaceWith(block);
}
