/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-stat.
 * Two source structures (detected by markup):
 *  A) Homepage: div.contentcontainer holding an .imageText (.textWithIcon: statement text
 *     + stat image linked to a PDF).
 *  B) Product detail ("Did you know?"): .columnselector with two Bootstrap columns —
 *     .customrte text (heading + paragraph) | .cmp-image stat graphic.
 * One row, two cells: [ heading/statement paragraph(s) | stat image (wrapped in its link if any) ].
 */
function parseColumnSelector(element, document) {
  const row = element.querySelector('.row');
  const cols = row ? [...row.children].filter((c) => /\bcol-/.test(c.className)) : [];
  const textCol = cols.find((c) => c.querySelector('.customrte, .text')) || element;
  const mediaCol = cols.find((c) => c !== textCol && c.querySelector('img')) || element;

  const textCell = [];
  textCol.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
    if (!el.textContent.replace(/[\s ]+/g, '')) return;
    const clean = el.cloneNode(true);
    // drop styling-only spans (inline color on the "Did You Know?" heading)
    clean.querySelectorAll('span').forEach((s) => s.replaceWith(...s.childNodes));
    clean.removeAttribute('role');
    clean.removeAttribute('aria-level');
    textCell.push(clean);
  });

  const mediaCell = [];
  const srcImg = mediaCol.querySelector('img');
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = (srcImg.getAttribute('alt') || '').trim();
    const link = srcImg.closest('a[href]');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.append(img);
      mediaCell.push(a);
    } else {
      mediaCell.push(img);
    }
  }
  return [[textCell.length ? textCell : '', mediaCell.length ? mediaCell : '']];
}

export default function parse(element, { document }) {
  if (!element.querySelector('.textWithIcon') && element.querySelector('.row > [class*="col-"]')) {
    const csCells = parseColumnSelector(element, document);
    const csBlock = WebImporter.Blocks.createBlock(document, { name: 'columns-stat', cells: csCells });
    element.replaceWith(csBlock);
    return;
  }

  const textCell = [];
  const textCol = element.querySelector('.textWithIcon .text');
  if (textCol) {
    textCol.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
      if (el.textContent.trim()) textCell.push(el);
    });
  }

  const mediaCell = [];
  const img = element.querySelector('.textWithIcon img');
  if (img) {
    const linkSrc = img.closest('a[href]') || element.querySelector('.textWithIcon a[href]');
    if (linkSrc) {
      const a = document.createElement('a');
      a.href = linkSrc.getAttribute('href');
      a.append(img);
      mediaCell.push(a);
    } else {
      mediaCell.push(img);
    }
  }

  const cells = [[textCell.length ? textCell : '', mediaCell.length ? mediaCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stat', cells });
  element.replaceWith(block);
}
