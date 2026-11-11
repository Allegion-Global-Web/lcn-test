/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-category.
 * Source: solution category pages (/en/solutions/by-market|by-role|by-requirement).
 * The category cards are split over SEVERAL sibling .columnselector rows
 * (3 + 2 on by-market, 3 + 3 + 3 on by-role, 3 + 3 on by-requirement) that
 * together form ONE block, one row per .imageText card:
 *   cell 1: card image (source alt kept as-is)
 *   cell 2: H4 title linked to the card's detail page + description paragraph(s)
 * On the first match every card of that row and of all following sibling
 * .columnselector rows is collected and the other rows are removed.
 * Later matches are already detached (or pending under the first) and skipped.
 * The source nests <a> elements around block content (invalid), which the HTML
 * parser splits into empty anchors; the title link is therefore rebuilt from the
 * card's first real href.
 */
const ROW_SELECTOR = '.columnselector';

function isCardRow(el) {
  return !!el && el.matches(ROW_SELECTOR) && !!el.querySelector('.imageText');
}

function cleanText(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

/* clone a paragraph, drop MS-Office comment anchors / empty links and collapse nbsp runs */
function cleanParagraph(p) {
  const clone = p.cloneNode(true);
  clone.querySelectorAll('a').forEach((a) => {
    const href = (a.getAttribute('href') || '').trim();
    if (!a.textContent.trim() && !a.querySelector('img')) a.remove();
    else if (href.startsWith('#_mso')) a.replaceWith(...a.childNodes);
  });
  const doc = clone.ownerDocument;
  const walker = doc.createTreeWalker(clone, 4 /* NodeFilter.SHOW_TEXT */);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => {
    t.textContent = t.textContent.replace(/[\s ]{2,}/g, ' ');
  });
  if (texts.length) {
    texts[0].textContent = texts[0].textContent.replace(/^[\s ]+/, '');
    const last = texts[texts.length - 1];
    last.textContent = last.textContent.replace(/[\s ]+$/, '');
  }
  if (!cleanText(clone.textContent) && !clone.querySelector('img, picture')) return null;
  return clone;
}

function buildRow(card, document) {
  const srcImg = card.querySelector('img');
  const heading = [...card.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .find((h) => cleanText(h.textContent));
  const linkEl = [...card.querySelectorAll('a[href]')]
    .find((a) => {
      const href = (a.getAttribute('href') || '').trim();
      return href && !href.startsWith('#') && !href.toLowerCase().startsWith('javascript:');
    });
  const href = linkEl ? linkEl.getAttribute('href').trim() : '';

  let imageCell = '';
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = (srcImg.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
    imageCell = img;
  }

  const textCell = [];
  const title = heading ? cleanText(heading.textContent) : '';
  if (title) {
    const h4 = document.createElement('h4');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      h4.append(a);
    } else {
      h4.textContent = title;
    }
    textCell.push(h4);
  }

  const textCol = (heading && heading.closest('.text')) || card;
  textCol.querySelectorAll('p').forEach((p) => {
    if (p.closest('h1, h2, h3, h4, h5, h6')) return;
    const cleaned = cleanParagraph(p);
    if (cleaned) textCell.push(cleaned);
  });

  if (!imageCell && !textCell.length) return null;
  return [imageCell, textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  // Already merged into the first block (detached): do nothing
  if (!element.parentNode) return;

  // A later row whose preceding card row is still pending will be collected by the first
  let prev = element.previousElementSibling;
  while (prev && !prev.matches(ROW_SELECTOR)) prev = prev.previousElementSibling;
  if (isCardRow(prev)) return;

  const rows = [element];
  let next = element.nextElementSibling;
  while (next && isCardRow(next)) {
    rows.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  rows.forEach((row) => {
    row.querySelectorAll('.imageText').forEach((card) => {
      const r = buildRow(card, document);
      if (r) cells.push(r);
    });
  });

  rows.slice(1).forEach((el) => el.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
