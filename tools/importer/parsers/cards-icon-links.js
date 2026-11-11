/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-links.
 * Source: .columnselector.Icon_size--mobile, three columns each holding a linked icon image.
 * One row per card: [ icon image | link whose label is the image alt text ].
 * The source has no visible label text; it only exists as image alt text.
 */
function cleanText(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Icon + text items (why-lcn "Durability / Precision / Trust"): each .imageText
 * holds an icon, a real heading and a description, no link.
 * Row: [ icon (alt = title) | H3 title, description paragraph(s) ].
 */
function parseTextWithIcon(items, document) {
  const cells = [];
  items.forEach((item) => {
    const srcImg = item.querySelector('.icon img, img');
    const textBox = item.querySelector('.text') || item;
    const titleEl = textBox.querySelector('h1, h2, h3, h4, h5, h6');
    const title = cleanText(titleEl);

    let imageCell = '';
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = srcImg.getAttribute('src');
      img.alt = title || (srcImg.getAttribute('alt') || '').trim();
      const link = srcImg.closest('a[href]');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.append(img);
        imageCell = a;
      } else {
        imageCell = img;
      }
    }

    const content = [];
    if (title) {
      const h = document.createElement('h3');
      h.textContent = title;
      content.push(h);
    }
    textBox.querySelectorAll('p').forEach((p) => {
      if (!cleanText(p)) return;
      if (p.querySelector('a[href]')) {
        content.push(p);
      } else {
        const para = document.createElement('p');
        para.textContent = cleanText(p);
        content.push(para);
      }
    });

    if (!imageCell && !content.length) return;
    cells.push([imageCell, content.length ? content : '']);
  });
  return cells;
}

export default function parse(element, { document }) {
  const iconItems = [...element.querySelectorAll('.imageText')]
    .filter((item) => item.querySelector('.textWithIcon .text h1, .textWithIcon .text h2, .textWithIcon .text h3, .textWithIcon .text h4, .textWithIcon .text h5, .textWithIcon .text h6'));
  if (iconItems.length) {
    const iconCells = parseTextWithIcon(iconItems, document);
    const iconBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-links', cells: iconCells });
    element.replaceWith(iconBlock);
    return;
  }

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
