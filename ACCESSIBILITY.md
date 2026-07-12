# Accessibility Notes — Newton's Law of Gravity Calculator

Target: **WCAG 2.1 AA** (AAA where reasonable). Human screen-reader QA is still required
(see bottom).

## Structure & semantics
- Single `<h1>` is rendered by the `<kl-unl-masthead>` component (the sim adds no
  competing `h1`). Panels use `<section>` with `<h2>` headings in order.
- Landmarks: `<main>` (`.app-layout`), masthead `<header>`/`<nav>`, each panel a labelled
  `<section>`. Every parameter is a `<fieldset>` with a `<legend>`.
- Every control is a native element: `<button>`, `<input>`, plus a custom
  `role="slider"` thumb. No `<div onclick>`.

## Text alternatives
- Object icons are decorative duplicates of the button text (`alt=""`, `aria-hidden`);
  the accessible name is on the `<button>` (e.g. "Earth, 5.97 times ten to the 24
  kilograms").
- The canvas-free diagram (the equation) is real MathJax math, exposed to AT via
  MathJax's assistive MathML, and additionally summarised in `.sr-only` description
  paragraphs tied to each equation.

## Mathematics (MathJax)
- All equations, values, symbols, subscripts, superscripts, units and the multiplier
  labels (×⅓, ×½, ×2, ×3) are typeset by MathJax (SVG output) from LaTeX. Nothing math is
  a raster image, ASCII, or canvas-painted text.
- The MathJax context menu is **not** disabled — right-clicking any symbol opens
  "Show Math As → TeX / MathML". MathJax output is kept out of the keyboard tab order
  (`tabindex="-1"` on every `mjx-container`) so it does not add dozens of tab stops; the
  right-click menu still works (the contextmenu event is independent of tabindex).
- MathJax 3.2.2 is vendored locally (`vendor/mathjax/tex-svg.js`); no CDN/network.

## Colour & contrast
- Uses the KL-UNL palette variables. No state is encoded by colour alone: a selected
  labelled object is shown by (a) the colour icon, (b) a persistent floating text label,
  (c) `aria-pressed="true"` and an outline. Disabled buttons carry the real `disabled`
  state, not just dimming.

## Keyboard
- Full keyboard operability, logical tab order, visible `:focus-visible` ring from
  `kl-unl.css`. No keyboard traps; the masthead dialog manages its own focus.
- **Slider** (`role="slider"`, `tabindex="0"`) — fully operable and never "sticks":
  - `←`/`↓` decrement, `→`/`↑` increment by **one significant-digit tick** (the exact
    Flash arrow-key step).
  - `PageUp`/`PageDown` = ± one order of magnitude.
  - `Home`/`End` = minimum / maximum.
  - Clicking or tapping the thumb (or the track) focuses the slider, so arrows work
    immediately without tabbing first. `Tab` always moves away normally.
- Pointer and keyboard paths mutate the same state object, so they stay in sync.
- Value field: activate the readout (Enter/Space) to edit, type a value, `Enter` to
  commit or `Escape` to cancel.

## Screen-reader narration (NVDA + VoiceOver)
- An `aria-live="polite"` status region announces each committed change **with units and
  quantity name**, e.g. "Mass 1, Earth, 5.97 times ten to the 24 kilograms. Force 1.00
  newtons." Drag results are announced on release (not per tick) to avoid flooding.
- **Units are always spoken.** Slider `aria-valuetext`, value-button `aria-label`, marker
  `aria-label` and every live message include the quantity name, the number, and the
  unit spelled as a word ("kilograms", "meters", "newtons", "meters per second squared",
  "times ten to the …"). No bare numbers, and no reliance on a visually-adjacent unit
  glyph being read.
- `aria-valuenow`/`min`/`max` on the slider are the tick index and range; the spoken
  value is carried by `aria-valuetext`.
- The equation `.sr-only` companions give a units-complete spoken description alongside
  the MathJax math.

## Timing / motion
- No continuous animation; nothing flashes. The only motion is the optional
  press-and-hold auto-repeat on the slider track, which stops on release (well under the
  5 s / 3-per-second WCAG limits). `prefers-reduced-motion` disables the icon
  transitions. No Pause control is needed; Reset is provided by the masthead.

## Zoom / reflow / responsive
- Body text is 1.125 rem (18 px) minimum, sized in rem so it tracks the browser font
  setting. Layout uses relative units and reflows without clipping at 200% zoom.
- Desktop → tablet → phone-portrait: the two-up top row (formula + memory) collapses to a
  single stacked column (formula → parameters → memory) with no horizontal scrolling. The
  equations are laid out over several lines (`\begin{aligned}`) so they wrap rather than
  scroll; on very narrow screens the equation SVG scales down to fit its box. Nothing on
  the page scrolls horizontally.

## Touch
- Pointer Events drive one code path for mouse and touch; `touch-action: none` on the
  slider prevents the page scrolling during a drag. No hover-only affordances (hover
  reveals extras but everything is reachable by focus/click). Primary controls meet the
  44 px target.

## Known limitations
- **Labelled-object markers are small** (below the 44 px target) because up to 13 share
  one slider (see CONVERSION_NOTES §6). They are supplementary; every value they set is
  also reachable via the slider, the value field, and the multiplier buttons, all of
  which meet 44 px. On phone-portrait the track is only ~300 px for 13 logarithmically
  spaced objects, so the closest pair (e.g. distance-to-Moon vs distance-to-Sun) still
  overlaps slightly even at the smallest icon size; this is inherent to the density and
  does not affect the primary controls.
- **Human screen-reader QA (NVDA on Windows, VoiceOver on macOS/iOS) is still required**
  to confirm announcement wording and ordering on real assistive technology.
