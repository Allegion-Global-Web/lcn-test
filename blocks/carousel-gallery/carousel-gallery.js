import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * carousel-gallery: product image gallery. Each row is one image (optional
 * caption cell). Shows one large image at a time with round thumbnail
 * buttons below (the source has no visible prev/next arrows; arrow keys
 * still work). Slides move horizontally like the source; auto-rotates
 * unless the user prefers reduced motion; pauses on hover, focus, or when
 * off screen.
 */
const BLOCK = 'carousel-gallery';
const AUTOPLAY_INTERVAL = 5000;
const SLIDE_DURATION = 600;

const ACTIVE = `${BLOCK}-slide-active`;
const ENTER_NEXT = `${BLOCK}-slide-enter-next`;
const ENTER_PREV = `${BLOCK}-slide-enter-prev`;
const LEAVE_NEXT = `${BLOCK}-slide-leave-next`;
const LEAVE_PREV = `${BLOCK}-slide-leave-prev`;
const MOTION_STATES = [ENTER_NEXT, ENTER_PREV, LEAVE_NEXT, LEAVE_PREV];

function optimizeImages(root, width) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width }]));
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function currentIndex(block) {
  return parseInt(block.dataset.activeSlide || 0, 10);
}

/**
 * Activates a slide. direction: 'next' (new slide enters from the right),
 * 'prev' (enters from the left) or null (no animation).
 */
function showSlide(block, index, direction = null) {
  const slides = [...block.querySelectorAll(`.${BLOCK}-slide`)];
  if (!slides.length) return;
  const active = ((index % slides.length) + slides.length) % slides.length;
  const previous = slides.find((slide) => slide.classList.contains(ACTIVE));
  block.dataset.activeSlide = active;

  // settle any slide still mid-transition
  slides.forEach((slide) => slide.classList.remove(...MOTION_STATES));

  const incoming = slides[active];
  const animate = direction && previous && previous !== incoming && !prefersReducedMotion();
  if (animate) {
    incoming.classList.add(direction === 'next' ? ENTER_NEXT : ENTER_PREV);
    // force layout so the start position applies before the transition
    incoming.getBoundingClientRect();
    incoming.classList.remove(ENTER_NEXT, ENTER_PREV);
    const leaving = direction === 'next' ? LEAVE_NEXT : LEAVE_PREV;
    previous.classList.add(leaving);
    window.setTimeout(() => previous.classList.remove(leaving), SLIDE_DURATION);
  }

  slides.forEach((slide, idx) => {
    const isActive = idx === active;
    slide.classList.toggle(ACTIVE, isActive);
    slide.setAttribute('aria-hidden', !isActive);
    slide.querySelectorAll('a').forEach((link) => {
      if (isActive) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll(`.${BLOCK}-thumb-button`).forEach((button, idx) => {
    if (idx === active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}

function goTo(block, index) {
  const current = currentIndex(block);
  if (index === current) return;
  showSlide(block, index, index > current ? 'next' : 'prev');
}

function startAutoplay(block) {
  if (prefersReducedMotion()) return;
  let hovered = false;
  let focused = false;
  let visible = false;
  block.addEventListener('mouseenter', () => { hovered = true; });
  block.addEventListener('mouseleave', () => { hovered = false; });
  block.addEventListener('focusin', () => { focused = true; });
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget)) focused = false;
  });
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.25 }).observe(block);
  setInterval(() => {
    if (hovered || focused || !visible || document.hidden) return;
    showSlide(block, currentIndex(block) + 1, 'next');
  }, AUTOPLAY_INTERVAL);
}

function buildThumb(slide, idx, total) {
  const li = document.createElement('li');
  li.className = `${BLOCK}-thumb`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${BLOCK}-thumb-button`;
  button.dataset.targetSlide = idx;
  button.setAttribute('aria-label', `Show image ${idx + 1} of ${total}`);
  button.setAttribute('aria-controls', slide.id);
  const img = slide.querySelector('img');
  if (img) {
    const thumbImg = document.createElement('img');
    thumbImg.src = img.currentSrc || img.src;
    thumbImg.alt = '';
    thumbImg.loading = 'lazy';
    button.append(thumbImg);
  }
  li.append(button);
  return li;
}

let galleryId = 0;
export default function decorate(block) {
  galleryId += 1;
  const id = `${BLOCK}-${galleryId}`;
  block.id = id;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.getAttribute('aria-label')) block.setAttribute('aria-label', 'Product images');

  const slidesList = document.createElement('ul');
  slidesList.className = `${BLOCK}-slides`;

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((cell) => cell.querySelector('picture'));
    if (!imageCell) return;
    const slide = document.createElement('li');
    slide.className = `${BLOCK}-slide`;
    slide.setAttribute('aria-roledescription', 'slide');
    const media = document.createElement('div');
    media.className = `${BLOCK}-slide-image`;
    media.append(imageCell.querySelector('picture'));
    slide.append(media);
    const caption = cells.find((cell) => cell !== imageCell && cell.textContent.trim());
    if (caption) {
      caption.className = `${BLOCK}-slide-caption`;
      slide.append(caption);
    }
    slidesList.append(slide);
  });

  const slides = [...slidesList.children];
  slides.forEach((slide, idx) => {
    slide.id = `${id}-slide-${idx}`;
    slide.setAttribute('aria-label', `${idx + 1} of ${slides.length}`);
  });
  optimizeImages(slidesList, '750');

  const stage = document.createElement('div');
  stage.className = `${BLOCK}-stage`;
  stage.append(slidesList);
  block.replaceChildren(stage);

  if (slides.length < 2) {
    showSlide(block, 0);
    return;
  }

  const thumbsNav = document.createElement('nav');
  thumbsNav.setAttribute('aria-label', 'Gallery image controls');
  const thumbs = document.createElement('ol');
  thumbs.className = `${BLOCK}-thumbs`;
  slides.forEach((slide, idx) => thumbs.append(buildThumb(slide, idx, slides.length)));
  thumbsNav.append(thumbs);
  block.append(thumbsNav);

  thumbs.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-target-slide]');
    if (button) goTo(block, parseInt(button.dataset.targetSlide, 10));
  });
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showSlide(block, currentIndex(block) - 1, 'prev');
    else if (e.key === 'ArrowRight') showSlide(block, currentIndex(block) + 1, 'next');
  });

  showSlide(block, 0);
  startAutoplay(block);
}
