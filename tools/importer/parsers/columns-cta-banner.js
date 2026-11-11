/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-cta-banner.
 * Source: .columnselector.flex-text-center-align — a row of two Bootstrap columns:
 *   - text column (.col-sm-9): decorative .background-image texture + .customrte
 *     (heading, paragraph) + .button-link CTA
 *   - icon column (.col-sm-3): .cmp-image icon
 * One row, two cells: [ heading, text, CTA link | icon image ].
 * The text column's background texture is panel styling and is dropped.
 */
export default function parse(element, { document }) {
  const row = element.querySelector('.row');
  const cols = row ? [...row.children].filter((c) => /\bcol-/.test(c.className)) : [];
  // text column = the one with rich text or a CTA; icon column = the other one with an image
  const textCol = cols.find((c) => c.querySelector('.customrte, .text, h1, h2, h3, h4, h5, h6, p, .button-link'))
    || element;
  const iconCol = cols.find((c) => c !== textCol && c.querySelector('img'));

  const textCell = [];
  textCol.querySelectorAll('.customrte h1, .customrte h2, .customrte h3, .customrte h4, .customrte h5, .customrte h6, .customrte p, .customrte ul, .customrte ol')
    .forEach((el) => {
      if (el.parentElement.closest('ul, ol')) return;
      if (el.textContent.replace(/[\s ]+/g, '')) {
        const clean = el.cloneNode(true);
        // drop styling-only wrappers: <h3><span>Need Replacement Parts?</span></h3>
        clean.querySelectorAll('span').forEach((s) => s.replaceWith(...s.childNodes));
        textCell.push(clean);
      }
    });

  textCol.querySelectorAll('.button-link a[href], a.alle-core-btn-link[href]').forEach((link) => {
    if (textCell.some((el) => el.contains(link))) return;
    const text = link.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = text;
    const p = document.createElement('p');
    p.append(a);
    textCell.push(p);
  });

  const iconCell = [];
  const icon = iconCol && iconCol.querySelector('img');
  if (icon) {
    const img = document.createElement('img');
    img.src = icon.getAttribute('src');
    img.alt = (icon.getAttribute('alt') || '').trim();
    iconCell.push(img);
  }

  const cells = [[textCell.length ? textCell : '', iconCell.length ? iconCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta-banner', cells });
  element.replaceWith(block);
}
