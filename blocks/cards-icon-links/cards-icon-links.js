import { createOptimizedPicture } from '../../scripts/aem.js';

const BLOCK = 'cards-icon-links';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]));
  });
}

// icon images wider than this ratio carry their label baked in (icon + text artwork)
const LABELLED_IMAGE_RATIO = 1.5;

function flagLabelledImage(li) {
  const img = li.querySelector(`.${BLOCK}-card-image img`);
  if (!img || !li.querySelector(`.${BLOCK}-card-body a`)) return;
  const check = () => {
    if (img.naturalHeight && img.naturalWidth / img.naturalHeight > LABELLED_IMAGE_RATIO) {
      li.classList.add(`${BLOCK}-labelled`);
    }
  };
  if (img.complete) check();
  else img.addEventListener('load', check, { once: true });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) div.className = `${BLOCK}-card-image`;
      else div.className = `${BLOCK}-card-body`;
    });
    // drop fully empty cells authors may leave behind
    [...li.children].forEach((div) => {
      if (!div.children.length && !div.textContent.trim()) div.remove();
    });
    if (!li.children.length) return;
    // one link per card: make the icon part of the same link target
    const links = li.querySelectorAll('a');
    const image = li.querySelector(`.${BLOCK}-card-image`);
    if (links.length === 1 && image && !image.querySelector('a')) {
      const link = document.createElement('a');
      link.href = links[0].href;
      link.setAttribute('aria-hidden', 'true');
      link.tabIndex = -1;
      link.append(...image.childNodes);
      image.append(link);
    }
    ul.append(li);
  });
  optimizeImages(ul);
  ul.querySelectorAll(':scope > li').forEach(flagLabelledImage);
  block.replaceChildren(ul);
}
