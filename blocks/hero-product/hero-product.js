/**
 * hero-product: full-width photo background with headline, copy, CTA and an
 * optional product cutout image that overlaps the bottom edge.
 *
 * Rows (all optional, order-tolerant):
 *   1. Background image (a cell holding only a picture)
 *   2. Content: heading, paragraphs, CTA link, optional product picture
 */
export default function decorate(block) {
  const rows = [...block.children];
  const background = document.createElement('div');
  background.className = 'hero-product-background';
  const content = document.createElement('div');
  content.className = 'hero-product-content';
  const media = document.createElement('div');
  media.className = 'hero-product-media';

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      const pictures = cell.querySelectorAll('picture');
      const hasText = [...cell.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
        .some((el) => el.textContent.trim() !== '');
      const onlyPicture = pictures.length > 0 && !hasText;

      if (onlyPicture && !background.querySelector('picture')) {
        background.append(pictures[0]);
        // any extra picture in the background cell is the product image
        [...pictures].slice(1).forEach((pic) => media.append(pic));
        return;
      }
      if (onlyPicture) {
        pictures.forEach((pic) => media.append(pic));
        return;
      }

      // content cell: pull pictures out into the media slot
      pictures.forEach((pic) => {
        const wrapper = pic.parentElement;
        media.append(pic);
        if (wrapper && wrapper !== cell && wrapper.tagName === 'P' && !wrapper.textContent.trim()) {
          wrapper.remove();
        }
      });
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  // headline: the line after the last <br> is the accent line ("TAKING / CONTROL")
  const heading = content.querySelector('h1, h2');
  const lastBreak = heading ? [...heading.querySelectorAll('br')].pop() : null;
  const range = lastBreak ? document.createRange() : null;
  if (range) {
    range.setStartAfter(lastBreak);
    range.setEndAfter(heading.lastChild);
  }
  if (range && range.toString().trim()) {
    const accent = document.createElement('span');
    accent.className = 'hero-product-accent';
    accent.append(range.extractContents());
    lastBreak.after(accent);
  }

  // CTA: a paragraph holding nothing but one link
  [...content.querySelectorAll('p')].forEach((p) => {
    const links = p.querySelectorAll('a');
    if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
      p.classList.add('hero-product-cta-wrapper');
      links[0].classList.add('hero-product-cta');
    }
  });

  const inner = document.createElement('div');
  inner.className = 'hero-product-inner';
  inner.append(content);
  if (media.children.length) inner.append(media);

  block.replaceChildren();
  if (background.children.length) block.append(background);
  else block.classList.add('no-image');
  block.append(inner);
}
