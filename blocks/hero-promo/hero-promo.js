/**
 * hero-promo: background photo with an overlapping promo card (logo, heading,
 * paragraphs, CTA) and an optional badge image.
 *
 * Rows (all optional, order-tolerant):
 *   1. Background image (a cell holding only a picture)
 *   2. Card: optional logo picture, heading, paragraphs, CTA link,
 *      optional badge picture (any picture after the heading)
 *   3. Optional: badge image as its own picture-only cell
 */
function hasText(el) {
  return [...el.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol')]
    .some((node) => node.textContent.trim() !== '');
}

function detachPicture(pic, cell) {
  const wrapper = pic.parentElement;
  pic.remove();
  if (wrapper && wrapper !== cell && wrapper.tagName === 'P' && !wrapper.textContent.trim()
    && !wrapper.children.length) {
    wrapper.remove();
  }
  return pic;
}

/** marks paragraphs that hold nothing but a single link as the CTA */
function markCta(card) {
  card.querySelectorAll('p').forEach((p) => {
    const links = p.querySelectorAll('a');
    if (links.length !== 1) return;
    if (p.textContent.trim() !== links[0].textContent.trim()) return;
    p.classList.add('hero-promo-cta');
  });
}

export default function decorate(block) {
  const background = document.createElement('div');
  background.className = 'hero-promo-background';
  const card = document.createElement('div');
  card.className = 'hero-promo-card';
  const badge = document.createElement('div');
  badge.className = 'hero-promo-badge';

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const pictures = [...cell.querySelectorAll('picture')];
      if (pictures.length && !hasText(cell)) {
        pictures.forEach((pic) => {
          if (!background.children.length) background.append(pic);
          else badge.append(pic);
        });
        return;
      }

      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      pictures.forEach((pic) => {
        // pictures that follow the heading are the badge; earlier ones (logo) stay in the card
        const afterHeading = heading
          // eslint-disable-next-line no-bitwise
          && (heading.compareDocumentPosition(pic) & Node.DOCUMENT_POSITION_FOLLOWING);
        if (afterHeading) {
          badge.append(detachPicture(pic, cell));
        } else {
          const holder = pic.closest('p') || pic;
          holder.classList.add('hero-promo-logo');
        }
      });
      while (cell.firstChild) card.append(cell.firstChild);
    });
  });

  markCta(card);

  const inner = document.createElement('div');
  inner.className = 'hero-promo-inner';
  inner.append(card);
  if (badge.children.length) inner.append(badge);

  block.replaceChildren();
  if (background.children.length) block.append(background);
  else block.classList.add('no-image');
  block.append(inner);
}
