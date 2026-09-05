# media/

Drop the video and poster assets here. The site references these exact
filenames — add them and everything wires up automatically.

## Videos

| File | Section | Ratio | Notes |
|---|---|---|---|
| `hero.mp4` | Hero background | 16:9 (1920×1080) | Plays, holds last frame ~2s, loops. Logo pops on the last frame. |
| `story.mp4` | Story video | 16:9, ~13s | Timed "READY?" at 1.08–2.1s, "Tap/Hover to read" cue fires at 2.0s. |
| `machine.mp4` | Origin moat card | 4:5 (1080×1350) | Muted loop behind the bouncing "the machine" wordmark. |
| `maggi.mp4` | Work tile 01 | 4:5 in tile, 16:9 in lightbox | |
| `chase.mp4` | Work tile 02 | 4:5 / 16:9 | |
| `showreel.mp4` | Work tile 03 | 4:5 / 16:9 | |

## Poster stills (recommended for mobile performance)

Add a matching poster JPG for each video so a still shows instantly before
(or instead of) the video downloads. Referenced filenames:

`hero-poster.jpg`, `story-poster.jpg`, `machine-poster.jpg`,
`maggi-poster.jpg`, `chase-poster.jpg`, `showreel-poster.jpg`

If a poster is missing the panel simply falls back to its dark background —
nothing breaks.

## Encoding guidance (mobile perf)

- **Codec:** H.264 video + AAC audio in an `.mp4`. Avoid HEVC/H.265 — many
  mobile browsers won't decode it.
- **Bitrate:** ~2–4 Mbps is plenty for these short loops.
- Keep the files as small as the quality allows; several load on one page.

## How the site loads them

- Tile videos (`maggi`/`chase`/`showreel`) load only on demand — hover on
  desktop, or when ~35% on screen on touch devices.
- The hero and origin videos autoplay, **except** on a phone with Data Saver
  or a slow (2G/3G) connection, where the poster/gradient is used instead.
- Every video is muted + `playsinline`; the first tap/scroll unlocks
  autoplay (required by mobile browsers).
