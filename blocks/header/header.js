// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/* section roles, in authoring order, inside nav.plain.html */
const SECTION_ROLES = ['family', 'utility', 'brand', 'sections', 'tools'];

let idCounter = 0;
function uniqueId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function createEl(tag, className, attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

/**
 * Appends nodes separated by whitespace so that the rendered text of the
 * container keeps natural word boundaries (textContent, copy/paste, a11y).
 */
function appendSpaced(parent, nodes) {
  nodes.filter(Boolean).forEach((node) => {
    parent.append(document.createTextNode('\n'), node);
  });
  parent.append(document.createTextNode('\n'));
  return parent;
}

/**
 * Fetches the nav fragment. Metadata-independent: /content first (local
 * preview), then the site root (DA / EDS production).
 * @returns {Promise<DocumentFragment|null>}
 */
async function fetchNavFragment() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const template = document.createElement('template');
  template.innerHTML = html;
  const base = new URL(resp.url || '/nav.plain.html', window.location.href);
  // resolve relative media paths against the fragment location (not the page)
  template.content.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:|data:|\/)/.test(src)) {
      img.setAttribute('src', new URL(src, base).pathname);
    }
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

function isExternal(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.origin !== window.location.origin && /^https?:$/.test(url.protocol);
  } catch (e) {
    return false;
  }
}

function decorateLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (isExternal(a.getAttribute('href'))) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

/** Unwraps <p> wrappers that only hold a single link or image. */
function unwrapParagraph(p) {
  const only = p.children.length === 1 ? p.firstElementChild : null;
  if (only && p.textContent.trim() === only.textContent.trim()) p.replaceWith(only);
}

function getDirectChildren(el, tagName) {
  return [...el.children].filter((child) => child.tagName === tagName);
}

/* ---------------- panel state ---------------- */

function closeAllPanels(nav, except) {
  nav.querySelectorAll('[aria-expanded="true"][data-nav-toggle]').forEach((toggle) => {
    if (toggle !== except) toggle.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Opens/closes a toggle. Toggles that share a nav item (trigger link + mobile
 * chevron) are kept in sync; every other open panel closes when one opens.
 */
function setExpanded(nav, toggle, expanded) {
  const item = toggle.closest('.nav-drop');
  const group = item ? [...item.querySelectorAll(':scope > [data-nav-toggle]')] : [toggle];
  if (expanded) {
    nav.querySelectorAll('[aria-expanded="true"][data-nav-toggle]').forEach((other) => {
      if (!group.includes(other)) other.setAttribute('aria-expanded', 'false');
    });
  }
  group.forEach((el) => el.setAttribute('aria-expanded', expanded ? 'true' : 'false'));
}

/* ---------------- dropdown builders (data-driven) ---------------- */

/**
 * Classifies a trigger's nested lists:
 * - featured: a label list followed by a detail list (image / title / description / CTA)
 *   -> sidebar + featured detail that swaps on hover
 * - tiles: one list whose items carry an image + link -> image tile row
 * - list: plain links
 */
function getDropdownType(subLists) {
  if (subLists.length > 1) return 'featured';
  const items = getDirectChildren(subLists[0], 'LI');
  if (items.length && items.every((li) => li.querySelector('img'))) return 'tiles';
  return 'list';
}

function activateDetail(dropdown, index) {
  dropdown.querySelectorAll('.nav-dropdown-title').forEach((title, i) => {
    title.classList.toggle('active', i === index);
  });
  dropdown.querySelectorAll('.nav-detail').forEach((detail, i) => {
    detail.classList.toggle('active', i === index);
  });
}

/**
 * Pairs each label link with its detail item: first by a detail link pointing to
 * the same URL, otherwise by position.
 */
function pairLabelsWithDetails(labelList, detailList) {
  const labels = getDirectChildren(labelList, 'LI').map((li) => li.querySelector('a')).filter(Boolean);
  const details = getDirectChildren(detailList, 'LI');
  const unused = new Set(details);
  const pairs = labels.map((link) => {
    const href = link.getAttribute('href');
    const match = details.find((d) => unused.has(d)
      && [...d.querySelectorAll('a')].some((a) => a.getAttribute('href') === href));
    if (match) unused.delete(match);
    return { link, detail: match || null };
  });
  pairs.filter((pair) => !pair.detail).forEach((pair) => {
    const [next] = unused;
    if (next) {
      pair.detail = next;
      unused.delete(next);
    }
  });
  return pairs;
}

function buildDetail(source, labelLink) {
  const detail = createEl('div', 'nav-detail');
  if (!source) return detail;
  const img = source.querySelector('img');
  const strong = source.querySelector('strong');
  const links = [...source.querySelectorAll('a')];
  const ctaLink = links.length ? links[links.length - 1] : null;
  const descriptions = [...source.querySelectorAll('p')]
    .filter((p) => !p.querySelector('a, img, strong') && p.textContent.trim());

  const nodes = [];
  if (img) {
    img.loading = 'lazy';
    const imageWrap = createEl('div', 'nav-detail-image');
    imageWrap.append(img);
    nodes.push(imageWrap);
  }
  const heading = createEl('h2', 'nav-detail-title');
  heading.textContent = (strong || labelLink).textContent.trim();
  nodes.push(heading);
  descriptions.forEach((p) => {
    p.className = 'nav-detail-desc';
    nodes.push(p);
  });
  if (ctaLink) {
    const ctaWrap = createEl('p', 'nav-detail-cta');
    ctaLink.className = 'nav-detail-button';
    ctaWrap.append(ctaLink);
    nodes.push(ctaWrap);
  }
  return appendSpaced(detail, nodes);
}

function buildFeaturedDropdown([labelList, detailList]) {
  const dropdown = createEl('div', 'nav-dropdown nav-dropdown-featured');
  const titles = createEl('div', 'nav-dropdown-titles', { role: 'list' });
  const details = createEl('div', 'nav-dropdown-titledata');
  const titleItems = [];
  const detailItems = [];

  pairLabelsWithDetails(labelList, detailList).forEach(({ link, detail }, index) => {
    const titleItem = createEl('div', 'nav-dropdown-title', { role: 'listitem' });
    titleItem.append(link);
    titleItems.push(titleItem);
    detailItems.push(buildDetail(detail, link));

    const activate = () => activateDetail(dropdown, index);
    titleItem.addEventListener('mouseenter', activate);
    titleItem.addEventListener('focusin', activate);
  });

  appendSpaced(titles, titleItems);
  appendSpaced(details, detailItems);
  dropdown.append(titles, details);
  activateDetail(dropdown, 0);
  return dropdown;
}

function buildTileDropdown([subList]) {
  const dropdown = createEl('ul', 'nav-dropdown nav-dropdown-tiles');
  const tiles = getDirectChildren(subList, 'LI').map((li) => {
    const link = li.querySelector('a');
    const img = li.querySelector('img');
    if (!link) return null;
    const tile = createEl('li', 'nav-tile');
    const anchor = createEl('a', 'nav-tile-link', { href: link.getAttribute('href') });
    if (img) {
      img.loading = 'lazy';
      const imageWrap = createEl('div', 'nav-tile-image');
      imageWrap.append(img);
      anchor.append(imageWrap);
    }
    const label = createEl('span', 'nav-tile-label');
    label.textContent = link.textContent.trim();
    anchor.append(label);
    tile.append(anchor);
    return tile;
  });
  return appendSpaced(dropdown, tiles);
}

function buildListDropdown([subList]) {
  subList.className = 'nav-dropdown nav-dropdown-links';
  subList.querySelectorAll('p').forEach(unwrapParagraph);
  return subList;
}

const DROPDOWN_BUILDERS = {
  featured: buildFeaturedDropdown,
  tiles: buildTileDropdown,
  list: buildListDropdown,
};

/* ---------------- sections ---------------- */

function decorateNavSections(section, nav) {
  const wrapper = createEl('div', 'nav-sections');
  const rootList = section.querySelector('ul');
  if (!rootList) return wrapper;
  rootList.classList.add('nav-list', 'nav-dropdowns');

  getDirectChildren(rootList, 'LI').forEach((li) => {
    li.classList.add('nav-item');
    const subLists = [...li.querySelectorAll(':scope > ul')];
    const trigger = li.querySelector(':scope > p > a, :scope > a');
    if (!trigger) return;
    // normalise: <li><a class="nav-trigger"> + panel
    li.prepend(trigger);
    li.querySelectorAll(':scope > p').forEach((p) => { if (!p.textContent.trim()) p.remove(); });
    trigger.classList.add('nav-trigger');
    if (!subLists.length) return;

    const type = getDropdownType(subLists);
    const panelId = uniqueId('nav-mega');
    const mega = createEl('div', `nav-mega nav-mega-${type}`, { id: panelId });
    mega.append(DROPDOWN_BUILDERS[type](subLists));
    subLists.forEach((list) => { if (!mega.contains(list)) list.remove(); });
    li.classList.add('nav-drop');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.dataset.navToggle = 'hover';

    // mobile split link: the label navigates, the chevron expands the accordion
    const expander = createEl('button', 'nav-expand', {
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': panelId,
      'aria-label': trigger.textContent.trim(),
    });
    expander.dataset.navToggle = 'expand';
    expander.addEventListener('click', () => {
      setExpanded(nav, expander, expander.getAttribute('aria-expanded') !== 'true');
    });
    trigger.after(expander, mega);

    li.addEventListener('mouseenter', () => {
      if (isDesktop.matches) setExpanded(nav, trigger, true);
    });
    li.addEventListener('mouseleave', () => {
      if (isDesktop.matches) setExpanded(nav, trigger, false);
    });
    li.addEventListener('focusin', () => {
      if (isDesktop.matches) setExpanded(nav, trigger, true);
    });
    li.addEventListener('focusout', (e) => {
      if (isDesktop.matches && !li.contains(e.relatedTarget)) setExpanded(nav, trigger, false);
    });
  });

  wrapper.append(rootList);
  return wrapper;
}

/** Brand-family flyout: a linked image toggles a panel of linked logos. */
function decorateFamily(section, nav) {
  const wrapper = createEl('div', 'nav-family');
  const toggleImg = section.querySelector('p img');
  const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
  const list = section.querySelector('ul');
  if (!toggleImg) return wrapper;

  const panelId = uniqueId('nav-family-dropdown');
  const toggle = createEl('button', 'nav-family-toggle', {
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': panelId,
    'aria-label': toggleImg.alt || 'Brands',
  });
  toggle.dataset.navToggle = 'click';
  toggle.append(toggleImg);
  wrapper.append(toggle);

  if (list) {
    const dropdown = createEl('div', 'nav-family-dropdown', { id: panelId });
    const content = createEl('div', 'nav-family-content');
    if (heading) {
      heading.className = 'nav-family-title';
      content.append(heading);
    }
    list.className = 'nav-family-grid';
    list.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; });
    content.append(list);
    dropdown.append(content);
    wrapper.append(dropdown);
    toggle.addEventListener('click', () => {
      setExpanded(nav, toggle, toggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  return wrapper;
}

function decorateUtility(section) {
  const list = section.querySelector('ul') || createEl('ul');
  list.className = 'nav-utility-links';
  list.querySelectorAll('p').forEach(unwrapParagraph);
  return list;
}

function decorateBrand(section) {
  const wrapper = createEl('div', 'nav-brand');
  const link = section.querySelector('a');
  if (link) wrapper.append(link);
  else wrapper.append(...section.childNodes);
  return wrapper;
}

/** Tools: a "search" link becomes a toggle + GET form targeting the link URL. */
function decorateTools(section, nav) {
  const wrapper = createEl('div', 'nav-tools');
  const searchLink = section.querySelector('a');
  if (!searchLink) return wrapper;

  const label = searchLink.textContent.trim() || 'Search';
  const boxId = uniqueId('nav-search-box');
  const inputId = uniqueId('nav-search-input');
  const search = createEl('div', 'nav-search');

  const box = createEl('div', 'nav-search-box', { id: boxId });
  const form = createEl('form', '', {
    action: searchLink.getAttribute('href'), method: 'get', role: 'search',
  });
  const formLabel = createEl('label', 'nav-search-label', { for: inputId });
  formLabel.textContent = label;
  const input = createEl('input', 'nav-search-input', {
    id: inputId, type: 'search', name: 'q', placeholder: label, autocomplete: 'off',
  });
  form.append(formLabel, input);
  box.append(form);

  const button = createEl('button', 'nav-search-button', {
    type: 'button', 'aria-label': label, 'aria-expanded': 'false', 'aria-controls': boxId,
  });
  button.dataset.navToggle = 'click';
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    setExpanded(nav, button, open);
    if (open) input.focus();
  });

  search.append(box, button);
  wrapper.append(search);
  return wrapper;
}

/* ---------------- mobile menu ---------------- */

/**
 * On mobile the utility links are listed as regular menu items (after the
 * primary items); they are copied from the utility section and hidden on desktop.
 */
function addMobileUtilityItems(nav) {
  const rootList = nav.querySelector('.nav-sections > .nav-list');
  const links = nav.querySelectorAll('.nav-utility-links a');
  if (!rootList) return;
  links.forEach((link) => {
    const li = createEl('li', 'nav-item nav-item-utility');
    const copy = link.cloneNode(true);
    copy.className = 'nav-trigger';
    li.append(copy);
    rootList.append(li);
  });
}

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (expanded) closeAllPanels(nav);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNavFragment();
  if (!fragment) return;

  const sections = {};
  [...fragment.children].filter((el) => el.tagName === 'DIV').forEach((section, i) => {
    if (SECTION_ROLES[i]) sections[SECTION_ROLES[i]] = section;
  });

  const nav = createEl('nav', '', { id: 'nav', 'aria-expanded': 'false', 'aria-label': 'Main navigation' });

  // row 0: utility bar
  const utility = createEl('div', 'nav-utility');
  const utilityInner = createEl('div', 'nav-utility-inner');
  if (sections.family) utilityInner.append(decorateFamily(sections.family, nav));
  if (sections.utility) utilityInner.append(decorateUtility(sections.utility));
  utility.append(utilityInner);

  // row 1: main bar
  const main = createEl('div', 'nav-main');
  const mainInner = createEl('div', 'nav-main-inner');
  if (sections.brand) mainInner.append(decorateBrand(sections.brand));
  if (sections.sections) mainInner.append(decorateNavSections(sections.sections, nav));
  if (sections.tools) mainInner.append(decorateTools(sections.tools, nav));

  main.append(mainInner);

  // hamburger first in DOM order (it sits above the open mobile menu)
  const hamburger = createEl('div', 'nav-hamburger');
  const hamburgerButton = createEl('button', '', {
    type: 'button', 'aria-controls': 'nav', 'aria-label': 'Open navigation',
  });
  ['top', 'middle', 'bottom'].forEach((pos) => {
    hamburgerButton.append(createEl('span', `nav-hamburger-bar nav-hamburger-bar-${pos}`));
  });
  hamburgerButton.addEventListener('click', () => toggleMenu(nav));
  hamburger.append(hamburgerButton);

  nav.append(hamburger, utility, main);
  addMobileUtilityItems(nav);
  decorateLinks(nav);

  // close click-toggled panels on outside click / Escape
  document.addEventListener('click', (e) => {
    nav.querySelectorAll('[aria-expanded="true"][data-nav-toggle="click"]').forEach((toggle) => {
      const owner = toggle.parentElement;
      if (!owner.contains(e.target)) toggle.setAttribute('aria-expanded', 'false');
    });
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('[aria-expanded="true"][data-nav-toggle]');
    if (open) {
      closeAllPanels(nav);
      open.focus();
    } else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburgerButton.focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    closeAllPanels(nav);
    toggleMenu(nav, false);
  });

  const navWrapper = createEl('div', 'nav-wrapper');
  navWrapper.append(nav);
  block.textContent = '';
  block.append(navWrapper);
}
