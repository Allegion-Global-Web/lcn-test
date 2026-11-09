/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-brands.
 * Source: #simple-related-brands .columnselector — one row, one column per brand
 * (Schlage, Von Duprin). Each column: logo image linked to the brand site, then
 * the description copy. Empty &nbsp; spacer paragraphs and leading <br>s dropped.
 */
function isFiller(p) {
  return !p.querySelector('img, picture') && !p.textContent.replace(/\u00a0/g, ' ').trim();
}

function stripLeadingBreaks(p) {
  let node = p.firstChild;
  while (node) {
    const nextNode = node.nextSibling;
    if (node.nodeType === 3 && !node.textContent.replace(/\u00a0/g, ' ').trim()) {
      node.remove();
    } else if (node.nodeType === 1 && node.tagName === 'BR') {
      node.remove();
    } else {
      if (node.nodeType === 3) node.textContent = node.textContent.replace(/^\s+/, '');
      break;
    }
    node = nextNode;
  }
}

function buildColumn(col, document) {
  const content = [];

  const img = col.querySelector('img');
  if (img) {
    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = img.getAttribute('alt') || '';
    const link = img.closest('a[href]');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.append(image);
      content.push(a);
    } else {
      content.push(image);
    }
  }

  col.querySelectorAll('.customrte p, .text p').forEach((p) => {
    if (content.includes(p) || isFiller(p)) return;
    stripLeadingBreaks(p);
    content.push(p);
  });

  return content.length ? content : '';
}

export default function parse(element, { document }) {
  let cols = [...element.querySelectorAll('.containercustom > .row > [class*="col-"]')];
  if (!cols.length) cols = [...element.querySelectorAll('.row > [class*="col-"]')];

  const row = cols.map((col) => buildColumn(col, document)).filter((c) => c !== '');
  const cells = row.length ? [row] : [];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-brands', cells });
  element.replaceWith(block);
}
