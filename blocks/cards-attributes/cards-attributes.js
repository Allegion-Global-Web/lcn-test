import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-attributes: product attribute list. Each row is one item: a small
 * icon cell and a label cell (the label may be a link). Rendered as a
 * list that flows into two columns on wider screens.
 */
const BLOCK = 'cards-attributes';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '80' }]));
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = `${BLOCK}-item`;
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => {
      if (!cell.children.length && !cell.textContent.trim()) {
        cell.remove();
      } else if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = `${BLOCK}-icon`;
      } else {
        cell.className = `${BLOCK}-label`;
      }
    });
    if (!li.children.length) return;
    // a linked label is a plain text link, not a button
    li.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
    li.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
    // icons are decorative next to their label
    li.querySelectorAll(`.${BLOCK}-icon img`).forEach((img) => {
      if (li.querySelector(`.${BLOCK}-label`)) img.alt = '';
    });
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
}
