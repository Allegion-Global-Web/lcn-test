/*
 * Footer block.
 * All copy, links and images come from the footer fragment
 * (content/footer.plain.html). This file only builds layout shells and
 * interactive controls around that content.
 *
 * Fragment contract (one top-level <div> per footer band):
 * - A band that contains headings is a CTA band: an optional leading image,
 *   then one group per heading (heading, copy, a link that becomes the CTA).
 * - A band without headings is a link band: linked logos, link lists,
 *   a list of linked images (social icons), standalone text links (rendered
 *   as utility buttons) and a text paragraph (legal line) that starts the
 *   bottom legal row.
 */

/**
 * Fetches the footer fragment. Metadata-independent: /content first (local
 * preview), then the site root (DA / EDS production).
 * @returns {Promise<DocumentFragment|null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const template = document.createElement('template');
  template.innerHTML = html;
  const base = new URL(resp.url || '/footer.plain.html', window.location.href);
  // resolve relative media paths against the fragment location (not the page)
  template.content.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:|data:|\/)/.test(src)) {
      img.setAttribute('src', new URL(src, base).pathname);
    }
    img.loading = 'lazy';
  });
  // EDS serves fragment images as <picture> with relative ./media_* srcsets
  template.content.querySelectorAll('source[srcset]').forEach((source) => {
    const srcset = source.getAttribute('srcset');
    if (srcset && !/^(https?:|data:|\/)/.test(srcset)) {
      const url = new URL(srcset, base);
      source.setAttribute('srcset', `${url.pathname}${url.search}`);
    }
  });
  return template.content;
}

function createElement(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function isExternal(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.origin !== window.location.origin && /^https?:$/.test(url.protocol);
  } catch (e) {
    return false;
  }
}

function openInNewTab(a) {
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
}

function decorateLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (isExternal(a.getAttribute('href'))) openInNewTab(a);
  });
}

/** True if the element holds only linked/unlinked images and no text. */
function isMediaOnly(el) {
  return !!el.querySelector('img') && el.textContent.trim() === '';
}

/** True if the paragraph holds nothing but a single link. */
function isLinkOnly(el) {
  const a = el.querySelector(':scope > a');
  return !!a && el.children.length === 1 && el.textContent.trim() === a.textContent.trim();
}

/** Wraps a standalone text link paragraph as a utility (button-styled) link. */
function buildUtilityLink(p) {
  const wrapper = createElement('div', 'footer-utility');
  const link = p.querySelector('a');
  link.classList.add('footer-utility-link');
  wrapper.append(link);
  return wrapper;
}

/**
 * CTA band: [media] + one item per heading (heading, copy, CTA link).
 * @param {Element} section fragment section
 */
function buildCtaBand(section) {
  const band = createElement('section', 'footer-cta-band');
  const inner = createElement('div', 'footer-cta-band-inner');
  band.append(inner);

  let current = null;
  [...section.children].forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName)) {
      current = {
        item: createElement('div', 'footer-cta-item'),
        text: createElement('div', 'footer-cta-text'),
        action: createElement('div', 'footer-cta-action'),
      };
      current.item.append(current.text, current.action);
      inner.append(current.item);
      current.text.append(child);
      return;
    }
    if (!current) {
      if (isMediaOnly(child)) {
        const media = createElement('div', 'footer-cta-media');
        media.append(...child.childNodes);
        inner.append(media);
      }
      return;
    }
    if (child.tagName === 'P' && isLinkOnly(child)) {
      const link = child.querySelector('a');
      link.classList.add('footer-cta-button');
      current.action.append(link);
      return;
    }
    current.text.append(child);
  });
  return band;
}

/** Wraps a linked image paragraph as a logo slot. */
function buildLogo(p, className) {
  const wrapper = createElement('div', className);
  wrapper.append(...p.childNodes);
  return wrapper;
}

/**
 * Link band: logos, link list, utility link and social list in the top
 * row; the first text paragraph and anything after it in the legal row.
 * @param {Element} section fragment section
 */
function buildLinkBand(section) {
  const band = createElement('section', 'footer-main');
  const top = createElement('div', 'footer-main-top');
  const legal = createElement('div', 'footer-main-legal');
  let inLegal = false;

  [...section.children].forEach((child) => {
    const target = inLegal ? legal : top;
    if (child.tagName === 'UL') {
      const items = [...child.children];
      const social = items.length > 0 && items.every((li) => isMediaOnly(li));
      child.classList.add(social ? 'footer-social' : 'footer-links');
      if (social) child.querySelectorAll('a[href]').forEach(openInNewTab);
      target.append(child);
      return;
    }
    if (child.tagName === 'P' && isMediaOnly(child)) {
      target.append(buildLogo(child, inLegal ? 'footer-parent-brand' : 'footer-brand'));
      return;
    }
    if (!inLegal && child.tagName === 'P' && isLinkOnly(child)) {
      target.append(buildUtilityLink(child));
      return;
    }
    if (child.tagName === 'P' && child.textContent.trim()) {
      inLegal = true;
      child.classList.add('footer-legal-text');
      legal.append(child);
      return;
    }
    target.append(child);
  });

  band.append(top);
  if (legal.children.length) band.append(legal);
  return band;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  block.textContent = '';
  if (!fragment) return;

  const content = createElement('div', 'footer-content');
  [...fragment.children].forEach((section) => {
    if (section.tagName !== 'DIV') return;
    const hasHeading = !!section.querySelector('h1, h2, h3, h4, h5, h6');
    content.append(hasHeading ? buildCtaBand(section) : buildLinkBand(section));
  });

  decorateLinks(content);
  block.append(content);
}
