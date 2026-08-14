# ELEV8 Fitness Gym — project notes

Pre-opening single-page site for a gym in Clane, Co. Kildare.
Plain static HTML/CSS/JS. No framework, no build step.

---

## Where the code lives

**`~/Documents/GitHub/elev8-website` — the repo. Edit here.**

Claude has been granted Full Disk Access, so it can read and write the repo
directly. The old `~/claude/elev8-work` staging copy and its manual `cp -R`
step are **retired** — don't reintroduce them; two copies silently drifting
apart caused more trouble than the sandbox ever did.

Commit and push from GitHub Desktop as usual.

If Claude ever reports `Operation not permitted` on `~/Documents`, the macOS
privacy grant has been revoked. It cannot re-request it — macOS only prompts
on first access and stays silent after a revocation. Re-add the app manually:
System Settings → Privacy & Security → Full Disk Access → `+` →
`/Applications/Claude.app`, then restart Claude. To restore the normal prompt
instead, run `tccutil reset SystemPolicyDocumentsFolder com.anthropic.claudefordesktop`.

Two things in the repo that aren't in any staging copy, so don't delete them
as strays: `source/` (4K and OG logo masters) and `serve.py`, whose repo
version is the good one — fuller headers and logging than older copies.

Note: `assets/amenities/recovery.jpg` is an old AI-generated image replaced
by a real photo. Still unused, still present.

---

## Running it

```bash
python3 ~/Documents/GitHub/elev8-website/serve.py 4190
```

`serve.py` sends `Cache-Control: no-store`. Plain `python -m http.server`
does **not**, and browsers then cache `styles.css`/`script.js` and show a
stale build — this cost real debugging time. Use `serve.py`.

Servers do not survive between sessions; restart as needed.

---

## Structure

`index.html` · `styles.css` · `script.js` · `assets/`

Sections in order: hero → marquee → about → classes → facilities →
progress → pricing → social → contact → footer.

### Brand tokens (`:root` in styles.css)
- `--red #E50914`, `--red-hot #FF1E27`
- `--black #0A0A0A`, `--charcoal #121212`
- `--metal #8A8A8E`, `--metal-lt #B0B0B0`
- `--hyrox #FFED00` — official HYROX yellow, taken from hyrox.com's own CSS
- Type: Anton (display), Barlow Condensed (labels), Inter (body)

### Things that will bite you
- **`.reveal` scroll animations** are hidden by default and only unhidden by
  JS. An inline `<script>` in `<head>` sets `.js` on `<html>` so content
  still renders if JS fails. Don't remove it.
- **Pricing cards** use `position:sticky` to stack on scroll. `script.js`
  writes a `--cover` custom property per card for the recede effect. Every
  card carries an inline `--i` index that drives its sticky `top`, so the
  effect is pure CSS + that one property.
  Offsets are `96px + i*18px` on desktop and `82px + i*9px` below 900px —
  phone cards are ~370–490px tall (vs ~150px on desktop), so the desktop
  stagger would push card six off screen. Below 620px of viewport *height*
  (landscape phones) it falls back to a plain list; `script.js` detects this
  by reading `position` and clears `--cover` itself, so no JS change is
  needed if the breakpoints move. The pinned tops also add `--banner-h` —
  see the ticker below.
- **The `.ticker` banner** ("Phase One Sign-Up Coming Soon!") lives *inside*
  `<header class="nav">`, not as its own fixed element. The nav's height
  changes 86px → 74px as it sticks, so anything separately fixed underneath
  would need its `top` re-synced on every scroll. As a nav child it just
  rides along.
  - `--banner-h` (34px, 32px under 860px) is the single source of truth.
    Hero padding, `scroll-padding-top` and the sticky card offsets all
    `calc()` off it. **Set it to `0px` to retire the banner** — every
    offset collapses back automatically.
  - The loop slides the track by exactly `-50%`, which is only seamless
    while **one `.ticker__seq` is at least as wide as the viewport**. The
    markup ships 3 repeats (~794px, fine for a phone); `script.js` measures
    and repeats the sequence until it spans the viewport, re-running on
    resize. Without that, wide screens flash a gap at the right edge each
    cycle. If you edit the ticker text, keep the two `.ticker__seq` blocks
    identical or the loop will jump.
  - Known rough edge: on desktop it competes with the `.marquee` under the
    hero — two horizontal scrollers visible at once, both sliding left.
- **The oversized `8`** in the hero wordmark needs `line-height:.55` plus
  `padding-top` on `.hero__title`, or it overlaps the badge above it.
- Verify layout by measuring in the browser, not by eye — the preview pane
  frequently renders at the wrong size or blank.

---

## Content facts (confirmed by the owner)

- **Hours** Mon–Fri 6am–9pm · Sat 9am–4pm · Sun 9am–3pm
- **Address** Capdoo, Clane, Co. Kildare · Eircode **W91 EC9X** · free parking
- **Phone** +353 85 735 7735 · **Email** elev8fitnessgyms@gmail.com
- **Over 18s only**
- Instagram `@elev8_fitnessgym` · Facebook `elev8fitnessgym`

### Pricing (6 stacking cards)
| | |
|---|---|
| Gym Only | €70/mo (+ €25 one-off admin fee) |
| Small Group PT + gym | €159/mo, includes 10 PT sessions a month |
| Upfront standard | 3mo €200 · 6mo €395 · 12mo €770 |
| Student (no admin fee) | €55/mo · €155 · €300 · €575 |
| Class packs | Spin 8 €80 · Spin 12 €110 · Step 8 €80 · Zumba 8 €80 |
| Outdoor sauna + plunge pool | €10 per session, members only |

### Launch offer
- **Phase 1** — first 50 members: 10% off first 3 months + no sign-on fee
- **Phase 2** — members 51–100: no sign-on fee
- Phase 1 sign-up opens **Sunday**
- Signup CTAs scroll to `#signup` at the end of pricing; that block holds the
  only outbound link:
  `https://secure.ashbournemanagement.co.uk/signup/membership?ownerGroup=GRIEL5`

---

## Media

Real: gym logo and 4 buildout reels (from Instagram), the café photo, the
outdoor sauna/plunge-pool photo.
AI-generated: hero video loop, 4 class photos (spin/step/zumba/hyrox).
Replace the AI ones with real shots as they become available.

Official brand marks in `assets/brands/` — Zumba, TRYKA, HYROX (plus a yellow
HYROX variant). **These are trademarks**; using them implies the gym is
licensed/affiliated. Worth confirming before launch.

---

## Outstanding

- [ ] Copy working files into the repo, commit, push (see above)
- [ ] Hero button still reads "Lock In Pre-Opening Rate" — odd next to the
      "registration coming soon" banner
- [ ] Site isn't deployed anywhere; it's static, so Netlify Drop or similar
      would take minutes
- [ ] Class photos are AI placeholders
