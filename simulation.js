/* ===========================================================================
 * Newton's Law of Gravity Calculator  --  HTML5 / KL-UNL port
 *
 * Behaviour is a faithful port of the decompiled ActionScript 1 sources
 * (Grav Calc.as, SciNot Slider.as, Slider Logic Class v6.as, Special Button.as,
 * Multiplier Button.as, Stored Values Table.as).  Constants and educational
 * text are copied verbatim from the source.  Presentation follows the KL-UNL
 * foundation + WCAG 2.1 AA (native controls, MathJax, keyboard, live regions).
 *
 * Physics:   F = G * M1 * M2 / R^2   (Newton's law of universal gravitation)
 *            a1 = F / M1 ,  a2 = F / M2
 * =========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Verbatim constants and tables (from Grav Calc.as)
   * ------------------------------------------------------------------ */
  var G = 6.67e-11; // gravitational constant, m^3 kg^-1 s^-2

  // p.specialSeparations  (R slider) -- copied verbatim, incl. y/xShift used for marker stagger
  var specialSeparations = [
    { text: "proton",                         icon: "proton",       row: 1, xShift: 0,     v: 1e-15,   unit: "m" },
    { text: "typical atom radius",            icon: "atom",         row: 1, xShift: 0,     v: 1e-10,   unit: "m" },
    { text: "1 meter",                        icon: "meter1",       row: 2, xShift: 0,     v: 1,       unit: "m" },
    { text: "social spacing",                 icon: "humanspacing", row: 1, xShift: 0,     v: 2,       unit: "m" },
    { text: "radius of Earth",                icon: "earth",        row: 1, xShift: -4.3,  v: 6370000, unit: "m" },
    { text: "distance to Moon",               icon: "moon",         row: 1, xShift: 4,     v: 384000000, unit: "m" },
    { text: "closest approach to Mars",       icon: "mars",         row: 2, xShift: -10,   v: 57000000000, unit: "m" },
    { text: "distance to Sun",                icon: "sun",          row: 1, xShift: 0,     v: 150000000000, unit: "m" },
    { text: "closest approach to Jupiter",    icon: "jupiter",      row: 2, xShift: 10,    v: 590000000000, unit: "m" },
    { text: "distance to nearest star",       icon: "neareststar",  row: 1, xShift: 0,     v: 41000000000000000, unit: "m" },
    { text: "radius of Milky Way",            icon: "milkyway",     row: 1, xShift: 0,     v: 470000000000000000000, unit: "m" },
    { text: "radius of observable universe",  icon: "universe",     row: 1, xShift: 0,     v: 4.4e26,  unit: "m" }
  ];

  // p.specialMasses  (M1 and M2 sliders) -- copied verbatim
  var specialMasses = [
    { text: "electron",       icon: "electron",  row: 1, xShift: -3.5, v: 9.11e-31, unit: "kg" },
    { text: "proton",         icon: "proton",    row: 1, xShift: 3.5,  v: 1.67e-27, unit: "kg" },
    { text: "small apple",    icon: "apple",     row: 1, xShift: -5.3, v: 0.102,    unit: "kg" },
    { text: "1 kilogram",     icon: "kg1",       row: 2, xShift: 0,    v: 1,        unit: "kg" },
    { text: "person",         icon: "person",    row: 1, xShift: 5.3,  v: 72,       unit: "kg" },
    { text: "large mountain", icon: "mountain",  row: 1, xShift: -4.5, v: 1000000000000000, unit: "kg" },
    { text: "large asteroid", icon: "asteroid",  row: 1, xShift: 4.5,  v: 1000000000000000000, unit: "kg" },
    { text: "Moon",           icon: "moon",      row: 2, xShift: -10,  v: 7.35e22,  unit: "kg" },
    { text: "Mars",           icon: "mars",      row: 1, xShift: -6,   v: 6.42e23,  unit: "kg" },
    { text: "Earth",          icon: "earth",     row: 2, xShift: 10,   v: 5.97e24,  unit: "kg" },
    { text: "Jupiter",        icon: "jupiter",   row: 1, xShift: -1,   v: 1.9e27,   unit: "kg" },
    { text: "Sun",            icon: "sun",       row: 1, xShift: 9,    v: 1.99e30,  unit: "kg" },
    { text: "Milky Way",      icon: "milkyway",  row: 1, xShift: 0,    v: 1.15e42,  unit: "kg" }
  ];

  // Slider value ranges (Grav Calc constructor overrides the init-clip 1..10 defaults)
  var MASS_MIN = 9.10999e-31, MASS_MAX = 1.15001e+42;
  var R_MIN    = 9.9999e-16,  R_MAX    = 8.80001e+26;
  var DIGITS   = 3;           // "significant digits", precision 3
  var LN10     = 2.302585092994046; // exactly as used in the AS source

  // Reset selections (Grav Calc.reset): R -> index 4, M1 -> index 2, M2 -> index 9
  var RESET_INDEX = { m1: 2, m2: 9, r: 4 };

  var UNIT_WORD = { kg: "kilograms", m: "meters" };

  /* ------------------------------------------------------------------ *
   * Number formatting (ports of Number.toFixed / toScientific from the AS)
   * ------------------------------------------------------------------ */

  // Number.prototype.toFixed polyfill from Number Functions.as / toFixed.as
  function asToFixed(x, f) {
    f = Math.trunc(f);
    if (f < 0 || f > 20) return "Range Error";
    if (isNaN(x)) return "NaN";
    var sign = "";
    if (x < 0) { sign = "-"; x = -x; }
    var s = "";
    if (x < 1e21) {
      var n = Math.round(x * Math.pow(10, f));
      s = (n === 0) ? "0" : String(n);
      if (f > 0) {
        var len = s.length;
        if (len <= f) {
          var pad = "";
          for (var i = 0; i < f + 1 - len; i++) pad += "0";
          s = pad + s;
          len = f + 1;
        }
        s = s.substr(0, len - f) + "." + s.substr(len - f);
      }
    } else {
      s = String(x);
    }
    return sign + s;
  }

  // Scientific significand/exponent, matching Grav Calc.update()/Special Button (2 decimals)
  function sciParts(x) {
    if (!isFinite(x) || isNaN(x)) return { sig: "0.00", exp: 0 };
    if (x === 0) return { sig: "0.00", exp: 0 };
    var neg = x < 0;
    var ax = neg ? -x : x;
    var exp = Math.floor(Math.log(ax) / LN10);
    var sig = asToFixed(ax / Math.pow(10, exp), 2);
    if (parseFloat(sig) >= 10) { sig = asToFixed(parseFloat(sig) / 10, 2); exp += 1; }
    return { sig: (neg ? "-" : "") + sig, exp: exp };
  }

  // LaTeX for a scientific value (no unit). exp 0 -> significand only (matches AS).
  function sciLatex(x) {
    var p = sciParts(x);
    return (p.exp !== 0) ? (p.sig + "\\times 10^{" + p.exp + "}") : p.sig;
  }

  // Spoken form of a scientific value, e.g. "1.02 times ten to the negative 1"
  function sciSpoken(x) {
    var p = sciParts(x);
    if (p.exp === 0) return p.sig;
    var e = (p.exp < 0) ? ("negative " + (-p.exp)) : ("" + p.exp);
    return p.sig + " times ten to the " + e;
  }

  /* ------------------------------------------------------------------ *
   * SliderLogicClassV6 port (logarithmic scaling, significant-digit ticks)
   * Parameter space is normalised to u in [0, 1]  (minP = 0, maxP = 1).
   * ------------------------------------------------------------------ */
  function SliderLogic(minV, maxV) {
    this.minV = minV;
    this.maxV = maxV;
    this.digs = DIGITS;
    this.lower = Math.pow(10, this.digs - 1); // 100
    this.upper = Math.pow(10, this.digs);     // 1000
    this.ticksPerMag = 9 * this.lower;        // 900
    this.logMinV = Math.log(minV);
    this.scale = (Math.log(maxV) - this.logMinV); // / (maxP-minP)=1
    // total tick count between the endpoints (used for aria valuemax)
    var lo = this.valueObjectFromValue(minV);
    var hi = this.valueObjectFromValue(maxV);
    this.minObj = lo;
    this.totalTicks = this.tickIndex(hi);
  }
  SliderLogic.prototype.valueFromParam = function (u) {
    return Math.exp(u * this.scale + this.logMinV);
  };
  SliderLogic.prototype.paramFromValue = function (v) {
    return (Math.log(v) - this.logMinV) / this.scale;
  };
  SliderLogic.prototype.valueObjectFromValue = function (x) {
    if (x < this.minV) x = this.minV; else if (x > this.maxV) x = this.maxV;
    var mag = Math.floor(Math.log(x) / LN10);
    var sig = Math.round(x * this.lower / Math.pow(10, mag));
    if (sig >= this.upper) { sig = this.lower; mag += 1; }
    return { value: sig / this.lower * Math.pow(10, mag), mag: mag, sig: sig };
  };
  SliderLogic.prototype.getIncrementedValueObject = function (vObj, numTicks) {
    numTicks = Math.round(numTicks);
    var whole, rem;
    var q = numTicks / this.ticksPerMag;
    if (q >= 1) { whole = Math.floor(q); rem = numTicks - whole * this.ticksPerMag; }
    else if (q <= -1) { whole = Math.ceil(q); rem = numTicks - whole * this.ticksPerMag; }
    else { whole = 0; rem = numTicks; }
    var sig = vObj.sig + rem, mag = vObj.mag + whole;
    if (sig >= this.upper) { sig -= this.ticksPerMag; mag += 1; }
    else if (sig < this.lower) { sig += this.ticksPerMag; mag -= 1; }
    var out = { value: sig / this.lower * Math.pow(10, mag), sig: sig, mag: mag };
    if (out.value < this.minV) out = this.valueObjectFromValue(this.minV);
    else if (out.value > this.maxV) out = this.valueObjectFromValue(this.maxV);
    return out;
  };
  // Absolute tick index of a value object relative to the minimum (monotonic)
  SliderLogic.prototype.tickIndex = function (vObj) {
    if (!this.minObj) return 0;
    return (vObj.mag - this.minObj.mag) * this.ticksPerMag + (vObj.sig - this.minObj.sig);
  };
  // Editable-field string (significant-digits mode) from Slider Logic Class v6
  SliderLogic.prototype.valueString = function (vObj) {
    var dec = this.digs - vObj.mag - 1;
    if (dec > 0) return asToFixed(vObj.value, dec);
    return String(vObj.value);
  };

  /* ------------------------------------------------------------------ *
   * MathJax helpers  (SVG output; context menu left enabled per rule 8a)
   * ------------------------------------------------------------------ */
  var mathReady = false;

  // Keep MathJax output out of the tab order (but leave the right-click "Show Math
  // As" menu working -- contextmenu fires regardless of tabindex).
  function stripMjxTab(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.matches && root.matches("mjx-container")) root.setAttribute("tabindex", "-1");
    var list = root.querySelectorAll("mjx-container[tabindex]");
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute("tabindex") !== "-1") list[i].setAttribute("tabindex", "-1");
    }
  }

  function renderMath(el, latex, display) {
    if (!el) return;
    if (!mathReady || !window.MathJax || !window.MathJax.tex2svg) {
      el.setAttribute("data-tex", latex);
      el.textContent = latex; // graceful pre-MathJax fallback
      return;
    }
    el.setAttribute("data-tex", latex);
    var node = window.MathJax.tex2svg(latex, { display: !!display });
    stripMjxTab(node);
    el.textContent = "";
    el.appendChild(node);
  }

  // Render both formula equations at the SAME font size, scaled down together only
  // as much as the wider (force) equation needs to fit its box -- so the two
  // equations are always visually consistent and neither overflows.
  function fitEquations() {
    var els = [document.getElementById("eqn-force"), document.getElementById("eqn-accel")];
    var conts = [];
    for (var i = 0; i < els.length; i++) {
      var c = els[i] && els[i].querySelector("mjx-container");
      if (c) conts.push(c);
    }
    if (!conts.length) return;
    conts.forEach(function (c) { c.style.fontSize = ""; });      // measure at natural size
    var box = els[0];
    var cs = window.getComputedStyle(box);
    var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2;
    var maxW = 0;
    conts.forEach(function (c) { var w = c.getBoundingClientRect().width; if (w > maxW) maxW = w; });
    var scale = (maxW > avail && maxW > 0) ? (avail / maxW) : 1;
    var pct = (Math.floor(scale * 1000) / 10) + "%";
    conts.forEach(function (c) { c.style.fontSize = pct; });
  }
  var _fitTimers = [];
  function scheduleFitEquations() {
    _fitTimers.forEach(clearTimeout);
    _fitTimers = [];
    if (window.requestAnimationFrame) requestAnimationFrame(fitEquations);
    [70, 200, 450].forEach(function (t) { _fitTimers.push(setTimeout(fitEquations, t)); });
  }

  /* ------------------------------------------------------------------ *
   * Parameter model
   * ------------------------------------------------------------------ */
  function Param(key, name, symbol, unit, specials, minV, maxV) {
    this.key = key;
    this.name = name;         // spoken name, e.g. "Mass 1"
    this.symbol = symbol;     // LaTeX symbol, e.g. "M_1"
    this.unit = unit;         // "kg" | "m"
    this.specials = specials;
    this.logic = new SliderLogic(minV, maxV);
    // runtime state
    this.vObj = this.logic.valueObjectFromValue(1);
    this.base = this.vObj.value;      // multiplierBaseValue
    this.m2c = 0;                     // multiplier2Counter
    this.m3c = 0;                     // multiplier3Counter
    this.fullValue = this.vObj.value; // exact value used by the physics
    this.selected = -1;               // selected special index, or -1
    this.dom = {};                    // filled in by buildParamDom
  }
  Param.prototype.doMultiplierReset = function () {
    this.fullValue = this.base = this.vObj.value;
    this.m2c = 0; this.m3c = 0;
  };

  var params = {
    m1: new Param("m1", "Mass 1", "M_1", "kg", specialMasses, MASS_MIN, MASS_MAX),
    m2: new Param("m2", "Mass 2", "M_2", "kg", specialMasses, MASS_MIN, MASS_MAX),
    r:  new Param("r",  "Separation", "R", "m", specialSeparations, R_MIN, R_MAX)
  };
  var paramOrder = ["m1", "m2", "r"];

  // Memory / table state (Stored Values Table.as)
  var memory = { stored: [null, null, null], numColumns: 0, setNumber: 1, show: false };
  var storeEnabled = true;

  // Current computed values (LaTeX + spoken), rebuilt every render
  var current = {};

  /* ------------------------------------------------------------------ *
   * Value commit operations (mirror the AS setValue paths)
   * ------------------------------------------------------------------ */

  // From drag / keyboard (value object already computed) -- resets multipliers
  function commitValueObject(P, vObj, announce) {
    P.vObj = vObj;
    P.doMultiplierReset();
    detectAndUpdate(P, announce);
  }
  // From typed field entry -- resets multipliers
  function commitNumber(P, x, announce) {
    if (typeof x !== "number" || isNaN(x) || !isFinite(x)) { render(); return; }
    P.vObj = P.logic.valueObjectFromValue(x);
    P.doMultiplierReset();
    detectAndUpdate(P, announce);
  }
  // Select a labelled object (marker click, detection, or reset)
  function selectSpecial(P, i, announce) {
    var sp = P.specials[i];
    P.vObj = P.logic.valueObjectFromValue(sp.v);
    P.doMultiplierReset();
    P.selected = i;
    storeEnabled = true;
    render();
    if (announce) announceParam(P);
  }
  // Multiplier button (onMultiplierButtonPressed) -- does NOT reset multipliers
  function pressMultiplier(P, power, increment) {
    var o2 = P.m2c, o3 = P.m3c;
    if (power === 2) P.m2c += increment;
    else P.m3c += increment;
    var cand = Math.pow(3, P.m3c) * Math.pow(2, P.m2c) * P.base;
    if (cand > P.logic.maxV || cand < P.logic.minV) { P.m2c = o2; P.m3c = o3; return; }
    P.fullValue = cand;
    P.vObj = P.logic.valueObjectFromValue(cand); // controller.value = cand (rounded for display/position)
    detectAndUpdate(P, true);
  }

  // onSliderDragged + onSpecialSelected: snap to a labelled value if we landed on one
  function detectAndUpdate(P, announce) {
    var match = -1;
    for (var i = 0; i < P.specials.length; i++) {
      var v = P.specials[i].v;
      if (Math.abs(v - P.vObj.value) < Math.min(v, P.vObj.value) * 1e-8) { match = i; break; }
    }
    storeEnabled = true;
    if (match >= 0) {
      selectSpecial(P, match, announce);
    } else {
      P.selected = -1;
      render();
      if (announce) announceParam(P);
    }
  }

  /* ------------------------------------------------------------------ *
   * Physics + formula strings (Grav Calc.update)
   * ------------------------------------------------------------------ */
  function computeCurrent() {
    var m1 = params.m1.fullValue, m2 = params.m2.fullValue, r = params.r.fullValue;
    var F = G * m1 * m2 / (r * r);   // F = G M1 M2 / R^2
    var a1 = F / m1;                 // a1 = F / M1
    var a2 = F / m2;                 // a2 = F / M2

    var gL   = sciLatex(G) + "\\,\\mathrm{m^{3}\\,kg^{-1}\\,s^{-2}}";
    var m1L  = valueLatexWithUnit(params.m1);
    var m2L  = valueLatexWithUnit(params.m2);
    var rL   = valueLatexWithUnit(params.r);
    var fSig = sciLatex(F);

    // F_21 = F_12 = G M1 M2 / R^2 = (G)(M1)(M2) / (R)^2 = F kg m s^-2 = F N
    // Laid out over several lines (aligned at the = sign) so it never needs
    // horizontal scrolling.
    var forceLatex =
      "\\begin{aligned}" +
      "F_{21} = F_{12} &= \\dfrac{G\\,M_1 M_2}{R^{2}} \\\\[4pt]" +
      "&= \\dfrac{(" + gL + ")\\,(" + m1L + ")\\,(" + m2L + ")}{(" + rL + ")^{2}} \\\\[4pt]" +
      "&= " + fSig + "\\ \\mathrm{kg\\,m\\,s^{-2}} \\;=\\; " + fSig + "\\ \\mathrm{N}" +
      "\\end{aligned}";

    // a1 = F/M1 = ... ,  a2 = F/M2 = ...   (one line each)
    var accelLatex =
      "\\begin{aligned}" +
      "a_1 &= \\dfrac{F}{M_1} = " + sciLatex(a1) + "\\ \\mathrm{m\\,s^{-2}} \\\\[4pt]" +
      "a_2 &= \\dfrac{F}{M_2} = " + sciLatex(a2) + "\\ \\mathrm{m\\,s^{-2}}" +
      "\\end{aligned}";

    current = {
      F: F, a1: a1, a2: a2,
      forceLatex: forceLatex,
      accelLatex: accelLatex,
      forceSpoken: "Gravitational force F equals " + sciSpoken(F) + " newtons.",
      accelSpoken: "Acceleration of mass 1 is " + sciSpoken(a1) +
                   " meters per second squared. Acceleration of mass 2 is " +
                   sciSpoken(a2) + " meters per second squared.",
      // cell latex for the memory table (with units)
      cell: {
        m1: valueLatexWithUnit(params.m1),
        m2: valueLatexWithUnit(params.m2),
        r:  valueLatexWithUnit(params.r),
        f:  sciLatex(F) + "\\ \\mathrm{N}",
        a1: sciLatex(a1) + "\\ \\mathrm{m\\,s^{-2}}",
        a2: sciLatex(a2) + "\\ \\mathrm{m\\,s^{-2}}"
      }
    };
  }

  // Displayed slider value (uses the rounded value object, like SciNot updateSynchronization)
  function valueLatex(P) {
    var sig = asToFixed(P.vObj.sig / Math.pow(10, DIGITS - 1), DIGITS - 1); // sig/100 -> 2 dp
    var mag = P.vObj.mag;
    return (mag !== 0) ? (sig + "\\times 10^{" + mag + "}") : sig;
  }
  function valueLatexWithUnit(P) {
    var u = (P.unit === "kg") ? "\\mathrm{kg}" : "\\mathrm{m}";
    return valueLatex(P) + "\\ " + u;
  }
  // Editable-field string, e-notation (SciNot valueField when focused)
  function valueEditString(P) {
    var sig = asToFixed(P.vObj.sig / Math.pow(10, DIGITS - 1), DIGITS - 1);
    var mag = P.vObj.mag;
    return (mag !== 0) ? (sig + "e" + mag) : sig;
  }
  // Spoken slider value (with quantity name + unit words)
  function valueSpoken(P) {
    var s = P.name + ", ";
    if (P.selected >= 0) s += P.specials[P.selected].text + ", ";
    s += sciSpoken(P.vObj.value) + " " + UNIT_WORD[P.unit];
    return s;
  }

  /* ------------------------------------------------------------------ *
   * DOM construction
   * ------------------------------------------------------------------ */
  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function buildParamDom(P) {
    var fs = el("fieldset", "control-fieldset param");
    fs.id = "fs-" + P.key;
    var legend = el("legend", "control-fieldset__legend");
    var legendMath = el("span", "mjx");
    legend.appendChild(legendMath);
    fs.appendChild(legend);
    P.dom.legendMath = legendMath;

    var body = el("div", "param__body");
    // Left column: value on top, multiplier buttons stacked directly below it.
    var left = el("div", "param__left");

    // ---- value row: symbol =  [edit button / input]  unit ----
    var vrow = el("div", "param__valuerow");
    var symEq = el("span", "param__sym mjx");
    var valBtn = el("button", "param__value", { type: "button" });
    var valSpan = el("span", "mjx");
    valBtn.appendChild(valSpan);
    var valInput = el("input", "param__input", {
      type: "text", inputmode: "text", autocomplete: "off", spellcheck: "false",
      "aria-label": P.name + " value in " + UNIT_WORD[P.unit] +
        " (scientific e notation, for example 1.02e-1)"
    });
    valInput.hidden = true;
    var unit = el("span", "param__unit mjx", { "aria-hidden": "true" });
    vrow.appendChild(symEq);
    vrow.appendChild(valBtn);
    vrow.appendChild(valInput);
    vrow.appendChild(unit);
    left.appendChild(vrow);
    P.dom.symEq = symEq; P.dom.valBtn = valBtn; P.dom.valSpan = valSpan;
    P.dom.valInput = valInput; P.dom.unit = unit;

    // ---- multiplier buttons ----
    var mrow = el("div", "param__mults", { role: "group",
      "aria-label": "Multiply " + P.name + " by a factor" });
    var mdefs = [
      { latex: "\\times\\tfrac{1}{3}", word: "one third", power: 3, inc: -1, ref: "third" },
      { latex: "\\times\\tfrac{1}{2}", word: "one half",  power: 2, inc: -1, ref: "half" },
      { latex: "\\times 2",            word: "2",          power: 2, inc: 1,  ref: "two" },
      { latex: "\\times 3",            word: "3",          power: 3, inc: 1,  ref: "three" }
    ];
    P.dom.mult = {};
    mdefs.forEach(function (d) {
      var b = el("button", "mult-btn", { type: "button",
        "aria-label": "Multiply " + P.name + " by " + d.word });
      var span = el("span", "mjx");
      b.appendChild(span);
      b.addEventListener("click", function () { pressMultiplier(P, d.power, d.inc); });
      mrow.appendChild(b);
      P.dom.mult[d.ref] = { btn: b, span: span, latex: d.latex };
    });
    left.appendChild(mrow);
    body.appendChild(left);

    // ---- slider ----
    var sl = buildSlider(P);
    body.appendChild(sl);
    fs.appendChild(body);

    // events for value edit
    valBtn.addEventListener("click", function () { startEdit(P); });
    valInput.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); commitEdit(P); }
      else if (ev.key === "Escape") { ev.preventDefault(); cancelEdit(P); }
    });
    valInput.addEventListener("blur", function () { if (!P.dom.valInput.hidden) commitEdit(P); });

    return fs;
  }

  function buildSlider(P) {
    var wrap = el("div", "pslider");

    // Vertical connector lines from each labelled object down to the bar
    // (the AS specialLinesMC). Drawn behind the icons.
    var lines = el("div", "pslider__lines", { "aria-hidden": "true" });
    P.dom.lines = [];
    P.specials.forEach(function (sp, i) {
      var u = Math.max(0, Math.min(1, P.logic.paramFromValue(sp.v)));
      var ln = el("div", "pline pline--row" + sp.row);
      // Same xShift as the icon so the line and its image share one centre line.
      ln.style.left = "calc(" + (u * 100) + "% + " + sp.xShift + "px)";
      lines.appendChild(ln);
      P.dom.lines.push(ln);
    });

    // labelled-object quick-select buttons (Special Buttons)
    var markers = el("div", "pslider__markers");
    P.dom.markers = [];
    P.specials.forEach(function (sp, i) {
      var mb = el("button", "marker marker--row" + sp.row, { type: "button",
        title: sp.text,
        "aria-label": sp.text + ", " + sciSpoken(sp.v) + " " + UNIT_WORD[sp.unit] });
      var g = el("img", "marker__icon marker__icon--grey",
        { src: "assets/icons/" + sp.icon + "-grey.png", alt: "", "aria-hidden": "true" });
      var c = el("img", "marker__icon marker__icon--color",
        { src: "assets/icons/" + sp.icon + "-color.png", alt: "", "aria-hidden": "true" });
      mb.appendChild(g); mb.appendChild(c);
      mb.addEventListener("click", function () { selectSpecial(P, i, true); });
      markers.appendChild(mb);
      P.dom.markers.push(mb);
    });

    var track = el("div", "pslider__track");
    var fill = el("div", "pslider__fill", { "aria-hidden": "true" });
    var thumb = el("div", "pslider__thumb", {
      role: "slider", tabindex: "0",
      "aria-label": P.name,
      "aria-valuemin": "0",
      "aria-valuemax": String(P.logic.totalTicks),
      "aria-valuenow": "0", "aria-valuetext": ""
    });
    var flabel = el("div", "pslider__flabel", { "aria-hidden": "true" });
    var bar = el("div", "pslider__bar", { "aria-hidden": "true" });
    track.appendChild(lines);   // connector lines: behind the bar
    track.appendChild(bar);     // the bar itself: in front of the lines
    track.appendChild(fill);
    track.appendChild(markers);
    track.appendChild(thumb);
    track.appendChild(flabel);
    wrap.appendChild(track);

    P.dom.track = track; P.dom.thumb = thumb; P.dom.fill = fill; P.dom.flabel = flabel;

    wireSliderInput(P);
    return wrap;
  }

  /* ------------------------------------------------------------------ *
   * Slider interaction: pointer drag + full keyboard, mapped in original
   * stage-independent normalised parameter space.
   * ------------------------------------------------------------------ */
  function uFromClientX(P, clientX) {
    var r = P.dom.track.getBoundingClientRect();
    if (r.width <= 0) return 0;
    var u = (clientX - r.left) / r.width;
    return Math.max(0, Math.min(1, u));
  }
  function valueObjAtU(P, u) {
    return P.logic.valueObjectFromValue(P.logic.valueFromParam(u));
  }

  function wireSliderInput(P) {
    var thumb = P.dom.thumb, track = P.dom.track;

    // ---- keyboard (arrows = 1 sig tick; Page = 1 decade; Home/End = min/max) ----
    thumb.addEventListener("keydown", function (ev) {
      var lg = P.logic, cur = P.vObj, next = null;
      switch (ev.key) {
        case "ArrowRight": case "ArrowUp":
          next = lg.getIncrementedValueObject(cur, 1); break;
        case "ArrowLeft": case "ArrowDown":
          next = lg.getIncrementedValueObject(cur, -1); break;
        case "PageUp":
          next = lg.getIncrementedValueObject(cur, lg.ticksPerMag); break;
        case "PageDown":
          next = lg.getIncrementedValueObject(cur, -lg.ticksPerMag); break;
        case "Home":
          next = lg.valueObjectFromValue(lg.minV); break;
        case "End":
          next = lg.valueObjectFromValue(lg.maxV); break;
        default: return; // let Tab and everything else pass through
      }
      ev.preventDefault();
      if (next && next.value !== cur.value) commitValueObject(P, next, true);
      else render(); // still refresh (e.g. at an endpoint) but no flood
    });

    // ---- pointer drag on the thumb ----
    var dragging = false;
    thumb.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      thumb.focus();
      dragging = true;
      try { thumb.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    thumb.addEventListener("pointermove", function (ev) {
      if (!dragging) return;
      var vObj = valueObjAtU(P, uFromClientX(P, ev.clientX));
      if (vObj.value !== P.vObj.value) commitValueObject(P, vObj, false);
    });
    function endDrag(ev) {
      if (!dragging) return;
      dragging = false;
      try { thumb.releasePointerCapture(ev.pointerId); } catch (e) {}
      announceParam(P);
    }
    thumb.addEventListener("pointerup", endDrag);
    thumb.addEventListener("pointercancel", endDrag);

    // ---- press on the track: step toward the pointer, with press-hold repeat ----
    var holdTimer = null, holdStart = 0, holdLast = 0, holdRAF = null;
    function stepTowardClientX(clientX) {
      var targetObj = valueObjAtU(P, uFromClientX(P, clientX));
      if (targetObj.value < P.vObj.value) {
        var d = P.logic.getIncrementedValueObject(P.vObj, -1);
        if (d.value >= targetObj.value) commitValueObject(P, d, false);
      } else if (targetObj.value > P.vObj.value) {
        var u = P.logic.getIncrementedValueObject(P.vObj, 1);
        if (u.value <= targetObj.value) commitValueObject(P, u, false);
      }
    }
    // continuous phase (onEnterFrameFunc): rate 0.05 ticks/ms toward pointer after 500ms delay
    function continuous(clientX) {
      var now = performance.now();
      if (now > holdStart + 500) {
        var ticks = 0.05 * (now - holdLast);
        var targetObj = valueObjAtU(P, uFromClientX(P, clientX));
        var cur = P.vObj, out;
        if (targetObj.value < cur.value) {
          out = P.logic.getIncrementedValueObject(cur, -ticks);
          out = (out.value <= targetObj.value) ? targetObj : out;
          if (out.value !== cur.value) commitValueObject(P, out, false);
        } else if (targetObj.value > cur.value) {
          out = P.logic.getIncrementedValueObject(cur, ticks);
          out = (out.value >= targetObj.value) ? targetObj : out;
          if (out.value !== cur.value) commitValueObject(P, out, false);
        }
      }
      holdLast = now;
    }
    track.addEventListener("pointerdown", function (ev) {
      if (ev.target === thumb || (ev.target.closest && ev.target.closest(".marker"))) return;
      ev.preventDefault();
      thumb.focus();
      holdStart = holdLast = performance.now();
      stepTowardClientX(ev.clientX);
      try { track.setPointerCapture(ev.pointerId); } catch (e) {}
      var lastX = ev.clientX;
      track.__moveHandler = function (e2) { lastX = e2.clientX; };
      track.addEventListener("pointermove", track.__moveHandler);
      function tick() { continuous(lastX); holdRAF = requestAnimationFrame(tick); }
      holdRAF = requestAnimationFrame(tick);
      function stop(e3) {
        if (holdRAF) cancelAnimationFrame(holdRAF);
        holdRAF = null;
        track.removeEventListener("pointermove", track.__moveHandler);
        try { track.releasePointerCapture(e3.pointerId); } catch (e) {}
        track.removeEventListener("pointerup", stop);
        track.removeEventListener("pointercancel", stop);
        announceParam(P);
      }
      track.addEventListener("pointerup", stop);
      track.addEventListener("pointercancel", stop);
    });
  }

  /* ------------------------------------------------------------------ *
   * Value field edit (display button <-> input swap)
   * ------------------------------------------------------------------ */
  function startEdit(P) {
    P.dom.valBtn.hidden = true;
    P.dom.valInput.hidden = false;
    P.dom.valInput.value = valueEditString(P);
    P.dom.valInput.focus();
    P.dom.valInput.select();
  }
  function commitEdit(P) {
    var x = parseFloat(P.dom.valInput.value);
    P.dom.valInput.hidden = true;
    P.dom.valBtn.hidden = false;
    if (!isNaN(x) && isFinite(x)) commitNumber(P, x, true);
    else render();
    P.dom.valBtn.focus();
  }
  function cancelEdit(P) {
    P.dom.valInput.hidden = true;
    P.dom.valBtn.hidden = false;
    render();
    P.dom.valBtn.focus();
  }

  /* ------------------------------------------------------------------ *
   * Memory table (Stored Values Table.as)
   * ------------------------------------------------------------------ */
  var ROWS = [
    { key: "m1", label: "M_1" },
    { key: "m2", label: "M_2" },
    { key: "r",  label: "R" },
    { key: "f",  label: "F" },
    { key: "a1", label: "a_1" },
    { key: "a2", label: "a_2" }
  ];

  function storeCurrent() {
    memory.stored[memory.numColumns] = {
      label: "stored values #" + memory.setNumber,
      cells: {
        m1: current.cell.m1, m2: current.cell.m2, r: current.cell.r,
        f: current.cell.f, a1: current.cell.a1, a2: current.cell.a2
      }
    };
    memory.numColumns = (memory.numColumns + 1) % 3;
    memory.setNumber += 1;
    storeEnabled = false; // onStore disables until next change
    render();
    announce("Values stored.");
  }
  function clearMemory() {
    memory.stored = [null, null, null];
    memory.numColumns = 0;
    memory.setNumber = 1;
    storeEnabled = true;
    render();
    announce("Memory cleared.");
  }
  function toggleShow(force) {
    memory.show = (typeof force === "boolean") ? force : !memory.show;
    render();
  }

  function renderTable() {
    var table = document.getElementById("stored-table");
    var wrap = document.getElementById("stored-table-wrap");
    wrap.hidden = !memory.show;
    document.getElementById("btn-show").textContent = memory.show ? "hide" : "show";
    document.getElementById("btn-show").setAttribute("aria-expanded", memory.show ? "true" : "false");
    if (!memory.show) return;

    // columns: filled stored slots (in slot order) then "current values"
    var cols = [];
    for (var s = 0; s < 3; s++) if (memory.stored[s]) cols.push(memory.stored[s]);

    // header
    var thead = table.tHead || table.createTHead();
    thead.textContent = "";
    var hr = el("tr");
    hr.appendChild(el("th", null, { scope: "col" })).appendChild(srSpan("Quantity"));
    cols.forEach(function (c) {
      var th = el("th", null, { scope: "col" });
      th.textContent = c.label;
      hr.appendChild(th);
    });
    var thc = el("th", null, { scope: "col" });
    thc.textContent = "current values";
    hr.appendChild(thc);
    thead.appendChild(hr);

    // body
    var body = document.getElementById("stored-body");
    body.textContent = "";
    ROWS.forEach(function (row) {
      var tr = el("tr");
      var th = el("th", null, { scope: "row" });
      var lm = el("span", "mjx");
      th.appendChild(lm);
      renderMath(lm, row.label, false);
      tr.appendChild(th);
      cols.forEach(function (c) {
        var td = el("td");
        var m = el("span", "mjx");
        td.appendChild(m);
        renderMath(m, c.cells[row.key], false);
        tr.appendChild(td);
      });
      var tdc = el("td", "current-col");
      var mc = el("span", "mjx");
      tdc.appendChild(mc);
      renderMath(mc, current.cell[row.key], false);
      tr.appendChild(tdc);
      body.appendChild(tr);
    });
  }
  function srSpan(t) { var s = el("span", "sr-only"); s.textContent = t; return s; }

  /* ------------------------------------------------------------------ *
   * Live-region announcements
   * ------------------------------------------------------------------ */
  var srStatus;
  function announce(msg) {
    if (!srStatus) srStatus = document.getElementById("sr-status");
    srStatus.textContent = "";
    // force re-announce even if text repeats
    window.setTimeout(function () { srStatus.textContent = msg; }, 30);
  }
  function announceParam(P) {
    announce(valueSpoken(P) + ". " +
      "Force " + sciSpoken(current.F) + " newtons.");
  }

  /* ------------------------------------------------------------------ *
   * Single render():  state -> canvas/DOM/live-region (one source of truth)
   * ------------------------------------------------------------------ */
  var renderScheduled = false, _raf = 0, _to = 0;
  function cancelRender() {
    renderScheduled = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = 0; }
    if (_to) { clearTimeout(_to); _to = 0; }
  }
  function render(sync) {
    if (sync) { cancelRender(); doRender(); return; }
    if (renderScheduled) return;
    renderScheduled = true;
    // Coalesce rapid updates to one frame, but fall back to a timer so we still
    // render if requestAnimationFrame is throttled (e.g. a backgrounded tab).
    var run = function () { cancelRender(); doRender(); };
    _raf = requestAnimationFrame(run);
    _to = setTimeout(run, 32);
  }

  function doRender() {
    computeCurrent();

    // ---- formula equations via foundation helper (rule 8) ----
    if (mathReady && window.klunlShowEquation) {
      window.klunlShowEquation(
        ["eqn-force", "\\[" + current.forceLatex + "\\]"],
        ["sr-eqn-force", current.forceSpoken]
      );
      window.klunlShowEquation(
        ["eqn-accel", "\\[" + current.accelLatex + "\\]"],
        ["sr-eqn-accel", current.accelSpoken]
      );
    } else {
      document.getElementById("sr-eqn-force").textContent = current.forceSpoken;
      document.getElementById("sr-eqn-accel").textContent = current.accelSpoken;
    }
    scheduleFitEquations();

    // ---- parameters ----
    paramOrder.forEach(function (k) {
      var P = params[k];
      var d = P.dom;
      renderMath(d.legendMath, P.symbol + "\\quad\\text{(" + P.name + ")}", false);
      renderMath(d.symEq, P.symbol + " =", false);
      renderMath(d.unit, "\\mathrm{" + P.unit + "}", false);

      // value display button
      renderMath(d.valSpan, valueLatex(P), false);
      d.valBtn.setAttribute("aria-label",
        "Edit " + P.name + " value, currently " + sciSpoken(P.vObj.value) + " " + UNIT_WORD[P.unit] +
        (P.selected >= 0 ? " (" + P.specials[P.selected].text + ")" : ""));

      // multiplier button labels + enabled states (SciNot updateSynchronization)
      for (var ref in d.mult) renderMath(d.mult[ref].span, d.mult[ref].latex, false);
      var t2 = Math.pow(3, P.m3c) * Math.pow(2, P.m2c + 1) * P.base;
      var t3 = Math.pow(3, P.m3c + 1) * Math.pow(2, P.m2c) * P.base;
      var h2 = Math.pow(3, P.m3c) * Math.pow(2, P.m2c - 1) * P.base;
      var h3 = Math.pow(3, P.m3c - 1) * Math.pow(2, P.m2c) * P.base;
      setDisabled(d.mult.two.btn,   !(t2 <= P.logic.maxV));
      setDisabled(d.mult.three.btn, !(t3 <= P.logic.maxV));
      setDisabled(d.mult.half.btn,  !(h2 >= P.logic.minV));
      setDisabled(d.mult.third.btn, !(h3 >= P.logic.minV));

      // slider thumb position + aria
      var u = P.logic.paramFromValue(P.vObj.value);
      u = Math.max(0, Math.min(1, u));
      d.thumb.style.left = (u * 100) + "%";
      d.fill.style.width = (u * 100) + "%";
      d.thumb.setAttribute("aria-valuenow", String(P.logic.tickIndex(P.vObj)));
      d.thumb.setAttribute("aria-valuetext", valueSpoken(P));

      // markers: position + selected state + floating label
      P.dom.markers.forEach(function (mb, i) {
        var sp = P.specials[i];
        var mu = P.logic.paramFromValue(sp.v);
        mu = Math.max(0, Math.min(1, mu));
        // Nudge the icon by the source xShift so neighbouring icons don't collide;
        // the connector line is shifted by the same amount (built in buildSlider)
        // so the icon and its line stay centre-aligned.
        mb.style.left = "calc(" + (mu * 100) + "% + " + sp.xShift + "px)";
        var sel = (i === P.selected);
        mb.classList.toggle("marker--selected", sel);
        mb.setAttribute("aria-pressed", sel ? "true" : "false");
        if (P.dom.lines[i]) P.dom.lines[i].classList.toggle("pline--selected", sel);
      });
      if (P.selected >= 0) {
        d.flabel.textContent = P.specials[P.selected].text;
        d.flabel.style.left = (u * 100) + "%";
        d.flabel.hidden = false;
      } else {
        d.flabel.hidden = true;
      }
    });

    // ---- memory buttons + table ----
    setDisabled(document.getElementById("btn-store"), !storeEnabled);
    renderTable();
  }

  function setDisabled(btn, dis) {
    if (!btn) return;
    btn.disabled = !!dis;
  }

  /* ------------------------------------------------------------------ *
   * Reset (Grav Calc.reset, driven by the masthead "sim-reset" event)
   * ------------------------------------------------------------------ */
  function resetSim() {
    memory.stored = [null, null, null];
    memory.numColumns = 0;
    memory.setNumber = 1;
    memory.show = false;
    storeEnabled = true;
    // Order matches the AS: R, then M1, then M2
    var r = params.r;  r.vObj = r.logic.valueObjectFromValue(r.specials[RESET_INDEX.r].v);  r.doMultiplierReset(); r.selected = RESET_INDEX.r;
    var a = params.m1; a.vObj = a.logic.valueObjectFromValue(a.specials[RESET_INDEX.m1].v); a.doMultiplierReset(); a.selected = RESET_INDEX.m1;
    var b = params.m2; b.vObj = b.logic.valueObjectFromValue(b.specials[RESET_INDEX.m2].v); b.doMultiplierReset(); b.selected = RESET_INDEX.m2;
    render(true);
  }

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */
  function init() {
    var container = document.getElementById("params-container");
    paramOrder.forEach(function (k) { container.appendChild(buildParamDom(params[k])); });

    document.getElementById("btn-store").addEventListener("click", function () {
      if (!storeEnabled) return;
      storeCurrent();
    });
    document.getElementById("btn-show").addEventListener("click", function () { toggleShow(); });
    document.getElementById("btn-clear").addEventListener("click", function () { clearMemory(); });

    // masthead Reset -> exact initial state
    document.addEventListener("sim-reset", resetSim);

    resetSim();
  }

  // Wait for MathJax to be fully started, then (re)typeset everything.
  // Uses startup.promise so it is robust to script load order.
  function hookMathJax() {
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
      window.MathJax.startup.promise.then(function () {
        mathReady = true;
        render(true);
      });
    } else {
      // MathJax not present yet; retry shortly
      window.setTimeout(hookMathJax, 100);
    }
  }
  // Also honour the foundation's own hooks if they fire.
  window.klunlOnMathJaxReady = function () { mathReady = true; render(true); };
  window.klunlInitEqn = function () { render(true); };

  // Watch for any MathJax container the async equation typesetter inserts and take
  // it out of the tab order too.
  function startMjxTabObserver() {
    if (!window.MutationObserver) return;
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1) stripMjxTab(added[j]);
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function boot() {
    init();
    startMjxTabObserver();
    hookMathJax();
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { render(true); scheduleFitEquations(); }, 150);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
