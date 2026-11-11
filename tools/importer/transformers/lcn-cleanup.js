/* eslint-disable */
/* global WebImporter */

/**
 * LCN (lcnclosers.com) cleanup transformer.
 *
 * Removes non-authorable chrome from the AEM-built source page:
 * - skip-to-content link (.cmp-page__skiptomaincontent)
 * - global header + global footer experience fragments (body > div.xf-content-height),
 *   including the "Want LCN in your inbox?" band and the Marketo newsletter modal
 * - OneTrust cookie banner, Marketo popup form/iframe, Inbenta search results widget
 * - scripts, styles, noscript, link, non-content iframes
 */

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Chrome that could confuse block matching; content lives in #root-main.
    removeAll(element, [
      '.cmp-page__skiptomaincontent',
      // Only the global header/footer fragments; in-page fragments (Allegion promo) reuse the class.
      'body > div.xf-content-height',
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '#mktoStyleLoaded',
      'form.mktoForm',
      '#MktoForms2XDIframe',
      '#newsletter-modal',
      '#searchModal',
      '.inbenta-search-results',
      // Breadcrumb trail is site chrome, not authored content.
      '.cmp-breadcrumb',
    ]);
  }

  if (hookName === 'afterTransform') {
    removeAll(element, [
      'header',
      'footer',
      'nav',
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
      'form.mktoForm',
      '#onetrust-consent-sdk',
      '.cmp-page__skiptomaincontent',
      // Product detail chrome: back/share/print row, empty finish picker, empty ratings.
      // Removed after parsing because the product intro section selector anchors on .upperRow.
      '.default-product-detail-component .upperRow',
      '.default-product-detail-component .finisheImgsRow',
      '.default-product-detail-component .productRatingRow',
      // Decorative line-drawing section backgrounds left over after the hero parsers ran.
      'div.background-image > div[class*="backgroundImage"] > img',
    ]);

    // Same drawings set as CSS backgrounds; clear them so transformBackgroundImages skips them.
    element.querySelectorAll('div.background-image, div.background-image > div[class*="backgroundImage"]').forEach((el) => {
      el.style.backgroundImage = 'none';
    });

    // Empty headings from blank rich-text lines.
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if (!h.textContent.trim() && !h.querySelector('img, picture')) h.remove();
    });

    // Same-site links become root-relative so they resolve on the migrated site, not the old one.
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      const m = href.match(/^https?:\/\/(www\.)?lcnclosers\.com\/+(.*)$/i);
      if (m) a.setAttribute('href', `/${m[2]}`);
    });

    // Strip tracking / framework attributes that are not authorable.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (
          n.startsWith('data-cmp-')
          || n.startsWith('data-analytics')
          || n.startsWith('data-track')
          || n === 'onclick'
        ) {
          el.removeAttribute(n);
        }
      });
    });
  }
}
