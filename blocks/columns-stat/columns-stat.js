/**
 * columns-stat: short statement text beside a stat graphic (image), optionally
 * linked to a supporting document.
 *
 * When the text cell carries its own heading (product-page "Did You Know?"
 * band) the block is flagged with `columns-stat-has-heading` so it can use the
 * source's heading + body-copy treatment instead of the large statement text.
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
      if (!isImage && col.querySelector('h1, h2, h3, h4, h5, h6')) {
        block.classList.add(`${BLOCK}-has-heading`);
      }
    });
  });
}
