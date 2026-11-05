import { createOptimizedPicture } from '../../scripts/aem.js';

const BLOCK = 'cards-solutions';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/* "Solutions by<br>Market": wrap the text after the first <br> for the green accent line */
function accentHeading(heading) {
  const br = heading.querySelector(':scope > br');
  if (!br || !br.nextSibling) return;
  const span = document.createElement('span');
  span.className = `${BLOCK}-accent`;
  while (br.nextSibling) span.append(br.nextSibling);
  if (span.textContent.trim()) br.after(span);
}

/* a paragraph holding nothing but one link is the card CTA ("Go Now") */
function findCta(body) {
  return [...body.querySelectorAll(':scope > p')].reverse().find((p) => {
    const links = p.querySelectorAll('a[href]');
    return links.length === 1 && p.textContent.trim() === links[0].textContent.trim();
  });
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

    const body = li.querySelector(`.${BLOCK}-card-body`);
    if (body) {
      body.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(accentHeading);
      const cta = findCta(body);
      if (cta) {
        // replaces any EDS button-container/button-wrapper class; CTA is styled in-block
        cta.className = `${BLOCK}-card-cta`;
        const link = cta.querySelector('a');
        link.classList.remove('button', 'primary', 'secondary', 'accent');
        // source shows the CTA as a hover overlay on the image
        const image = li.querySelector(`.${BLOCK}-card-image`);
        if (image) image.append(cta);
        li.dataset.href = link.href;
        li.classList.add(`${BLOCK}-card-linked`);
      }
    }
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);

  // whole card is clickable on source; keep real links/text selection working
  ul.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    if (window.getSelection()?.toString()) return;
    const li = e.target.closest(`li.${BLOCK}-card-linked`);
    if (li?.dataset.href) window.location.href = li.dataset.href;
  });
}
