/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-product.
 * Source: .xtra-xtra-parsys .accordian-tab — Bootstrap panel-group; each
 * .panel = .panel-heading (.panel-title > a) + .panel-collapse > .panel-body
 * (collapsed in markup, content present). Body holds .customrte rich text
 * (bold sub-heads, lists, paragraphs, PDF/YouTube links) and may hold other
 * components (images, button links).
 * One row per panel: [ title (plain text) | body content ].
 */
const WRAPPERS = new Set(['DIV', 'SECTION', 'ARTICLE', 'SPAN']);
const DROP = 'script, style, link, noscript, meta, button';

function isEmpty(el) {
  return !el.textContent.replace(/[\s ]+/g, '') && !el.querySelector('img, picture, video, iframe, hr');
}

/* Flatten component wrappers (div.customrte > div.clearfix > ...) into a list of content nodes. */
function collectContent(container, out) {
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === 3) {
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        const p = container.ownerDocument.createElement('p');
        p.textContent = text;
        out.push(p);
      }
      return;
    }
    if (node.nodeType !== 1 || node.matches(DROP)) return;
    if (WRAPPERS.has(node.tagName) && node.children.length) {
      collectContent(node, out);
      return;
    }
    if (isEmpty(node)) return; // <p>&nbsp;</p> spacers, empty divs
    out.push(node);
  });
}

function getBody(panel, heading, root) {
  let body = panel && panel.querySelector('.panel-body, .panel-collapse');
  if (body) return body;
  // panels without a .panel wrapper: resolve the heading's #target, else next sibling
  const href = heading && heading.querySelector('a[href^="#"]')?.getAttribute('href');
  if (href && href.length > 1) {
    try {
      body = root.querySelector(href);
    } catch (e) { /* invalid id selector */ }
  }
  if (!body && heading) body = heading.nextElementSibling;
  return body ? body.querySelector('.panel-body') || body : null;
}

export default function parse(element, { document }) {
  const cells = [];

  let panels = [...element.querySelectorAll('.panel')].filter((p) => p.querySelector('.panel-heading, .panel-title'));
  const items = panels.length
    ? panels.map((panel) => ({ panel, heading: panel.querySelector('.panel-heading, .panel-title') }))
    : [...element.querySelectorAll('.panel-heading')].map((heading) => ({ panel: null, heading }));

  items.forEach(({ panel, heading }) => {
    const titleEl = (heading && heading.querySelector('.panel-title')) || heading;
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

    const body = getBody(panel, heading, element);
    const content = [];
    if (body) {
      body.querySelectorAll(DROP).forEach((el) => el.remove());
      // empty anchors (e.g. stray <a href="x.pdf"></a> before a real link) carry no content
      body.querySelectorAll('a').forEach((a) => {
        if (isEmpty(a)) a.remove();
      });
      // trailing <br> inside list items
      body.querySelectorAll('li > br:last-child').forEach((br) => br.remove());
      collectContent(body, content);
    }

    if (!title && !content.length) return;
    cells.push([title, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-product', cells });
  element.replaceWith(block);
}
