/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-attributes.
 * Source: .xtra-xtra-parsys .fullWidthColumnSelector — columns (.col-xs-6) of
 * .customrte blocks, each <p> holding an icon <img> followed by a label
 * (plain text or a link, optionally with <sup>).
 * One row per attribute: [ icon image | label (link kept when linked) ].
 */
const WS = /^[\s ]+|[\s ]+$/g;

function trimEdges(container) {
  // trim leading/trailing whitespace (incl. &nbsp;) across the label's edge text nodes
  const walker = container.ownerDocument.createTreeWalker(container, 4 /* NodeFilter.SHOW_TEXT */);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  const first = texts.find((t) => t.textContent.replace(WS, ''));
  const last = [...texts].reverse().find((t) => t.textContent.replace(WS, ''));
  texts.forEach((t) => {
    if (t === first || t === last) return;
    const before = first && (first.compareDocumentPosition(t) & 2); // t precedes first
    const after = last && (last.compareDocumentPosition(t) & 4); // t follows last
    if (before || after) t.remove();
  });
  if (first) first.textContent = first.textContent.replace(/^[\s ]+/, '');
  if (last) last.textContent = last.textContent.replace(/[\s ]+$/, '');
}

function buildLabel(item, document) {
  const label = document.createElement('p');
  [...item.childNodes].forEach((node) => {
    if (node.nodeType === 1 && (node.matches('img, picture, br') || node.querySelector('img, picture'))) {
      // keep a linked label even if the link also wraps the icon
      if (node.matches('a[href]') && node.textContent.replace(WS, '')) {
        const a = document.createElement('a');
        a.href = node.getAttribute('href');
        [...node.childNodes].forEach((c) => {
          if (!(c.nodeType === 1 && c.matches('img, picture'))) a.append(c.cloneNode(true));
        });
        label.append(a);
      }
      return;
    }
    label.append(node.cloneNode(true));
  });
  // drop empty links left after removing whitespace-only content
  label.querySelectorAll('a').forEach((a) => {
    if (!a.textContent.replace(WS, '')) a.remove();
  });
  trimEdges(label);
  return label;
}

export default function parse(element, { document }) {
  const cells = [];

  // each attribute is a paragraph (or list item) carrying an icon; document order = column order
  const items = [...element.querySelectorAll('p, li')].filter(
    (el) => el.querySelector('img') && !el.parentElement.closest('p, li'),
  );

  items.forEach((item) => {
    const icon = item.querySelector('img');
    const img = document.createElement('img');
    img.src = icon.getAttribute('src');
    img.alt = (icon.getAttribute('alt') || '').trim();

    const label = buildLabel(item, document);
    const hasLabel = !!label.textContent.replace(WS, '');
    if (!img.getAttribute('src') && !hasLabel) return;

    cells.push([img.getAttribute('src') ? img : '', hasLabel ? label : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-attributes', cells });
  element.replaceWith(block);
}
