/* ==========================================================
   PARTICIPA CORE — CONNECTED DOTS OVER CASE IMAGES (11 Nov 2026)
   .design only: switched on with participa.goo: true in the site's _config.yml.
   Over every case card image (Work page and home page), Participa 8s in white at 40%, lying on the diagonal,
   fixed on a grid. From one of the four corners they grow in place across the image until they touch and fill it;
   then, from the same corner, transparent 8s open up in the same places and grow until the photo is clear.
   It moves on its own, very slowly, like a lava lamp (one cycle in about 45 s per card, each card at its own point);
   scrolling pushes the clock along (back when scrolling up), and hovering a card makes its time run 6 times faster.
   Cards off screen pause. Reduced motion: no pattern.
   Developed in preview/gooey.html (test switches ?p= and ?corner= work there and here).
   ========================================================== */
(function () {
  // Wrap each card image in a frame that holds the image and the pattern
  document.querySelectorAll(".home__case > img").forEach(function (img) {
    var frame = document.createElement("span");
    frame.className = "goo-card";
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);
  });
})();
/* Builds the dot pattern inside every .goo-card (the frame around each case image) and lets the scroll drive it.
   Units (two dots joined by a neck: the Participa 8) sit on a diagonal grid over the whole image,
   spaced so each keeps its 8 shape, each lying along the diagonal it grows on. The 8s appear one by one
   along branching threads from the corner, like mycelium, and die back from the corner along the same threads.
   Each unit has a threshold: its distance from the chosen corner. As the card moves up the screen,
   the pattern grows organically from one of the four corners (random on every visit): dense in the corner,
   smaller dots towards the front. Before it overpowers the photo, the tail clears from the corner and follows.
   Scrolling back reverses it.
   Progress: each card starts clear; the band crosses it over 2.5 card heights of scrolling. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var W = 300, H = 200, STEP_X = 34, STEP_Y = 34, GAP = 17, R = 9, FILL = 1.9, FRONT = 0.45;   // FILL: how far each 8 grows (enough to touch its neighbours)   // FRONT: a long soft front, so dots get smaller towards it (as in the first version)   // how soft the clearing tail (EDGE) and the growing front (FRONT) are, as a share of the diagonal
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var cards = [];

  document.querySelectorAll(".goo-card").forEach(function (card) {
    var corner = new URLSearchParams(location.search).get("corner") ||          // test switch: ?corner=tl
                 ["tl", "tr", "bl", "br"][Math.floor(Math.random() * 4)];   // one of the four corners, new on every visit
    var cx = corner.indexOf("r") > -1 ? W : 0, cy = corner.indexOf("b") > -1 ? H : 0;
    var maxD = Math.hypot(W, H);
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    var id = "goo-" + Math.random().toString(36).slice(2, 8);
    var colour = getComputedStyle(card).getPropertyValue("--goo").trim() || "#ffffff";
    var defs = document.createElementNS(NS, "defs");
    defs.innerHTML =
      '<filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>' +   // a soft melt: the 8s near the corner just merge with their neighbours
      '<feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 22 -10" result="shape"/>' +
      '<feFlood flood-color="' + colour + '"/><feComposite in2="shape" operator="in"/></filter>' +
      // the same melt in black, for the transparent 8s that open up in the white (used in the mask)
      '<filter id="' + id + '-h" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
      '<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>' +
      '<feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 22 -10" result="shape"/>' +
      '<feFlood flood-color="#000"/><feComposite in2="shape" operator="in"/></filter>' +
      '<mask id="' + id + '-m" maskUnits="userSpaceOnUse" x="-40" y="-40" width="' + (W + 80) + '" height="' + (H + 80) + '">' +
      '<rect x="-40" y="-40" width="' + (W + 80) + '" height="' + (H + 80) + '" fill="#fff"/>' +
      '<g filter="url(#' + id + '-h)"></g></mask>';
    svg.appendChild(defs);
    var holes = defs.querySelector("mask g");
    var outer = document.createElementNS(NS, "g");
    outer.setAttribute("mask", "url(#" + id + "-m)");
    var g = document.createElementNS(NS, "g");
    g.setAttribute("filter", "url(#" + id + ")");
    outer.appendChild(g);
    var dots = [];
    // the 8 lies along the diagonal it grows on (from the start corner towards the opposite one)
    var ax = (cx === 0 ? 1 : -1) / Math.SQRT2, ay = (cy === 0 ? 1 : -1) / Math.SQRT2;

    // The grid of 8s, as in the first version; t = distance from the start corner (0) to the opposite corner (1),
    // with a little irregularity so the front is organic.
    for (var row = -1; row * STEP_Y <= H + STEP_Y; row++) {
      // a square grid (no stagger): the diagonal neighbours sit further apart, so each 8 stays a separate shape
      for (var x = -STEP_X; x <= W + STEP_X; x += STEP_X) {
        var y = row * STEP_Y;
        var t = Math.min(1, Math.hypot(x - cx, y - cy) / maxD) + (Math.random() - 0.5) * 0.08;
        [-1, 1].forEach(function (side, i) {
          var c = document.createElementNS(NS, "circle");
          c.setAttribute("cx", (x + side * ax * GAP / 2).toFixed(1));
          c.setAttribute("cy", (y + side * ay * GAP / 2).toFixed(1));
          c.setAttribute("r", R);
          g.appendChild(c);
          var h = c.cloneNode(); h.setAttribute("fill", "#000"); holes.appendChild(h);   // its transparent twin
          dots.push({ el: c, hel: h, t: t + i * 0.01, g: 0, s: 0, hg: 0, hs: 0, px: 0, py: 0 });
        });
      }
    }
    svg.appendChild(outer); card.appendChild(svg);
    cards.push({ card: card, dots: dots, g: g });
  });

  var FORCED = new URLSearchParams(location.search).get("p"); FORCED = FORCED === null ? null : parseFloat(FORCED);
  var ticking = false;

  function draw(c, p) {
    if (FORCED !== null) p = FORCED;                     // test switch: ?p=0.5 shows a fixed stage
    p = Math.max(0, Math.min(1, p));
    c.p = p;
    // Life cycle, in place (nothing moves, the 8s only grow):
    // 1. white 8s grow where they stand, from the start corner across the image, until they touch and fill it;
    // 2. from the same corner, transparent 8s open up in the same places and grow, until the photo is clear.
    var front = -0.1 + p / 0.7 * 1.3;                              // white: across the image by p ≈ 0.7
    var hfront = p < 0.22 ? -1 : -0.1 + (p - 0.22) / 0.78 * 1.35;   // transparent: follows close behind, so the white never covers it all
    c.dots.forEach(function (d) {
      var a = (front - d.t) / FRONT, b = (hfront - d.t) / FRONT;
      var grow = a <= 0 ? 0 : a >= 1 ? 1 : a * a * (3 - 2 * a);
      var open = b <= 0 ? 0 : b >= 1 ? 1 : b * b * (3 - 2 * b);
      d.g = grow * FILL;                                         // small at the front, large enough to touch behind it
      d.hg = open * FILL * 1.15;                                 // the transparent twin grows a little larger, to clear fully
      if (FORCED !== null) { d.s = d.g; d.hs = d.hg; d.q = -1; d.hq = -1; }
    });
    c.g.style.opacity = "0.4";                           // white at 40%
  }

  // Each dot eases towards its target, so growth and clearing lag a little, like something living.
  function ease_dots() {
    cards.forEach(function (c) {
      if (!c.visible && FORCED === null) return;
      c.dots.forEach(function (d) {
        var diff = d.g - d.s;
        if (Math.abs(diff) > 0.004) d.s += diff * 0.06; else d.s = d.g;
        var hd = d.hg - d.hs;
        if (Math.abs(hd) > 0.004) d.hs += hd * 0.06; else d.hs = d.hg;
        var hq = Math.round(d.hs * 100) / 100;
        if (hq !== d.hq) { d.hq = hq; d.hel.style.transform = "scale(" + hq + ")"; }
        var q = Math.round(d.s * 100) / 100;
        if (q !== d.q) {
          d.q = q;
          d.el.style.transform = "scale(" + q + ")";
        }
      });
    });
  }

  // ---------- The clock: a slow lava lamp that the scroll and the pointer push along ----------
  // Every card runs its own cycle (fill with white 8s, then open with transparent 8s) over CYCLE seconds, starting at a random point,
  // so the cards never move in step. Scrolling adds to the clock: four card heights of scrolling
  // make one full cycle (back when scrolling up). Hovering a card makes its time run 6 times faster.
  // When a cycle ends the image is clean; the next one grows from another corner (the pattern is mirrored).
  var CYCLE = 45;                                                    // seconds for one cycle on its own
  var hoverable = window.matchMedia("(hover: hover)").matches;
  var lastSy = window.scrollY, lastT = performance.now();

  cards.forEach(function (c) {
    c.clock = Math.random() * CYCLE;
    c.speed = 1; c.target = 1; c.round = Math.floor(c.clock / CYCLE);
    c.visible = true;
    c.svg = c.card.querySelector("svg");
    if (hoverable) {
      var link = c.card.closest(".home__case") || c.card;
      link.addEventListener("pointerenter", function () { c.target = 6; });
      link.addEventListener("pointerleave", function () { c.target = 1; });
    }
  });
  if ("IntersectionObserver" in window) {                            // pause cards that are off screen
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cards.forEach(function (c) { if (c.card === e.target) c.visible = e.isIntersecting; }); });
    });
    cards.forEach(function (c) { io.observe(c.card); });
  }

  function frame(now) {
    var dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
    var sy = window.scrollY, dy = sy - lastSy; lastSy = sy;
    cards.forEach(function (c) {
      c.speed += (c.target - c.speed) * 0.05;                        // hover speeds up and slows down gently
      var h = c.card.getBoundingClientRect().height || 1;
      c.clock += dt * c.speed + dy / (h * 4) * CYCLE;
      var round = Math.floor(c.clock / CYCLE);
      if (round !== c.round) {                                       // a new cycle: grow from another corner
        c.round = round;
        var fx = Math.random() < 0.5 ? -1 : 1, fy = Math.random() < 0.5 ? -1 : 1;
        c.svg.style.transform = "scale(" + fx + "," + fy + ")";
      }
      if (c.visible) draw(c, c.clock / CYCLE - round);
    });
    ease_dots();
    requestAnimationFrame(frame);
  }

  if (FORCED !== null) { cards.forEach(function (c) { draw(c, FORCED); }); ease_dots(); }
  else requestAnimationFrame(frame);
})();
