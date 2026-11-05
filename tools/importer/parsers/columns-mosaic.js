/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-mosaic.
 * Source: TWO sibling .columnselector.home_img--hover rows that together form ONE block.
 *   row 1: video tile (image linked to YouTube) | wide photo
 *   row 2: photo | photo | text tile ("A Shared Commitment")
 * On the first match both rows are collected into one block and the second source
 * element is removed. A later match (if still present) is skipped.
 * Rows keep their natural cell counts: the block JS spans the last cell of a
 * shorter row across the remaining columns.
 */
const SELECTOR = '.columnselector.home_img--hover';

function buildTile(col, document) {
  const content = [];

  // Text tile: heading lines merged into one heading. Any <img> here is the
  // solid-color tile background (styling, not content) and is dropped.
  const rte = col.querySelector('.customrte');
  if (rte) {
    const headings = [...rte.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter((h) => h.textContent.trim());
    if (headings.length) {
      const heading = document.createElement(headings[0].tagName.toLowerCase());
      headings.forEach((h, i) => {
        if (i > 0) heading.append(document.createElement('br'));
        heading.append(document.createTextNode(h.textContent.replace(/\s+/g, ' ').trim()));
      });
      content.push(heading);
    }
    rte.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim()) content.push(p);
    });
    return content.length ? content : '';
  }

  // Image / video tile
  const img = col.querySelector('img');
  const link = col.querySelector('a[href]');
  if (img && link) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.append(img);
    content.push(a);
  } else if (img) {
    content.push(img);
  } else if (link) {
    content.push(link);
  }
  return content.length ? content : '';
}

function buildRow(rowEl, document) {
  const cols = [...rowEl.querySelectorAll(':scope > div > div > .row > [class*="col-"]')];
  return cols.map((col) => buildTile(col, document));
}

export default function parse(element, { document }) {
  // Second match already merged into the first block (detached): do nothing
  if (!element.parentNode) return;

  const doc = element.ownerDocument || document;
  const all = [...doc.querySelectorAll(SELECTOR)];
  const idx = all.indexOf(element);
  // A later match whose preceding row is still pending will be collected by the first: skip
  if (idx > 0 && all[idx - 1].parentNode === element.parentNode) return;

  const rowEls = [element];
  let next = element.nextElementSibling;
  while (next && next.matches(SELECTOR)) {
    rowEls.push(next);
    next = next.nextElementSibling;
  }

  const cells = rowEls
    .map((rowEl) => buildRow(rowEl, document))
    .filter((row) => row.length);

  rowEls.slice(1).forEach((el) => el.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-mosaic', cells });
  element.replaceWith(block);
}
