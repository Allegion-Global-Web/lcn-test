import { createOptimizedPicture } from '../../scripts/aem.js';

const BLOCK = 'columns-brands';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/* the logo paragraph: holds a picture/img (optionally linked) and no text */
function isLogo(el) {
  return el.querySelector('picture, img') && !el.textContent.trim();
}

function setupColumn(col) {
  col.classList.add(`${BLOCK}-brand`);
  // drop empty spacer paragraphs (source pads copy with &nbsp; lines)
  [...col.querySelectorAll(':scope > p')].forEach((p) => {
    if (!p.children.length && !p.textContent.trim()) p.remove(); // trim() strips &nbsp; too
  });
  const logo = [...col.children].find(isLogo);
  if (logo) {
    logo.classList.add(`${BLOCK}-logo`);
    logo.querySelectorAll('a').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
    logo.classList.remove('button-container', 'button-wrapper');
  }
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  block.classList.add(`${BLOCK}-${firstRow.children.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add(`${BLOCK}-row`);
    [...row.children].forEach((col) => {
      if (!col.children.length && !col.textContent.trim()) {
        col.remove();
        return;
      }
      setupColumn(col);
    });
    if (!row.children.length) row.remove();
  });
  optimizeImages(block);
}
