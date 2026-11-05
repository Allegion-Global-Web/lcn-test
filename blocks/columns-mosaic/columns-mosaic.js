/**
 * columns-mosaic: a fixed grid of mixed tiles (photos, a video link tile and
 * text tiles). Each row of the block table stays a grid row (row hover drives
 * the tile effects); when a row has fewer cells than the widest row, its last
 * cell spans the remaining columns.
 */
const BLOCK = 'columns-mosaic';
const VIDEO_HOST = /(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/i;

function isVideoLink(a) {
  try {
    return VIDEO_HOST.test(new URL(a.href, window.location.href).hostname);
  } catch (e) {
    return false;
  }
}

function classifyTile(cell) {
  const hasPicture = !!cell.querySelector('picture');
  const hasText = !!cell.textContent.trim();
  const links = [...cell.querySelectorAll('a')];
  if (links.some(isVideoLink)) return 'video';
  if (hasPicture && !hasText) return 'image';
  return 'text';
}

export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.children.length);
  [...block.children].forEach((row) => {
    if (!row.children.length) row.remove();
  });
  if (!rows.length) return;
  const maxCols = Math.max(...rows.map((row) => row.children.length));
  block.style.setProperty('--mosaic-cols', maxCols);

  rows.forEach((row) => {
    row.classList.add(`${BLOCK}-row`);
    const cells = [...row.children];
    cells.forEach((cell, idx) => {
      const type = classifyTile(cell);
      cell.classList.add(`${BLOCK}-tile`, `${BLOCK}-tile-${type}`);
      if (idx === cells.length - 1 && cells.length < maxCols) {
        const span = maxCols - cells.length + 1;
        cell.style.setProperty('--tile-span', span);
        cell.classList.add(`${BLOCK}-tile-wide`);
      }
      if (type === 'video' || type === 'text') {
        // a tile with exactly one link is clickable as a whole
        const links = cell.querySelectorAll('a');
        if (links.length === 1) {
          links[0].classList.add(`${BLOCK}-tile-link`);
          if (isVideoLink(links[0])) {
            links[0].target = '_blank';
            links[0].rel = 'noopener noreferrer';
          }
        }
      }
    });
  });
}
