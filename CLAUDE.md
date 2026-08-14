# ELEV8 Fitness Gym — project notes

Pre-opening single-page site for a gym in Clane, Co. Kildare.
Plain static HTML/CSS/JS. No framework, no build step.

---

## ⚠️ Read this first: two copies exist

| Path | What it is | Claude access |
|---|---|---|
| `~/Documents/GitHub/elev8-website` | **The real repo** (git, GitHub Desktop) | ❌ blocked by macOS |
| `~/claude/elev8-work` | Working copy — all edits happen here | ✅ full |

macOS gates `~/Documents`, `~/Downloads` and `~/Desktop` behind per-app privacy
permission, so Claude can create new files there but cannot read or overwrite
existing ones. Everything is therefore edited in `~/claude/elev8-work` and
copied across manually:

```bash
cp -R ~/claude/elev8-work/{index.html,styles.css,script.js,assets} \
      ~/Documents/GitHub/elev8-website/
```

**This copy step is easy to forget** — if GitHub Desktop shows no changes,
this is why. Commit/push from GitHub Desktop after copying.

**To remove the split entirely:** System Settings → Privacy & Security →
Files and Folders (or Full Disk Access) → enable for Claude. Then work
directly in the repo and delete `~/claude/elev8-work`.

Note: the repo still contains `assets/amenities/recovery.jpg`, an old
AI-generated image replaced by a real photo. `cp -R` won't delete it.

---

## Running it

```bash
python3 ~/claude/elev8-work/serve.py 4190     # working copy
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
  needed if the breakpoints move.
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
