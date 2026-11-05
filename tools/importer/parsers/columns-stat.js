/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-stat.
 * Source: div.contentcontainer holding an .imageText (statement text + stat image linked to a PDF).
 * One row, two cells: [ statement paragraph(s) | stat image wrapped in its link ].
 */
export default function parse(element, { document }) {
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
