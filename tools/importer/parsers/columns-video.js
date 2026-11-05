/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-video.
 * Source: div.allegion-container wrapping .columnselector.home-video (two columns).
 * One row, two cells:
 *   cell 1: heading, subheading, paragraph, CTA link (+ decorative product image)
 *   cell 2: video poster image linked to YouTube (link is preserved)
 */
export default function parse(element, { document }) {
  const root = element.querySelector('.columnselector.home-video') || element;
  const columns = [...root.querySelectorAll('[class*="columnselector"] > .row > [class*="col-"]')]
    .filter((c) => c.closest('.columnselector') === root);
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
