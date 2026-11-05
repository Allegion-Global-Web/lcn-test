/**
 * carousel-featured: featured product slides. Each row is one slide with an
 * image cell and a content cell (eyebrow, title, description, CTA) shown side
 * by side, plus prev/next arrows and dot indicators.
 */
const BLOCK = 'carousel-featured';

function updateActiveSlide(slide) {
  const block = slide.closest(`.${BLOCK}`);
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll(`.${BLOCK}-slide`).forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll(`.${BLOCK}-slide-indicator`).forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll(`.${BLOCK}-slide`);
  if (!slides.length) return;
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector(`.${BLOCK}-slides`).scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector(`.${BLOCK}-slide-indicators`);
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll(`.${BLOCK}-slide`).forEach((slide) => slideObserver.observe(slide));
}

// source (Bootstrap carousel): advances every 5s, wraps, pauses on hover
const AUTOPLAY_INTERVAL = 5000;

function startAutoplay(block) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let paused = false;
  const pause = () => { paused = true; };
  const resume = () => { paused = false; };
  block.addEventListener('mouseenter', pause);
  block.addEventListener('mouseleave', resume);
  block.addEventListener('focusin', pause);
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget)) resume();
  });
  // only rotate while on screen (the active-slide observer needs visibility)
  let visible = false;
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.5 }).observe(block);
  setInterval(() => {
    if (paused || !visible || document.hidden) return;
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) + 1);
  }, AUTOPLAY_INTERVAL);
}

function isImageCell(cell) {
  return !!cell.querySelector('picture') && !cell.textContent.trim();
}

function isTextParagraph(el) {
  return el && el.tagName === 'P' && !!el.textContent.trim() && !el.querySelector('a, picture');
}

function markContent(content) {
  // a paragraph holding only a link is the outlined CTA
  content.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a');
    if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
      p.classList.add(`${BLOCK}-cta`);
    }
  });

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;

  // short paragraphs placed before the title heading are the eyebrow
  let prev = heading.previousElementSibling;
  while (prev) {
    if (isTextParagraph(prev)) prev.classList.add(`${BLOCK}-eyebrow`);
    prev = prev.previousElementSibling;
  }

  // a short line right after the title, followed by more copy, is a subtitle
  const next = heading.nextElementSibling;
  if (isTextParagraph(next) && isTextParagraph(next.nextElementSibling)
    && next.textContent.trim().length <= 80) {
    next.classList.add(`${BLOCK}-subtitle`);
  }
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `${BLOCK}-${carouselId}-slide-${slideIndex}`);
  slide.classList.add(`${BLOCK}-slide`);

  const cells = [...row.querySelectorAll(':scope > div')];
  cells.forEach((cell) => {
    if (isImageCell(cell)) {
      cell.classList.add(`${BLOCK}-slide-image`);
    } else {
      cell.classList.add(`${BLOCK}-slide-content`);
      markContent(cell);
    }
    slide.append(cell);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy && labeledBy.id) slide.setAttribute('aria-labelledby', labeledBy.id);

  return slide;
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `${BLOCK}-${carouselId}`);
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add(`${BLOCK}-slides-container`);

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add(`${BLOCK}-slides`);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add(`${BLOCK}-navigation-buttons`);
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;
    container.append(slideNavButtons);

    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add(`${BLOCK}-slide-indicators`);
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, carouselId));
    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add(`${BLOCK}-slide-indicator`);
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
    startAutoplay(block);
  }
}
