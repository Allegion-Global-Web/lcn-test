/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-featured.
 * Source: Bootstrap carousel ([id^="carousel-"]) with div.carousel-inner > div.item slides.
 * One row per slide: [ image | eyebrow p, title heading, description p, CTA link ].
 * The source wraps eyebrow + title together in h1.caption-heading (as <p>s):
 * the eyebrow is emitted as a paragraph and only the title becomes a heading.
 */
export default function parse(element, { document }) {
  const cells = [];
  const slides = element.querySelectorAll('.carousel-inner > .item');

  slides.forEach((slide) => {
    const img = slide.querySelector(':scope > picture img, :scope > img, picture img');
    const imageCell = img ? [img] : [''];

    const content = [];
    const headingEl = slide.querySelector('.caption-heading');
    if (headingEl) {
      const parts = [...headingEl.querySelectorAll(':scope > p')].filter((p) => p.textContent.trim());
      if (parts.length === 0) {
        const h = document.createElement('h2');
        h.textContent = headingEl.textContent.trim();
        if (h.textContent) content.push(h);
      } else {
        // Title = first bold part (eyebrow is the non-bold line before it); fallback: last part
        let titleIdx = parts.findIndex((p) => p.querySelector('b, strong'));
        if (titleIdx === -1) titleIdx = parts.length - 1;
        parts.forEach((p, i) => {
          const text = p.textContent.replace(/\s+/g, ' ').trim();
          if (i === titleIdx) {
            const h = document.createElement('h2');
            h.textContent = text;
            content.push(h);
          } else {
            const para = document.createElement('p');
            para.textContent = text;
            content.push(para);
          }
        });
      }
    }

    slide.querySelectorAll('.carousel-text p').forEach((p) => {
      if (p.textContent.trim()) content.push(p);
    });

    const ctaSrc = slide.querySelector('a.caption-button[href], .carousel-caption a[href]');
    if (ctaSrc) {
      const a = document.createElement('a');
      a.href = ctaSrc.getAttribute('href');
      a.textContent = ctaSrc.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.append(a);
      content.push(p);
    }

    cells.push([imageCell, content.length ? content : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-featured', cells });
  element.replaceWith(block);
}
