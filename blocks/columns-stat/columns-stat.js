/**
 * columns-stat: short statement text beside a stat graphic (image), optionally
 * linked to a supporting document.
 */
const BLOCK = 'columns-stat';

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  block.classList.add(`${BLOCK}-${firstRow.children.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const isImage = col.querySelector('picture') && !col.textContent.trim();
      col.classList.add(isImage ? `${BLOCK}-graphic` : `${BLOCK}-text`);
    });
  });
}
