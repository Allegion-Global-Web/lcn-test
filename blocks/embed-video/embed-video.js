/**
 * embed-video: full-width responsive video embed.
 * Authoring: one row, optional poster image plus a link to the video
 * (YouTube watch / shorts / embed / youtu.be, or Vimeo). With a poster the
 * player loads on click; without one it loads lazily when scrolled into view.
 * Links that are not a recognised video stay as a plain link.
 */
const BLOCK = 'embed-video';
const ALLOW = 'autoplay; encrypted-media; picture-in-picture; fullscreen';

/** Converts a YouTube "t"/"start" value (90, 90s, 1m30s, 1h2m3s) to seconds. */
function toSeconds(value) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return 0;
  const [, h = 0, m = 0, s = 0] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

function youtubeId(url, host) {
  if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0];
  if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;
  const v = url.searchParams.get('v');
  if (v) return v;
  const [type, id] = url.pathname.split('/').filter(Boolean);
  return ['shorts', 'embed', 'live', 'v'].includes(type) ? id : null;
}

/**
 * Returns { provider, src(autoplay) } for a supported video URL, else null.
 * @param {string} href
 */
function getVideoEmbed(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch (e) {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, '');

  const ytId = youtubeId(url, host);
  if (ytId && /^[\w-]{6,20}$/.test(ytId)) {
    const start = toSeconds(url.searchParams.get('t') || url.searchParams.get('start'));
    return {
      provider: 'youtube',
      id: ytId,
      src: (autoplay) => {
        const params = new URLSearchParams({ rel: '0' });
        if (start) params.set('start', start);
        if (autoplay) params.set('autoplay', '1');
        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?${params}`;
      },
    };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => /^\d+$/.test(p));
    if (idx === -1) return null;
    const id = parts[idx];
    // unlisted videos: vimeo.com/<id>/<hash> or ?h=<hash>
    const hash = url.searchParams.get('h') || (/^[\da-f]+$/i.test(parts[idx + 1] || '') ? parts[idx + 1] : '');
    return {
      provider: 'vimeo',
      src: (autoplay) => {
        const params = new URLSearchParams();
        if (hash) params.set('h', hash);
        if (autoplay) params.set('autoplay', '1');
        const query = params.toString();
        return `https://player.vimeo.com/video/${id}${query ? `?${query}` : ''}`;
      },
    };
  }

  return null;
}

/** Link text unless it is just the URL, then image alt, then a default. */
function getTitle(link, img) {
  const text = link.textContent.trim();
  const isUrl = !text || text === link.href || /^https?:\/\//i.test(text);
  return (!isUrl && text) || img?.alt?.trim() || 'Video';
}

/**
 * Swaps a low-res YouTube thumbnail poster (hqdefault is 480x360, letterboxed)
 * for the 1280x720 maxresdefault of the same video. Missing maxres images come
 * back as a 120x90 placeholder (HTTP 404), so revert to the authored src then.
 * Author-supplied (non-YouTube) posters are left alone.
 */
function upgradeYoutubePoster(img, id) {
  if (!img || !id) return;
  let url;
  try {
    url = new URL(img.currentSrc || img.src, window.location.href);
  } catch (e) {
    return;
  }
  const isThumbHost = /^(i\d?\.ytimg\.com|img\.youtube\.com)$/.test(url.hostname);
  const match = url.pathname.match(/^\/vi(?:_webp)?\/([\w-]+)\/(default|mqdefault|hqdefault|sddefault)\.(jpg|webp)$/);
  if (!isThumbHost || !match || match[1] !== id) return;

  const original = img.getAttribute('src');
  const revert = () => {
    if (img.getAttribute('src') !== original) img.src = original;
  };
  img.addEventListener('load', () => {
    if (img.naturalWidth <= 120) revert();
  });
  img.addEventListener('error', revert, { once: true });
  img.closest('picture')?.querySelectorAll('source').forEach((s) => s.remove());
  img.removeAttribute('srcset');
  img.src = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/maxresdefault.jpg`;
}

function createFrame(embed, title, autoplay) {
  const frame = document.createElement('div');
  frame.className = `${BLOCK}-frame`;
  const iframe = document.createElement('iframe');
  iframe.src = embed.src(autoplay);
  iframe.title = title;
  iframe.allow = ALLOW;
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.append(iframe);
  return { frame, iframe };
}

export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')];
  const link = links.find((a) => getVideoEmbed(a.href)) || links[0];
  const picture = block.querySelector('picture');
  const img = picture?.querySelector('img') || block.querySelector('img');

  // no usable link: leave the authored content (e.g. a lone image) untouched
  if (!link) return;

  const embed = getVideoEmbed(link.href);
  if (!embed) {
    // unsupported URL: keep a plain, readable link
    const p = document.createElement('p');
    p.className = `${BLOCK}-fallback`;
    link.textContent = link.textContent.trim() || link.href;
    p.append(link);
    block.replaceChildren(p);
    return;
  }

  const title = getTitle(link, img);
  block.classList.add(`${BLOCK}-${embed.provider}`);

  const stage = document.createElement('div');
  stage.className = `${BLOCK}-stage`;
  block.replaceChildren(stage);

  if (picture || img) {
    const poster = document.createElement('div');
    poster.className = `${BLOCK}-poster`;
    const media = picture || img;
    if (img) img.alt = img.alt || '';
    if (embed.provider === 'youtube') upgradeYoutubePoster(img, embed.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${BLOCK}-play`;
    button.setAttribute('aria-label', `Play video: ${title}`);
    const icon = document.createElement('span');
    icon.className = `${BLOCK}-play-icon`;
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon);
    poster.append(media, button);
    stage.append(poster);

    button.addEventListener('click', () => {
      const { frame, iframe } = createFrame(embed, title, true);
      poster.replaceWith(frame);
      block.classList.add(`${BLOCK}-is-loaded`);
      iframe.focus();
    }, { once: true });
    return;
  }

  // no poster: load the (non-autoplaying) player when it nears the viewport
  stage.classList.add(`${BLOCK}-pending`);
  const load = () => {
    const { frame } = createFrame(embed, title, false);
    stage.classList.remove(`${BLOCK}-pending`);
    stage.replaceChildren(frame);
    block.classList.add(`${BLOCK}-is-loaded`);
  };
  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '200px 0px' });
  observer.observe(block);
}
