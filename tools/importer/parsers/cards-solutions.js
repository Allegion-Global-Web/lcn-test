/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-solutions.
 * Source: .columnselector inside the solutions background-image band; three .imageText cards.
 * One row per card: [ card image | two-line heading, description, CTA link ].
 */
export default function parse(element, { document }) {
  const cells = [];
  const cards = element.querySelectorAll('.imageText');

  cards.forEach((card) => {
    const img = card.querySelector('img');
    const imageCell = img ? [img] : [''];

    const content = [];
    const h = card.querySelector('h1, h2, h3, h4');
    if (h) {
      // Rebuild the two-line heading ("Solutions by" <br> "Market") from its spans
      const lines = [...h.querySelectorAll('span')]
        .map((s) => s.textContent.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      const heading = document.createElement(h.tagName.toLowerCase());
      if (lines.length > 1) {
        lines.forEach((line, i) => {
          if (i > 0) heading.append(document.createElement('br'));
          heading.append(document.createTextNode(line));
        });
      } else {
        heading.textContent = h.textContent.replace(/\s+/g, ' ').trim();
      }
      content.push(heading);
    }

    card.querySelectorAll('.text p').forEach((p) => {
      const text = p.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        const para = document.createElement('p');
        para.textContent = text;
        content.push(para);
      }
    });

    const cta = card.querySelector('a.cta-button[href], .text a[href]');
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    }

    cells.push([imageCell, content.length ? content : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-solutions', cells });
  element.replaceWith(block);
}
