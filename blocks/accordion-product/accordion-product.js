/**
 * accordion-product: product details accordion. Each row is one item:
 * a title cell and a content cell (paragraphs, bold sub-heads, lists,
 * document/video links). Built on native <details>/<summary> so it is
 * keyboard and screen-reader accessible; all items start collapsed. Like
 * the source, only one item is open at a time (native exclusive `name`
 * group, with a toggle-event fallback for browsers without it). A URL hash
 * pointing inside an item opens that item.
 *
 * Opening and closing animate the item content height like the source
 * (Bootstrap 3 collapse: height 0.35s ease). Summary activation (click,
 * Enter, Space) is intercepted so a closing item keeps [open] until its
 * collapse animation ends; the sibling being closed by the single-open rule
 * animates at the same time. With prefers-reduced-motion: reduce, or without
 * the Web Animations API, the native instant toggle is left untouched.
 */
const BLOCK = 'accordion-product';
const DURATION = 350;
const EASING = 'ease';
const ITEM = `:scope > details.${BLOCK}-item`;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const running = new WeakMap();

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function partsOf(details) {
  const content = details.querySelector(`:scope > .${BLOCK}-item-content`);
  const body = content && content.querySelector(`:scope > .${BLOCK}-item-body`);
  return { content, body };
}

/** stops any height animation on the item, leaving its natural height */
function stopAnimation(details) {
  const anim = running.get(details);
  if (anim) {
    running.delete(details);
    anim.cancel();
  }
  details.classList.remove('is-animating');
}

function animateHeight(details, from, to, onDone) {
  const { content } = partsOf(details);
  stopAnimation(details);
  details.classList.add('is-animating');
  const anim = content.animate(
    { height: [`${from}px`, `${to}px`] },
    { duration: DURATION, easing: EASING, fill: 'forwards' },
  );
  running.set(details, anim);
  anim.onfinish = () => {
    if (running.get(details) !== anim) return;
    if (onDone) onDone();
    stopAnimation(details);
  };
}

function canAnimate(details) {
  const { content, body } = partsOf(details);
  return !reducedMotion.matches && !!content && !!body && typeof content.animate === 'function';
}

function closeItem(details, group, animate) {
  if (!details.open) return;
  const finish = () => {
    details.open = false;
    details.classList.remove('is-closing');
    details.setAttribute('name', group);
  };
  if (!animate || !canAnimate(details)) {
    stopAnimation(details);
    finish();
    return;
  }
  const from = partsOf(details).content.getBoundingClientRect().height;
  // leave the exclusive group while collapsing so opening another item
  // does not close this one instantly
  details.removeAttribute('name');
  details.classList.add('is-closing');
  animateHeight(details, from, 0, finish);
}

function openItem(details, group, animate) {
  const block = details.parentElement;
  block.querySelectorAll(`${ITEM}[open]`).forEach((other) => {
    if (other !== details && !other.classList.contains('is-closing')) {
      closeItem(other, group, animate);
    }
  });

  const doAnimate = animate && canAnimate(details);
  const { content, body } = partsOf(details);
  // reversing a running collapse starts from the current height
  const from = details.open && content ? content.getBoundingClientRect().height : 0;
  details.classList.remove('is-closing');
  details.setAttribute('name', group);
  details.open = true;
  if (!doAnimate) {
    stopAnimation(details);
    return;
  }
  animateHeight(details, from, body.getBoundingClientRect().height);
}

function openForHash(block, group) {
  const { hash } = window.location;
  if (!hash || hash.length < 2) return;
  let target;
  try {
    target = block.querySelector(`#${CSS.escape(decodeURIComponent(hash.slice(1)))}`);
  } catch (e) {
    return;
  }
  const details = target && target.closest('details');
  if (details && details.parentElement === block) openItem(details, group, false);
}

let accordionId = 0;
export default function decorate(block) {
  accordionId += 1;
  const group = `${BLOCK}-${accordionId}`;
  const usedIds = new Set();
  let previousBody = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const [titleCell, ...bodyCells] = cells;

    // a single-cell row continues the previous item's content
    if (!bodyCells.length && previousBody && titleCell) {
      previousBody.append(...titleCell.childNodes);
      row.remove();
      return;
    }

    const title = titleCell ? titleCell.textContent.trim() : '';
    if (!title && !bodyCells.some((cell) => cell.textContent.trim() || cell.children.length)) {
      row.remove();
      return;
    }

    const summary = document.createElement('summary');
    summary.className = `${BLOCK}-item-label`;
    const label = document.createElement('span');
    label.className = `${BLOCK}-item-title`;
    label.textContent = title;
    summary.append(label);

    const body = document.createElement('div');
    body.className = `${BLOCK}-item-body`;
    bodyCells.forEach((cell) => body.append(...cell.childNodes));
    // links inside the body are plain links, not CTA buttons
    body.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
    body.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));

    // height-animated wrapper; the body keeps its padding and background
    const content = document.createElement('div');
    content.className = `${BLOCK}-item-content`;
    content.append(body);

    const details = document.createElement('details');
    details.className = `${BLOCK}-item`;
    details.setAttribute('name', group);
    let id = `${BLOCK}-${accordionId}-${slugify(title) || 'item'}`;
    while (usedIds.has(id)) id += '-x';
    usedIds.add(id);
    details.id = id;
    details.append(summary, content);

    row.replaceWith(details);
    previousBody = body;
  });

  // animated toggle; click also covers Enter / Space on the summary
  block.addEventListener('click', (e) => {
    const summary = e.target.closest('summary');
    const details = summary && summary.parentElement;
    if (!details || details.parentElement !== block || !details.matches(`details.${BLOCK}-item`)) return;
    if (summary !== details.querySelector(':scope > summary') || !canAnimate(details)) return;
    e.preventDefault();
    if (details.open && !details.classList.contains('is-closing')) {
      closeItem(details, group, true);
    } else {
      openItem(details, group, true);
    }
  });

  // single-open fallback for native toggles (no `name` support, find-in-page,
  // reduced motion); items already collapsing are left to finish
  block.addEventListener('toggle', (e) => {
    const opened = e.target;
    if (!opened.matches || !opened.matches(`details.${BLOCK}-item`) || !opened.open) return;
    if (opened.classList.contains('is-closing')) return;
    block.querySelectorAll(`${ITEM}[open]`).forEach((other) => {
      if (other !== opened && !other.classList.contains('is-closing')) {
        closeItem(other, group, false);
      }
    });
  }, true);

  openForHash(block, group);
  window.addEventListener('hashchange', () => openForHash(block, group));
}
