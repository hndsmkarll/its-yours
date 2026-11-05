/* ============================================================
   Cherry blossom tree: grows, then blossoms bloom.
   Exposes window.Tree = { grow(onDone), prepare(), dim(), hide() }
   ============================================================ */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TIME = reduced ? 0.25 : 1;
  const scene = document.getElementById("treeScene");
  const bg = document.getElementById("bg");
  const svg = document.getElementById("treeSvg");
  let started = false;
  let prepared = false;
  let glowEl = null;
  let revealAtMs = 0;

  let seed = 20260;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const between = (a, b) => a + rnd() * (b - a);

  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(e);
    return e;
  };

  const BARK = ["#5b3445", "#5b3445", "#6a3d50", "#7a4859"];
  const PINKS = ["#fff4f8", "#ffe1ee", "#ffcce1", "#ffb7d5", "#ff9fc8", "#ffd9ea"];
  const MAX_DEPTH = 6;
  const BASE_X = 400, BASE_Y = 765;

  const tips = [];
  let growEnd = 0;

  function branch(x, y, ang, len, w, depth, t, group) {
    const rad = (ang * Math.PI) / 180;
    const x2 = x + Math.sin(rad) * len;
    const y2 = y - Math.cos(rad) * len;
    const bend = (rnd() - 0.5) * len * 0.4;
    const cx = (x + x2) / 2 + Math.cos(rad) * bend;
    const cy = (y + y2) / 2 + Math.sin(rad) * bend;

    const p = el("path", {
      d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      fill: "none",
      stroke: BARK[Math.floor(rnd() * BARK.length)],
      "stroke-width": w.toFixed(1),
      "stroke-linecap": "round",
      pathLength: 1,
      "stroke-dasharray": 1,
      "stroke-dashoffset": 1
    }, group);

    const dur = (depth === 0 ? 1700 : 560 - depth * 45 + rnd() * 110) * TIME;
    p.style.animation = `tree-grow ${dur.toFixed(0)}ms ease-out ${t.toFixed(0)}ms forwards`;
    const end = t + dur;
    growEnd = Math.max(growEnd, end);

    if (depth >= 3) tips.push({ x: x2, y: y2, depth, end });
    if (depth >= 4 && rnd() < 0.5) {
      const m = 0.45 + rnd() * 0.3;
      tips.push({ x: x + (x2 - x) * m + between(-6, 6), y: y + (y2 - y) * m + between(-6, 6), depth: depth - 1, end: t + dur * m });
    }
    if (depth >= MAX_DEPTH) return;

    const kids = depth === 0 ? 3 : depth < 3 ? 2 : rnd() < 0.2 ? 3 : 2;
    const spread = depth < 3 ? between(26, 40) : between(20, 36);
    for (let i = 0; i < kids; i++) {
      const side = kids === 1 ? 0 : (i / (kids - 1)) * 2 - 1;
      const a = ang + side * spread + between(-9, 9);
      const l = len * between(0.72, 0.84);
      branch(x2, y2, a, l, Math.max(w * 0.7, 1.4), depth + 1, end - dur * 0.1, group);
    }
  }

  function flower(parent, cx, cy, r, color, delay) {
    const u = el("use", { href: "#blossom", x: (cx - r).toFixed(1), y: (cy - r).toFixed(1), width: (r * 2).toFixed(1), height: (r * 2).toFixed(1) }, parent);
    u.style.color = color;
    u.setAttribute("class", "bl");
    u.style.animationDelay = delay.toFixed(0) + "ms";
    u.style.animationDuration = (900 * TIME).toFixed(0) + "ms";
  }

  function puff(parent, cx, cy, r, color, delay) {
    const c = el("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: r.toFixed(1), fill: color, class: "bl puff" }, parent);
    c.style.animationDelay = delay.toFixed(0) + "ms";
    c.style.animationDuration = (800 * TIME).toFixed(0) + "ms";
  }

  function build() {
    svg.innerHTML = "";

    const ground = el("g", {});
    el("ellipse", { cx: 400, cy: 780, rx: 330, ry: 38, fill: "#f9b4cf" }, ground);
    el("ellipse", { cx: 400, cy: 776, rx: 250, ry: 24, fill: "#ffc9de" }, ground);
    ground.setAttribute("class", "ground-grow");

    const glow = el("circle", { cx: 400, cy: 330, r: 330, fill: "url(#crownGlow)", class: "crown-glow" });

    const defs = el("defs", {}, svg);
    svg.insertBefore(defs, svg.firstChild);
    const sym = el("symbol", { id: "blossom", viewBox: "-10 -10 20 20", overflow: "visible" }, defs);
    for (let i = 0; i < 5; i++) {
      el("ellipse", { cx: 0, cy: -5.6, rx: 4.6, ry: 5.8, fill: "currentColor", transform: `rotate(${i * 72})`, opacity: 0.96 }, sym);
    }
    el("circle", { r: 2, fill: "#ff7fae" }, sym);
    const rg = el("radialGradient", { id: "crownGlow" }, defs);
    el("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": 0.75 }, rg);
    el("stop", { offset: "0.55", "stop-color": "#ffc0da", "stop-opacity": 0.35 }, rg);
    el("stop", { offset: "1", "stop-color": "#ffc0da", "stop-opacity": 0 }, rg);

    const wood = el("g", {});
    branch(BASE_X, BASE_Y, 0, 150, 24, 0, 300 * TIME, wood);

    const bloomStart = Math.max(growEnd * 0.62, 0);
    const blooms = el("g", {});
    tips.sort((a, b) => a.end - b.end);
    tips.forEach((tp) => {
      const base = Math.max(tp.end, bloomStart) + rnd() * 2200 * TIME;
      const size = 10 + (tp.depth - 3) * 1.2;
      const n = 2 + Math.floor(rnd() * 2);
      for (let i = 0; i < n; i++) {
        const ox = between(-24, 24), oy = between(-22, 20);
        const r = size * between(0.7, 1.2);
        const delay = base + i * 90;
        const col = PINKS[Math.floor(rnd() * PINKS.length)];
        if (rnd() < 0.5) flower(blooms, tp.x + ox, tp.y + oy, r * 1.25, col, delay);
        else puff(blooms, tp.x + ox, tp.y + oy, r, col, delay);
      }
    });

    glow.style.transition = `opacity ${2400 * TIME}ms ease ${bloomStart}ms`;
    glowEl = glow;

    for (let i = 0; i < 26; i++) {
      const e = el("ellipse", {
        cx: between(110, 690), cy: between(768, 792), rx: between(4, 8), ry: between(2.5, 4.5),
        fill: PINKS[Math.floor(rnd() * 4) + 1], opacity: 0.9,
        transform: `rotate(${(rnd() * 60 - 30).toFixed(0)} 400 780)`
      });
      e.setAttribute("class", "fallen");
      e.style.animationDelay = (bloomStart + rnd() * 3000).toFixed(0) + "ms";
    }

    return { bloomStart };
  }

  function decorate(bloomStart) {
    // Target the permanent background container
    const st = bg.querySelector(".stars");
    for (let i = 0; i < 96; i++) {
      const s = document.createElement("span");
      const size = between(1, 2.6);
      s.style.width = s.style.height = size.toFixed(1) + "px";
      s.style.left = between(0, 100) + "%";
      s.style.top = between(0, 76) + "%";
      s.style.setProperty("--d", between(2.6, 6.5) + "s");
      s.style.animationDelay = between(0, 6) + "s";
      st.appendChild(s);
    }
    
    const tw = bg.querySelector(".twinkles");
    for (let i = 0; i < 22; i++) {
      const s = document.createElement("span");
      s.textContent = i % 3 === 0 ? "✦" : "✧";
      s.style.left = between(3, 97) + "%";
      s.style.top = between(3, 55) + "%";
      s.style.fontSize = between(10, 22) + "px";
      s.style.animationDelay = between(0, 3.2) + "s";
      s.style.animationDuration = between(2.4, 4.6) + "s";
      tw.appendChild(s);
    }
    
    const bk = bg.querySelector(".bokeh");
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span");
      const size = between(18, 60);
      s.style.width = s.style.height = size + "px";
      s.style.left = between(0, 96) + "%";
      s.style.animationDuration = between(16, 30) + "s";
      s.style.animationDelay = -between(0, 20) + "s";
      s.style.opacity = between(0.3, 0.7);
      bk.appendChild(s);
    }
    
    // Petals and hearts remain inside the tree scene
    const pt = scene.querySelector(".petals");
    for (let i = 0; i < 38; i++) {
      const s = document.createElement("i");
      s.style.setProperty("--x", between(0, 98) + "%");
      s.style.setProperty("--s", between(9, 18) + "px");
      s.style.setProperty("--d", between(7, 13) + "s");
      s.style.setProperty("--delay", (bloomStart / 1000 + between(0, 8)) + "s");
      pt.appendChild(s);
    }
    
    const ht = scene.querySelector(".hearts");
    const icons = ["💗", "💕", "💖", "🌸"];
    for (let i = 0; i < 9; i++) {
      const s = document.createElement("span");
      s.textContent = icons[i % icons.length];
      s.style.setProperty("--x", between(4, 94) + "%");
      s.style.setProperty("--s", between(14, 26) + "px");
      s.style.setProperty("--d", between(9, 15) + "s");
      s.style.setProperty("--delay", (bloomStart / 1000 + between(0, 9)) + "s");
      ht.appendChild(s);
    }
    
    const cl = bg.querySelector(".clouds");
    for (let i = 0; i < 5; i++) {
      const s = document.createElement("span");
      s.style.top = between(3, 38) + "%";
      s.style.width = between(28, 48) + "vw";
      s.style.height = between(9, 15) + "vh";
      s.style.opacity = between(0.5, 0.9);
      s.style.animationDuration = between(80, 130) + "s";
      s.style.animationDelay = -between(0, 120) + "s";
      cl.appendChild(s);
    }
    
    const sh = bg.querySelector(".shooting");
    for (let i = 0; i < 3; i++) {
      const s = document.createElement("span");
      s.style.left = between(8, 62) + "%";
      s.style.top = between(3, 24) + "%";
      s.style.setProperty("--d", between(9, 15) + "s");
      s.style.animationDelay = (bloomStart / 1000 + between(1, 9)) + "s";
      sh.appendChild(s);
    }
  }

  function prepare() {
    if (prepared) return;
    prepared = true;
    const { bloomStart } = build();
    decorate(bloomStart);
    revealAtMs = growEnd + 500 * TIME + 200;
    scene.classList.add("paused");
    scene.hidden = false;
  }

  window.Tree = {
    grow(onDone) {
      if (started) { onDone && onDone(); return; }
      started = true;
      prepare();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        scene.classList.remove("paused");
        scene.classList.add("on");
        if (glowEl) glowEl.style.opacity = 1;
      }));
      setTimeout(() => {
        scene.classList.add("shifted");
        onDone && onDone();
      }, revealAtMs);
    },
    prepare,
    dim() { if (!scene.classList.contains("gone")) scene.classList.add("dim"); },
    hide() {
      scene.classList.remove("dim");
      scene.classList.add("gone");
      setTimeout(() => (scene.hidden = true), 1100);
    }
  };

  const warm = () => (window.requestIdleCallback ? requestIdleCallback(prepare, { timeout: 2000 }) : setTimeout(prepare, 400));
  if (document.readyState === "complete") warm(); else addEventListener("load", warm);
})();