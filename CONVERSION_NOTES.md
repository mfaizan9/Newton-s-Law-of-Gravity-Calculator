# Conversion Notes — Newton's Law of Gravity Calculator

## Behaviour model (one paragraph)

The calculator computes the gravitational force between two masses and the resulting
acceleration of each. The user sets three quantities — **M₁**, **M₂** (masses, kg) and
**R** (separation, m) — each with a logarithmic slider spanning an enormous range
(masses from an electron, 9.11×10⁻³¹ kg, to the Milky Way, 1.15×10⁴² kg; separations
from a proton radius to the observable universe). Each quantity can be set four ways:
dragging the slider, typing a value, clicking a **labelled object** on the slider
(electron, apple, Earth, Sun, …), or multiplying the current value by ½, ⅓, 2 or 3 with
buttons. The panel continuously shows the full equation
`F₂₁ = F₁₂ = G·M₁M₂/R²` with every value substituted, the numeric force in both
`kg·m·s⁻²` and `N`, and the two accelerations `a₁ = F/M₁`, `a₂ = F/M₂`. A **Memory**
panel can store snapshots of all six values into a table (up to three stored columns,
cycling) alongside the live "current values" column.

## Physics / constants (verbatim from the ActionScript)

- `G = 6.67e-11` m³ kg⁻¹ s⁻²
- `F = G · M1 · M2 / R²`  ,  `a1 = F / M1`  ,  `a2 = F / M2`
- Force/acceleration displayed in scientific notation, significand to 2 decimals, with
  the `≥10` roll-up carried over exactly from `Grav Calc.update()`.
- The physics always uses each slider's **`fullValue`** (the exact value, including any
  ×2/×3 multiplier factors), while the on-screen slider value and position use the
  value rounded to **3 significant digits** — exactly as the original separated
  `fullValue` from `controller.value`. This is why, e.g., doubling M₁ = 1.02×10⁻¹
  gives a₂ = 3.35×10⁻²⁵ (from the exact 0.204) rather than 2×1.68 = 3.36.
- Slider ranges (from the `GravCalcClass` constructor, overriding the init-clip
  defaults): masses `[9.10999e-31, 1.15001e+42]`, separation `[9.9999e-16, 8.80001e+26]`.
- The full `specialMasses` (13 objects) and `specialSeparations` (12 objects) tables —
  text, icon, value and unit — are copied verbatim into `simulation.js`.
- Initial / reset selection (from `p.reset`): R → "radius of Earth" (index 4),
  M₁ → "small apple" (index 2), M₂ → "Earth" (index 9). Verified to reproduce the
  original screenshot exactly: F = 1.00 N, a₁ = 9.81 m s⁻², a₂ = 1.68×10⁻²⁵ m s⁻².

## AS → HTML5 mapping

| ActionScript | HTML5 port |
|---|---|
| `SliderLogicClassV6` (log scaling, significant-digit value objects, `getIncrementedValueObject`) | `SliderLogic` in `simulation.js`, using a normalised parameter `u ∈ [0,1]` (minP=0, maxP=1) so it is display-size independent |
| `SciNot Slider` (grabber drag, bar press w/ continuous repeat, arrow keys, `doMultiplierReset`, multiplier counters, `fullValue`) | custom accessible slider component + `Param` model; pointer + full keyboard both mutate the same state |
| `Special Button` / `Special Button Mouse Area` (hover lights icon + shows label, click selects value) | `<button>` markers with the reused icon PNGs (grey/color), `title` tooltip + units-complete `aria-label`; the per-object `xShift` from the source is applied so neighbouring icons don't collide |
| `specialLinesMC` (thin grey line from the bar to each object; a thicker highlighted line for the selected one, rising toward the label) | one `.pline` per object, drawn behind the bar, centre-aligned with its icon (same `xShift`); `.pline--selected` is thicker, coloured, and extends above the bar |
| Parameter layout (value with the ×⅓/×½/×2/×3 buttons beneath it, slider to the right) | left column (fixed width) stacks the value over the 2×2 multiplier grid, so all three sliders start at the same x and are equally long; the slider fills the remaining width |
| `Multiplier Button` (×⅓ ×½ ×2 ×3, power/increment, bound checks) | `.mult-btn` buttons → `pressMultiplier()`, with the same enable/disable-at-bounds logic from `updateSynchronization` |
| `Stored Values Table` (store/show/clear, 3-column ring, `#N` labels) | HTML `<table>` built in `renderTable()`; ring overwrite + incrementing `#N` preserved |
| `Number.toScientific` / `toFixed` polyfills | `sciParts()` / `asToFixed()` ports (same `Math.round(x·10^f)` rounding) |
| `displayText` `<sub>/<sup>` HTML | MathJax LaTeX (`M_1`, `\times 10^{n}`, `\mathrm{...}`) |
| Title Bar + About dialog | `<kl-unl-masthead>` component (title + Reset + About). `helpLinkageName == ""` in the source → `help.content: ""` in `contents.json` → no Help button |
| `onEnterFrame` / `getTimer()` bar auto-repeat | pointer-hold repeat driven by `performance.now()` with the same 500 ms delay and 0.05 ticks/ms rate |

## `contents.json` entry (added)

A single entry keyed `"newtongravity"` was added to `foundation/contents.json` (the only
change to any foundation file), alphabetically placed before `"obliquity"`, with
`meta.title`, `meta.version`, `masthead.about` (reworded from the original About panel
into the pipeline boilerplate) and `masthead.help.content: ""` (suppresses the Help
button, matching the original which had no Help).

## Reused assets vs. code-drawn

- **Reused as-is:** the 18 labelled-object symbols (electron, proton, atom, apple, 1 kg,
  1 m, person, human-spacing, mountain, asteroid, moon, mars, earth, jupiter, sun,
  nearest star, milky way, universe), each rendered from the SWF at 4× to
  `assets/icons/<name>-grey.png` (frame 1, unselected) and `-color.png` (frame 2,
  selected). Copied, never redrawn.
- **Code-drawn originally, re-expressed with native HTML/CSS:** the slider bar, grabber,
  value field, multiplier buttons, memory table grid and the equation layout — these
  were built at runtime by the ActionScript `drawArc`/`beginFill`/`lineTo` calls, so
  there is no exported file for them. They are reproduced with accessible native
  controls + CSS rather than a `<canvas>`, because none of this art needs pixel
  compositing and native controls are required for accessibility.

## Deviations from the original (all presentation-only; physics unchanged)

1. **No `<canvas>`.** The original "stage" here is entirely controls, text fields and a
   slider bar — all better served by native, accessible HTML elements. Nothing in this
   sim animates or composites bitmaps onto code-drawn art, so a canvas layer would add
   no fidelity and would break accessibility. (Rule 3 preference order still honoured:
   the only exported art — the object icons — is reused as bitmap files.)
2. **Layout follows the KL-UNL shell, not Flash pixels.** The screenshot's arrangement is
   reproduced as closely as the shell allows: formula panel top-left, Memory panel
   top-right, the three parameter rows stacked below. On narrow/portrait widths it
   reflows to a single column (formula → parameters → memory). The main equation is laid
   out over three lines with `\begin{aligned}` (aligned at `=`) so it never scrolls
   horizontally; the acceleration equation is two lines (a₁, a₂). MathJax output is taken
   out of the tab order (`tabindex="-1"`), leaving the right-click "Show Math As" menu
   intact.
3. **Value field shows the pretty ×10ⁿ form via MathJax**; clicking it reveals a plain
   text input using `e`-notation (e.g. `1.02e-1`) for editing, then swaps back — the
   same display/edit split the original had (display mode used `×10ⁿ`, edit mode used
   `e`). The editable input necessarily contains typed `e`-notation text; all *rendered*
   values are MathJax-typeset.
4. **Slider keyboard is richer than the original.** The Flash grabber only responded to
   Left/Right (±1 significant-digit tick). We keep that exact step on the arrow keys and
   *add* PageUp/PageDown (±one decade), Home/End (min/max) for WCAG keyboard operability.
5. **Memory table has row headers** (M₁, M₂, R, F, a₁, a₂) and a `<caption>`. The Flash
   table drew unlabelled value cells; explicit headers are an accessibility improvement.
   Column order: stored columns (in store order, ring-overwritten) then "current values"
   on the right, matching the original's `currentValuesX` placement.
6. **Marker tap targets** are ~30 px (icon + hit padding) rather than the 44 px WCAG
   target, because up to 13 labelled objects share one slider and larger targets would
   overlap. They are supplementary quick-selects; the primary controls (slider thumb,
   value input, multiplier and memory buttons) all meet 44 px. Noted in ACCESSIBILITY.md.

## Verification (served over HTTP, no emulator)

Initial state and every interaction were driven programmatically and checked against the
AS: initial F/a₁/a₂ match the original screenshot; ×2 on M₁ doubles F and preserves a₁;
multiplier buttons disable at range bounds; marker clicks snap to exact values with the
floating label; arrow/Page/Home/End keys step by 1 tick / 1 decade / to min-max; pointer
drag maps through the log scale to the correct value; typed entry, store/show/clear and
Reset all behave as in the source. No console errors when served over HTTP.
