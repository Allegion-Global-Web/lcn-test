# columns-video

Custom **columns** block. Purpose: Brand story intro: text column (heading, subheading, paragraph, CTA) beside a video poster that plays an embedded video.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, two cells: cell 1 heading, subheading, paragraph, CTA link; cell 2 poster image plus a YouTube/Vimeo link (the image may be linked directly). Without a video link the image renders as a plain image.

## Supported variations

No authored variations. Looks are picked from the content:

- video link present: full-bleed text + click-to-play poster (homepage).
- no video link: `columns-video-static` is added; text and a plain photo in the
  container column (30px gutter). With the text cell first it lays out as the
  content of a grey card (e.g. `card, dark-blue` section); with the image cell
  first (`columns-video-media-first`) the photo sits left of the text.

## Universal Editor fields

N/A (Document Authoring project)
