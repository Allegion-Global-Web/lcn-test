# cards-solutions

Custom **cards** block. Purpose: Solution entry points: image cards with a two-line heading, description and a link to the solution page.

## Authoring (Document Authoring)

Model: `collection`

Repeating rows — one row per item. Each item: cell 1: card image; cell 2: heading (two lines, e.g. 'Solutions by' / 'Market'), description paragraph, CTA link ('Go Now').

## Supported variations

No authored variations. The look follows the content:

- Cards with a CTA ("Go Now"): one column per card from 768px (up to 4), set by block JS as `--cards-solutions-columns` plus a `cards-solutions-cols-N` class. Two cards (by-market "Other Solutions") use the source's 15px-gutter columns in a 1170px row.
- Cards without a CTA ("Related Products"): light grid on desktop and a scroll-snap carousel below 768px (`cards-solutions-related`).

## Universal Editor fields

N/A (Document Authoring project)
