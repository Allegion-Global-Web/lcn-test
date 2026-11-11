/**
 * columns-video: text column beside a video poster image that links to a
 * video (YouTube/Vimeo). Clicking the poster swaps in an embedded player;
 * other links fall back to normal navigation.
 */
const BLOCK = 'columns-video';

function getEmbedUrl(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch (e) {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  let id;
  if (host === 'youtu.be') id = url.pathname.slice(1);
  else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
    if (id === 'watch') id = null;
  }
  if (id) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
  if (host.endsWith('vimeo.com')) {
    const vid = url.pathname.split('/').filter(Boolean).pop();
    if (vid && /^\d+$/.test(vid)) return `https://player.vimeo.com/video/${vid}?autoplay=1`;
  }
  return null;
}

function setupMedia(col) {
  col.classList.add(`${BLOCK}-media`);
  const picture = col.querySelector('picture');
  const link = picture.closest('a') || [...col.querySelectorAll('a')].find((a) => getEmbedUrl(a.href));
  const embed = link && getEmbedUrl(link.href);
  if (!embed) return;

  const poster = document.createElement('div');
  poster.className = `${BLOCK}-poster`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${BLOCK}-play`;
  const label = link.textContent.trim() || picture.querySelector('img')?.alt || 'Play video';
  button.setAttribute('aria-label', label);
  poster.append(picture, button);

  poster.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = embed;
    iframe.title = label;
    iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    const frame = document.createElement('div');
    frame.className = `${BLOCK}-frame`;
    frame.append(iframe);
    poster.replaceWith(frame);
  }, { once: true });

  // remove the original link (now represented by the poster) and any empty wrapper
  const wrapper = link.parentElement;
  link.remove();
  if (wrapper && wrapper !== col && !wrapper.textContent.trim() && !wrapper.children.length) {
    wrapper.remove();
  }
  col.prepend(poster);
}

/**
 * Tags text-cell paragraphs: a paragraph holding only a link becomes the CTA,
 * a paragraph holding only an image becomes the floating product image.
 */
function setupText(col) {
  col.classList.add(`${BLOCK}-text`);
  [...col.querySelectorAll(':scope > p')].forEach((p) => {
    const text = p.textContent.trim();
    const { children } = p;
    if (children.length !== 1) return;
    const [child] = children;
    if (child.tagName === 'A' && !child.querySelector('picture, img') && text && child.textContent.trim() === text) {
      p.classList.add(`${BLOCK}-cta`);
    } else if ((child.tagName === 'PICTURE' || child.tagName === 'IMG') && !text) {
      p.classList.add(`${BLOCK}-product`);
    }
  });
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (!firstRow) return;
  block.classList.add(`${BLOCK}-${firstRow.children.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.querySelector('picture') && !col.querySelector('h1, h2, h3, h4, h5, h6')) setupMedia(col);
      else setupText(col);
    });
  });

  // no video link anywhere: a plain image beside text (styled as its own look)
  if (!block.querySelector(`.${BLOCK}-poster`)) block.classList.add(`${BLOCK}-static`);
  // image cell authored first: image left, text right
  if (firstRow.firstElementChild?.classList.contains(`${BLOCK}-media`)) {
    block.classList.add(`${BLOCK}-media-first`);
  }
}
