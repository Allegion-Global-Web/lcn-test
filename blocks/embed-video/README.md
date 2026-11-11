# embed-video

Custom **embed** block. Purpose: Full-width video player embedded in a content section.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell: optional poster image, then a link to the video. Supported: YouTube (watch, shorts, embed, live, youtu.be; t/start honoured) via youtube-nocookie, and Vimeo (including unlisted hash) via player.vimeo.com. With a poster the player loads on click; without one it loads lazily when scrolled near. Link text (or the poster alt) becomes the iframe title. Any other URL renders as a plain link.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
