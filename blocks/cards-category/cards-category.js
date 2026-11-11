import { createOptimizedPicture } from '../../scripts/aem.js';

const BLOCK = 'cards-category';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/* the card's destination: the title link, else the first body link, else any link */
function findCardLink(li) {
  return li.querySelector('h1 a[href], h2 a[href], h3 a[href], h4 a[href], h5 a[href], h6 a[href]')
    || li.querySelector(`.${BLOCK}-card-body a[href]`)
    || li.querySelector('a[href]');
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    // drop fully empty cells authors may leave behind
    [...li.children].forEach((div) => {
      if (!div.querySelector('picture, img') && !div.textContent.trim()) div.remove();
    });
    if (!li.children.length) return;

    [...li.children].forEach((div) => {
      if (div.querySelector('picture, img') && !div.textContent.trim()) div.className = `${BLOCK}-card-image`;
      else div.className = `${BLOCK}-card-body`;
    });

    const link = findCardLink(li);
    if (link) {
      // whole card is clickable: the link's ::after stretches over the card
      link.classList.add(`${BLOCK}-card-link`);
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      const container = link.closest('.button-container, .button-wrapper');
      if (container) container.classList.remove('button-container', 'button-wrapper');
      li.classList.add(`${BLOCK}-card-linked`);

      // an image link to the same destination would be a duplicate tab stop
      li.querySelectorAll(`.${BLOCK}-card-image a[href]`).forEach((a) => {
        if (a !== link && a.href === link.href) {
          a.setAttribute('tabindex', '-1');
          a.setAttribute('aria-hidden', 'true');
        }
      });
    }
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
}
