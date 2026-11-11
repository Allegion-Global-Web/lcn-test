/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed-video (Embed (video) convention: 1 column; one row whose
 * single cell holds an optional poster image ABOVE the video URL link).
 * Source: .imageText with .option-text-with-video — a YouTube <iframe> in
 * .content.video (why-lcn "LCN Performance"). The iframe src is read here,
 * before the cleanup transformer (afterTransform) removes iframes.
 * Poster: an <img> in the markup if present, else the YouTube thumbnail
 * https://i.ytimg.com/vi/<id>/hqdefault.jpg. Link: https://www.youtube.com/watch?v=<id>
 * with the video title as link text.
 */

// Titles of known source videos (the source iframe carries no title attribute).
const KNOWN_TITLES = {
  FopATTmz1js: 'LCN - Leaders in Door Control & Safety Solutions',
};

function cleanText(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function youtubeId(src) {
  if (!src) return null;
  let url;
  try {
    url = new URL(src, 'https://www.youtube.com/');
  } catch (e) {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, '');
  if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || null;
  if (!/(^|\.)youtube(-nocookie)?\.com$/.test(host)) return null;
  const v = url.searchParams.get('v');
  if (v) return v;
  const [type, id] = url.pathname.split('/').filter(Boolean);
  return ['embed', 'shorts', 'live', 'v'].includes(type) ? id || null : null;
}

export default function parse(element, { document }) {
  const iframe = element.querySelector('iframe[src]');
  const iframeSrc = iframe ? iframe.getAttribute('src') : '';
  const srcLink = element.querySelector('a[href*="youtu"]');
  const id = youtubeId(iframeSrc) || (srcLink && youtubeId(srcLink.getAttribute('href')));

  let href = '';
  if (id) href = `https://www.youtube.com/watch?v=${id}`;
  else if (srcLink) href = srcLink.getAttribute('href');
  else if (iframeSrc) href = iframeSrc;

  const textBox = element.querySelector('.text');
  const title = (iframe && (iframe.getAttribute('title') || '').trim())
    || (id && KNOWN_TITLES[id])
    || cleanText(textBox && textBox.querySelector('h1, h2, h3, h4, h5, h6'))
    || (srcLink && cleanText(srcLink))
    || href;

  const content = [];
  const srcImg = [...element.querySelectorAll('img')].find((img) => img.getAttribute('src'));
  let posterSrc = '';
  if (srcImg) posterSrc = srcImg.getAttribute('src');
  else if (id) posterSrc = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  if (posterSrc) {
    const img = document.createElement('img');
    img.src = posterSrc;
    img.alt = (srcImg && (srcImg.getAttribute('alt') || '').trim()) || title;
    content.push(img);
  }

  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = title;
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  }

  const cells = content.length ? [[content]] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
