/**
 * columns-cta-banner: contained call-to-action banner. A text column
 * (heading, copy, CTA link) beside an icon/image column. Column order is
 * kept as authored; the picture-only column is treated as the icon.
 */
const BLOCK = 'columns-cta-banner';

function isImageColumn(col) {
  return !!col.querySelector('picture') && !col.textContent.trim();
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  block.classList.add(`${BLOCK}-${firstRow.children.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add(`${BLOCK}-row`);
    [...row.children].forEach((col) => {
      if (!col.children.length && !col.textContent.trim()) {
        col.remove();
        return;
      }
      if (isImageColumn(col)) {
        col.classList.add(`${BLOCK}-icon`);
        return;
      }
      col.classList.add(`${BLOCK}-text`);
      // a paragraph holding only one link is the CTA, even if not bold/italic
      col.querySelectorAll(':scope > p').forEach((p) => {
        const links = p.querySelectorAll('a');
        if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()) {
          p.classList.add(`${BLOCK}-cta`);
          links[0].classList.add('button');
        }
      });
    });
  });
}
