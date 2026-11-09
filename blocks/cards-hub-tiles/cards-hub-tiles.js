import { createOptimizedPicture } from '../../scripts/aem.js';

const BLOCK = 'cards-hub-tiles';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/* the tile's destination: the heading link, else the first link in the tile */
function findTileLink(li) {
  return li.querySelector('h1 a[href], h2 a[href], h3 a[href], h4 a[href], h5 a[href], h6 a[href]')
    || li.querySelector('a[href]');
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    // drop fully empty cells authors may leave behind
    [...li.children].forEach((div) => {
      if (!div.children.length && !div.textContent.trim()) div.remove();
    });
    if (!li.children.length) return;

    [...li.children].forEach((div) => {
      if (div.querySelector('picture, img') && !div.textContent.trim()) div.className = `${BLOCK}-tile-image`;
      else div.className = `${BLOCK}-tile-body`;
    });

    const link = findTileLink(li);
    if (link) {
      // whole tile is clickable; the link's ::after stretches over the tile
      link.classList.add(`${BLOCK}-tile-link`);
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      const container = link.closest('.button-container, .button-wrapper');
      if (container) container.classList.remove('button-container', 'button-wrapper');
      li.classList.add(`${BLOCK}-tile-linked`);
    }
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
}
