/* eslint-disable */
/* global WebImporter */

/**
 * LCN (lcnclosers.com) sections transformer.
 *
 * beforeTransform: insert <hr> section breaks before every non-first section
 * (reverse order) while the original section elements still exist. Styled
 * sections get a temporary data-excat-section-id marker on their <hr>; a
 * styled first section gets a temporary marked <hr> that is removed later.
 *
 * afterTransform: insert Section Metadata blocks for styled sections after the
 * marker (or the surviving section element), then clean up the markers.
 */

const MARKER = 'data-excat-section-id';
const EL_MARKER = 'data-excat-section-el';

function findSection(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (sel) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
        // invalid selector, try next
      }
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const document = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, section);
      if (el && (i > 0 || section.style)) {
        const hr = document.createElement('hr');
        if (section.style) {
          hr.setAttribute(MARKER, section.id);
          el.setAttribute(EL_MARKER, section.id);
        }
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (section.style) {
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const meta = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });

        // Place metadata at the end of this section: just before the next
        // section break following the marker, or after the surviving element.
        // Sections are nested at different depths in the source, so the next <hr> is often
        // not a sibling. When the section element survived parsing, close it from inside.
        const sectionEl = element.querySelector(`[${EL_MARKER}="${section.id}"]`);
        let anchor = null;
        if (sectionEl) {
          sectionEl.appendChild(meta);
          sectionEl.removeAttribute(EL_MARKER);
          anchor = marker;
        } else if (marker) {
          let n = marker.nextElementSibling;
          while (n && n.tagName !== 'HR') n = n.nextElementSibling;
          if (n) {
            n.parentNode.insertBefore(meta, n);
          } else {
            const surviving = findSection(element, section);
            if (surviving && surviving.parentNode === marker.parentNode) {
              surviving.after(meta);
            } else {
              // last section in this container: append at container end
              marker.parentNode.appendChild(meta);
            }
          }
          anchor = marker;
        } else {
          const surviving = findSection(element, section);
          if (surviving) surviving.after(meta);
        }

        if (anchor) {
          if (i === 0) anchor.remove();
          else anchor.removeAttribute(MARKER);
        }
      }
    }
  }
}
