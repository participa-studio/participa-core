/* ==========================================================
   PARTICIPA CORE — CONNECTED DOTS OVER CASE IMAGES (11 Nov 2026)
   .design only: switched on with participa.goo: true in the site's _config.yml.
   Over every case card image (Work page and home page), Participa 8s in white at 40%
   grow from one of the four corners (random on every visit) along branching threads, like mycelium,
   swell into white areas in the middle of the cycle, then thin out from the corner and fade away.
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
  var W = 300, H = 200, STEP_X = 40, STEP_Y = 22, GAP = 17, R = 9, EDGE = 0.25, FRONT = 0.06;   // how soft the clearing tail (EDGE) and the growing front (FRONT) are, as a share of the diagonal
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
      '<feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="blur"/>' +   // a tighter melt: the two dots of a unit join, neighbours only just touch
      '<feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -9" result="shape"/>' +
      '<feFlood flood-color="' + colour + '"/><feComposite in2="shape" operator="in"/></filter>';
    svg.appendChild(defs);
    var g = document.createElementNS(NS, "g");
    g.setAttribute("filter", "url(#" + id + ")");
    var dots = [];
    // the 8 lies along the diagonal it grows on (from the start corner towards the opposite one)
    var ax = (cx === 0 ? 1 : -1) / Math.SQRT2, ay = (cy === 0 ? 1 : -1) / Math.SQRT2;

    // 1. The grid of possible units
    var units = [];
    for (var row = -1; row * STEP_Y <= H + STEP_Y; row++) {
      var shift = (row % 2) ? STEP_X / 2 : 0;
      for (var x = -STEP_X + shift; x <= W + STEP_X; x += STEP_X) units.push({ x: x, y: row * STEP_Y, row: row });
    }
    // neighbours: the units around each one on the diagonal grid
    units.forEach(function (u) {
      u.nb = units.filter(function (v) {
        return v !== u && Math.abs(v.row - u.row) <= 1 && Math.abs(v.x - u.x) <= STEP_X + 1;
      });
    });

    // 2. Mycelium-like growth order: from the unit nearest the corner, the network spreads along
    //    branching threads. A frontier unit is more likely to grow next when it touches only one grown
    //    unit (a thread tip, not a filled patch) and when it leads away from the corner.
    var start = units.reduce(function (a, b) { return Math.hypot(a.x - cx, a.y - cy) < Math.hypot(b.x - cx, b.y - cy) ? a : b; });
    var order = 0; start.order = order++;
    var grown = [start];
    while (true) {
      var frontier = [];
      grown.forEach(function (u) { u.nb.forEach(function (v) { if (v.order === undefined && frontier.indexOf(v) < 0) frontier.push(v); }); });
      if (!frontier.length) break;
      var best = null, bestScore = -1;
      frontier.forEach(function (v) {
        var grownNb = v.nb.filter(function (w) { return w.order !== undefined; });
        var touching = grownNb.length;
        var youngest = Math.max.apply(null, grownNb.map(function (w) { return w.order; })) / Math.max(1, order);
        var away = Math.hypot(v.x - cx, v.y - cy) / maxD;          // 0 at the corner, 1 at the far corner
        // thread tips (one grown neighbour) and young tips grow on; now and then an older point branches
        var score = Math.random() * (touching === 1 ? 3 : 0.15) * (0.25 + Math.pow(youngest, 3) * 2) * (0.6 + away);
        if (score > bestScore) { bestScore = score; best = v; }
      });
      best.order = order++;
      // the unit it grows out of: the youngest grown neighbour
      best.parent = best.nb.filter(function (w) { return w.order !== undefined && w !== best; })
        .reduce(function (a, b) { return a.order > b.order ? a : b; });
      grown.push(best);
    }
    var total = order;

    // 3. Draw each unit as an 8: two dots along the diagonal
    units.forEach(function (u) {
      // when it grows in the cycle (0 to 1): its place along the threads, held back by its distance from
      // the corner, so the network travels across the photo from the corner instead of appearing everywhere
      var t = 0.4 * u.order / total + 0.6 * Math.min(1, Math.hypot(u.x - cx, u.y - cy) / maxD);
      var px = u.parent ? u.parent.x - u.x : 0, py = u.parent ? u.parent.y - u.y : 0;   // where it slides out from
      [-1, 1].forEach(function (side, i) {
        var c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", (u.x + side * ax * GAP / 2).toFixed(1));
        c.setAttribute("cy", (u.y + side * ay * GAP / 2).toFixed(1));
        c.setAttribute("r", (R * (0.9 + Math.random() * 0.2)).toFixed(1));
        g.appendChild(c); dots.push({ el: c, t: t + i * 0.004, g: 0, s: 0, px: px, py: py });
      });
    });
    svg.appendChild(g); card.appendChild(svg);
    cards.push({ card: card, dots: dots, g: g });
  });

  var FORCED = new URLSearchParams(location.search).get("p"); FORCED = FORCED === null ? null : parseFloat(FORCED);
  var ticking = false;

  function draw(c, p) {
    if (FORCED !== null) p = FORCED;                     // test switch: ?p=0.5 shows a fixed stage
    p = Math.max(0, Math.min(1, p));
    c.p = p;
    // Life cycle, like mycelium, in three phases (t = each 8's place in the growth order along the threads):
    // 1. threads grow from the corner (p 0 to 0.45);
    // 2. in the middle, mature threads swell and melt into each other, covering areas of the image in white;
    // 3. from p = 0.65 the oldest parts thin out from the corner while the whole pattern fades away.
    var front = p < 0.45 ? p / 0.45 * 0.5 : 0.5 + (p - 0.45) / 0.55 * 0.4;
    var tail = p < 0.65 ? -1 : -0.1 + (p - 0.65) / 0.35 * 1.1;
    var swell = p < 0.3 ? 0 : p < 0.55 ? (p - 0.3) / 0.25 : 1;          // how far the middle phase has gone
    c.dots.forEach(function (d) {
      var a = (front - d.t) / FRONT, b = (d.t - tail) / EDGE;
      var grow = a <= 0 ? 0 : a >= 1 ? 1 : a * a * (3 - 2 * a);
      var thin = b <= 0 ? 0 : b >= 1 ? 1 : b * b * (3 - 2 * b);
      var age = Math.max(0, Math.min(1, (front - d.t) / 0.3));         // older threads swell more
      d.g = grow * thin * (1 + 0.9 * swell * age);
      if (FORCED !== null) { d.s = d.g; d.q = -1; }      // fixed stages render without easing
    });
    // the whole pattern fades out during the last phase (white at 40% at most)
    var fade = p < 0.65 ? 1 : Math.max(0, 1 - (p - 0.65) / 0.35);
    c.g.style.opacity = (0.4 * fade).toFixed(3);
  }

  // Each dot eases towards its target, so growth and clearing lag a little, like something living.
  function ease_dots() {
    cards.forEach(function (c) {
      if (!c.visible && FORCED === null) return;
      c.dots.forEach(function (d) {
        var diff = d.g - d.s;
        if (Math.abs(diff) > 0.004) d.s += diff * 0.06; else d.s = d.g;
        var q = Math.round(d.s * 100) / 100;
        if (q !== d.q) {
          d.q = q;
          // while it grows, the 8 slides out of the unit it grew from to its own place
          var k = Math.min(1, q), m = 1 - k;
          d.el.style.transform = "translate(" + (d.px * m).toFixed(1) + "px," + (d.py * m).toFixed(1) + "px) scale(" + q + ")";
        }
      });
    });
  }

  // ---------- The clock: a slow lava lamp that the scroll and the pointer push along ----------
  // Every card runs its own cycle (grow, swell, fade) over CYCLE seconds, starting at a random point,
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
