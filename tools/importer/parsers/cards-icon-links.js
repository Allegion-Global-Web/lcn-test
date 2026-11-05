/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-links.
 * Source: .columnselector.Icon_size--mobile, three columns each holding a linked icon image.
 * One row per card: [ icon image | link whose label is the image alt text ].
 * The source has no visible label text; it only exists as image alt text.
 */
export default function parse(element, { document }) {
  const cells = [];
  const columns = element.querySelectorAll('.row > [class*="col-"]');

  columns.forEach((col) => {
    const img = col.querySelector('img');
    const link = col.querySelector('a[href]');
    if (!img && !link) return;

    const label = (img && (img.getAttribute('alt') || '').trim())
      || (link && link.textContent.trim())
      || '';

    const imageCell = img ? [img] : [''];
    let textCell = [''];
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = label || a.href;
      const p = document.createElement('p');
      p.append(a);
      textCell = [p];
    } else if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      textCell = [p];
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-links', cells });
  element.replaceWith(block);
}
