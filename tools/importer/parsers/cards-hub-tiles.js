/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-hub-tiles.
 * Source: THREE sibling .imageText.hubpage__tiles--view tiles (Solutions by
 * Market / Role / Requirement) that together form ONE block, one row per tile:
 *   cell 1: tile image
 *   cell 2: heading linked to the tile's detail page + description paragraph(s)
 * On the first match all sibling tiles are collected and the others removed.
 * Later matches are already detached (or pending under the first) and skipped.
 * The source nests <a> elements (invalid), which the HTML parser splits into
 * empty anchors; content is therefore rebuilt from the img / heading / p nodes.
 */
const SELECTOR = '.imageText.hubpage__tiles--view';

function isFiller(p) {
  return !p.querySelector('img, picture') && !p.textContent.replace(/\u00a0/g, ' ').trim();
}

function buildRow(tile, document) {
  const img = tile.querySelector('img');
  const heading = [...tile.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .find((h) => h.textContent.trim());
  const linkEl = (heading && heading.querySelector('a[href]')) || tile.querySelector('a[href]');
  const href = linkEl ? linkEl.getAttribute('href') : '';

  const imageCell = [];
  if (img) {
    const image = document.createElement('img');
    image.src = img.getAttribute('src');
    image.alt = img.getAttribute('alt') || '';
    imageCell.push(image);
  }

  const textCell = [];
  if (heading) {
    const h = document.createElement(heading.tagName.toLowerCase());
    const title = heading.textContent.replace(/\s+/g, ' ').trim();
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      h.append(a);
    } else {
      h.textContent = title;
    }
    textCell.push(h);
  }
  const textCol = (heading && heading.parentElement) || tile;
  textCol.querySelectorAll('p').forEach((p) => {
    if (!isFiller(p)) textCell.push(p);
  });

  if (!imageCell.length && !textCell.length) return null;
  return [imageCell.length ? imageCell : '', textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  // Already merged into the first block (detached): do nothing
  if (!element.parentNode) return;

  // A later tile whose preceding sibling tile is still pending will be collected by the first
  const prev = element.previousElementSibling;
  if (prev && prev.matches(SELECTOR)) return;

  const tiles = [element];
  let next = element.nextElementSibling;
  while (next && next.matches(SELECTOR)) {
    tiles.push(next);
    next = next.nextElementSibling;
  }

  const cells = tiles.map((tile) => buildRow(tile, document)).filter(Boolean);

  tiles.slice(1).forEach((el) => el.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-hub-tiles', cells });
  element.replaceWith(block);
}
