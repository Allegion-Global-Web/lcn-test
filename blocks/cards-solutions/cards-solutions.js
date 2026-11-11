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

/* source arrows: FontAwesome 4 angle-left/right glyphs at 70px (same outlines, 640-unit advance) */
const ARROW_PATHS = {
  prev: 'M1203 544q0 13-10 23l-393 393 393 393q10 10 10 23t-10 23l-50 50q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l466-466q10-10 23-10t23 10l50 50q10 10 10 23z',
  next: 'M1171 960q0 13-10 23l-466 466q-10 10-23 10t-23-10l-50-50q-10-10-10-23t10-23l393-393-393-393q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l466 466q10 10 10 23z',
};
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

function createArrow(dir, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${BLOCK}-arrow ${BLOCK}-${dir}`;
  button.setAttribute('aria-label', label);
  button.innerHTML = `<svg viewBox="576 0 640 1792" aria-hidden="true" focusable="false"><path d="${ARROW_PATHS[dir]}"/></svg>`;
  return button;
}

/* nearest heading before the block in its section names the carousel ("Related Products") */
function findLabel(block) {
  let el = block.closest(`.${BLOCK}-wrapper`)?.previousElementSibling;
  while (el) {
    const headings = el.matches('h1, h2, h3, h4, h5, h6') ? [el] : el.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length) return headings[headings.length - 1];
    el = el.previousElementSibling;
  }
  return null;
}

/*
 * Related Products below 768px: CSS scroll-snap track (1/2/3 cards per view, as the source's
 * slick breakpoints), native swipe; looping prev/next buttons shown only when the track scrolls
 */
function decorateCarousel(block, ul) {
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  const heading = findLabel(block);
  if (heading?.id) block.setAttribute('aria-labelledby', heading.id);

  const prev = createArrow('prev', 'Previous');
  const next = createArrow('next', 'Next');
  const status = document.createElement('p');
  status.className = `${BLOCK}-status`;
  status.setAttribute('aria-live', 'polite');

  const slideWidth = () => ul.firstElementChild?.getBoundingClientRect().width || 0;
  const perView = () => {
    const width = slideWidth();
    return width ? Math.max(1, Math.round(ul.clientWidth / width)) : 1;
  };
  const positions = () => Math.max(1, ul.children.length - perView() + 1);
  const current = () => {
    const width = slideWidth();
    return width ? Math.min(positions() - 1, Math.round(ul.scrollLeft / width)) : 0;
  };
  const isScrollable = () => ul.scrollWidth - ul.clientWidth > 1;

  const go = (index, focus) => {
    const count = positions();
    const target = (index + count) % count; // loops like the source (slick infinite)
    ul.scrollTo({ left: target * slideWidth(), behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth' });
    if (focus) ul.children[target]?.querySelector('a[href]')?.focus({ preventScroll: true });
  };

  prev.addEventListener('click', () => go(current() - 1));
  next.addEventListener('click', () => go(current() + 1));

  ul.addEventListener('keydown', (e) => {
    if (!isScrollable() || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    go(current() + (e.key === 'ArrowLeft' ? -1 : 1), true);
  });

  let announced = 0;
  let timer;
  ul.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const index = current();
      if (index === announced || !isScrollable()) return;
      announced = index;
      status.textContent = `${index + 1} of ${positions()}`;
    }, 150);
  }, { passive: true });

  new ResizeObserver(() => {
    block.classList.toggle(`${BLOCK}-scrollable`, isScrollable());
  }).observe(ul);

  block.prepend(prev, next);
  block.append(status);
}

/* section styles that paint a navy band behind the block (white card copy) */
const DARK_SECTION_STYLES = ['dark-blue', 'blue-gradient', 'gradient'];

/*
 * true when the block sits on a light band (e.g. a plain white "centered-heading" section):
 * no dark section style, no background image and no dark background colour
 */
function isOnLight(section) {
  if (!section) return true;
  // section styles may still sit in a not-yet-decorated section-metadata table
  const pending = [...section.querySelectorAll('.section-metadata > div')]
    .filter((row) => row.children[0]?.textContent.trim().toLowerCase() === 'style')
    .flatMap((row) => (row.children[1]?.textContent || '').split(','))
    .map((style) => style.trim().toLowerCase().replace(/\s+/g, '-'));
  const styles = [...section.classList, ...pending];
  if (DARK_SECTION_STYLES.some((style) => styles.includes(style))) return false;
  const { backgroundColor, backgroundImage } = getComputedStyle(section);
  if (backgroundImage && backgroundImage !== 'none') return false;
  const [r = 255, g = 255, b = 255, a = 1] = (backgroundColor.match(/[\d.]+/g) || []).map(Number);
  if (a === 0) return true;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.5;
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
      } else {
        // no CTA ("Related Products"): the linked title makes the whole card clickable
        const titleLink = body.querySelector(':is(h1, h2, h3, h4, h5, h6) a[href]');
        if (titleLink) {
          li.dataset.href = titleLink.href;
          li.classList.add(`${BLOCK}-card-linked`);
        }
      }
    }
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);

  /*
   * cards without a CTA paragraph are the light product-list look ("Related Products"):
   * dark copy on grey, no hover frame; the CTA cards keep the navy overlay look
   */
  if (ul.children.length && !ul.querySelector(`.${BLOCK}-card-cta`)) {
    block.classList.add(`${BLOCK}-related`);
    decorateCarousel(block, ul);
  } else if (ul.children.length) {
    // source column selector: one column per card (col-sm-6 for 2, col-sm-4 for 3), up to 4
    const columns = Math.min(ul.children.length, 4);
    block.classList.add(`${BLOCK}-cols-${columns}`);
    block.style.setProperty(`--${BLOCK}-columns`, columns);
    // same CTA cards on a white band (source why-lcn "Solutions Made Easy."): black copy
    const section = block.closest('.section');
    const update = () => block.classList.toggle(`${BLOCK}-on-light`, isOnLight(section));
    update();
    // section styles can land after this block decorates (section-metadata block)
    if (section) new MutationObserver(update).observe(section, { attributes: true, attributeFilter: ['class', 'style'] });
  }

  // whole card is clickable on source; keep real links/text selection working
  ul.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    if (window.getSelection()?.toString()) return;
    const li = e.target.closest(`li.${BLOCK}-card-linked`);
    if (li?.dataset.href) window.location.href = li.dataset.href;
  });
}
