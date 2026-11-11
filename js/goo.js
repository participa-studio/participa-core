/* ==========================================================
   PARTICIPA CORE — CONNECTED DOTS OVER CASE IMAGES (11 Nov 2026)
   .design only: switched on with participa.goo: true in the site's _config.yml.

   Over every case card image (Work page and home page), Participa 8s in white at 40%,
   each lying on the diagonal and fixed on a square grid. From one of the four corners the white 8s
   grow in place until they touch and fill the area; close behind them, from the same corner,
   transparent 8s open in the same places and grow, until the photo is clear. The white is a moving
   band and never covers the whole image. Each new cycle starts from another corner.

   Timing: it moves on its own, very slowly (one cycle in about 45 s per card, each card at its own
   point); scrolling pushes the clock along (back when scrolling up); hovering a card runs it 8 times faster.

   Performance (11 Nov 2026, v-23): drawn on a small canvas per card (a third of the card's size),
   not as SVG shapes with blur filters. Each dot is a soft round sprite; overlapping sprites add up,
   and a light SVG colour filter on the canvas (no blur, on the graphics card) turns the sums into crisp
   melting shapes (metaballs). Updates about 12 times a second while drifting, every frame while scrolling
   or hovering; cards off screen are skipped; nothing is read back from the graphics card.

   Test switches: ?p=0.5 freezes a stage (0 to 1), ?corner=tl|tr|bl|br fixes the corner.
   Reduced motion: no pattern. Developed in preview/gooey.html.
   ========================================================== */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Wrap each card image in a frame that holds the image and the pattern
  document.querySelectorAll(".home__case > img").forEach(function (img) {
    var frame = document.createElement("span");
    frame.className = "goo-card";
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);
  });

  var W = 300, H = 200;                    // drawing units; the pattern covers the card like "object-fit: cover"
  var STEP = 42, GAP = 21, R = 11;         // grid spacing, distance between the two dots of an 8, dot radius
  var FILL = 1.9, FRONT = 0.45;            // how far each 8 grows (enough to touch), how soft the growing front is
  var CYCLE = 45;                          // seconds for one cycle on its own
  var params = new URLSearchParams(location.search);
  var FORCED = params.get("p") === null ? null : parseFloat(params.get("p"));
  var FIXED_CORNER = params.get("corner");

  // Two soft round sprites, reused for every dot: red for the white 8s, green for the transparent 8s.
  // Full strength in the middle, fading to nothing at the edge.
  var SPRITE = 64;
  function makeSprite(rgb) {
    var cv = document.createElement("canvas"); cv.width = cv.height = SPRITE;
    var x = cv.getContext("2d");
    var gr = x.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
    gr.addColorStop(0, "rgba(" + rgb + ",1)"); gr.addColorStop(1, "rgba(" + rgb + ",0)");
    x.fillStyle = gr; x.fillRect(0, 0, SPRITE, SPRITE);
    return cv;
  }
  var spriteW = makeSprite("255,0,0"), spriteH = makeSprite("0,255,0");

  // The threshold runs on the graphics card as a light SVG colour filter on the canvas (no blur):
  // red at half strength and above becomes white; green at half strength and above cuts it out again.
  (function () {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML =
      '<filter id="goo-threshold" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">' +
      '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  14 0 0 0 -6.5" result="white"/>' +
      '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 14 0 0 -6.5" result="holes"/>' +
      '<feComposite in="white" in2="holes" operator="out"/></filter>';
    document.body.appendChild(svg);
  })();
  // A sprite drawn at diameter D reaches the threshold (half strength) at about D/4 from its centre,
  // so to look like a dot of radius r it is drawn at diameter 4r.
  var SPREAD = 4;

  var cards = [];
  var hoverable = window.matchMedia("(hover: hover)").matches;

  document.querySelectorAll(".goo-card").forEach(function (frame) {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    frame.appendChild(canvas);
    var c = {
      frame: frame, canvas: canvas, ctx: canvas.getContext("2d"),
      clock: Math.random() * CYCLE, speed: 1, target: 1, follow: 0.06, visible: true, dirty: true
    };
    c.round = Math.floor(c.clock / CYCLE);
    build(c, FIXED_CORNER || pickCorner());
    if (hoverable) {
      var link = frame.closest(".home__case") || frame;
      link.addEventListener("pointerenter", function () { c.target = 8; });
      link.addEventListener("pointerleave", function () { c.target = 1; });
    }
    cards.push(c);
  });
  if (!cards.length) return;

  function pickCorner() { return ["tl", "tr", "bl", "br"][Math.floor(Math.random() * 4)]; }

  // The grid of 8s for one cycle. t = how far the dot is from the start corner (0) to the opposite corner (1),
  // with a little irregularity so the front is organic. Each 8 lies along the diagonal it grows on.
  function build(c, corner) {
    var cx = corner.indexOf("r") > -1 ? W : 0, cy = corner.indexOf("b") > -1 ? H : 0;
    var ax = (cx === 0 ? 1 : -1) / Math.SQRT2, ay = (cy === 0 ? 1 : -1) / Math.SQRT2;
    var maxD = Math.hypot(W, H);
    c.dots = [];
    for (var y = -STEP; y <= H + STEP; y += STEP) {
      for (var x = -STEP; x <= W + STEP; x += STEP) {
        var t = Math.min(1, Math.hypot(x - cx, y - cy) / maxD) + (Math.random() - 0.5) * 0.08;
        // two dots and a smaller neck between them, so each unit always reads as an 8
        for (var side = -1; side <= 1; side += 1) {
          c.dots.push({ x: x + side * ax * GAP / 2, y: y + side * ay * GAP / 2, t: t, size: side === 0 ? 0.62 : 1, g: 0, s: 0, hg: 0, hs: 0 });
        }
      }
    }
    c.dirty = true;
  }

  // Target sizes for a moment p of the cycle (0 to 1)
  function targets(c, p) {
    p = Math.max(0, Math.min(1, p));
    var front = -0.1 + p / 0.7 * 1.3;                                // white: across the image by p ≈ 0.7
    var hfront = p < 0.22 ? -1 : -0.1 + (p - 0.22) / 0.78 * 1.35;     // transparent: close behind
    c.dots.forEach(function (d) {
      var a = (front - d.t) / FRONT, b = (hfront - d.t) / FRONT;
      var grow = a <= 0 ? 0 : a >= 1 ? 1 : a * a * (3 - 2 * a);
      var open = b <= 0 ? 0 : b >= 1 ? 1 : b * b * (3 - 2 * b);
      d.g = grow * FILL;
      d.hg = open * FILL * 1.15;                                     // a little larger, so it clears fully
      if (FORCED !== null) { d.s = d.g; d.hs = d.hg; }
    });
  }

  // Each dot eases towards its target, so growth and clearing lag a little, like something living
  function follow(c) {
    var moved = false;
    c.dots.forEach(function (d) {
      var a = d.g - d.s, b = d.hg - d.hs;
      if (a) { moved = true; if (Math.abs(a) > 0.01) d.s += a * c.follow; else d.s = d.g; }
      if (b) { moved = true; if (Math.abs(b) > 0.01) d.hs += b * c.follow; else d.hs = d.hg; }
    });
    return moved;
  }

  // Draw one card: soft sprites summed on a small canvas (red = white 8s, green = transparent 8s);
  // the colour filter on the canvas turns the sums into crisp melting shapes.
  function render(c) {
    var rect = c.frame.getBoundingClientRect();
    // a small canvas (about a third of the card's size): the filter sharpens the edges after it is scaled up
    var bw = Math.max(1, Math.round(rect.width / 3)), bh = Math.max(1, Math.round(rect.height / 3));
    if (c.canvas.width !== bw || c.canvas.height !== bh) { c.canvas.width = bw; c.canvas.height = bh; }
    var x = c.ctx;
    var k = Math.max(bw / W, bh / H), ox = (bw - W * k) / 2, oy = (bh - H * k) / 2;
    x.globalCompositeOperation = "source-over";
    x.fillStyle = "#000"; x.fillRect(0, 0, bw, bh);
    x.globalCompositeOperation = "lighter";                          // overlapping sprites add up
    c.dots.forEach(function (d) {
      var px = ox + d.x * k, py = oy + d.y * k;
      if (d.s > 0.02) { var dw = R * d.size * d.s * SPREAD * k; x.drawImage(spriteW, px - dw / 2, py - dw / 2, dw, dw); }
      if (d.hs > 0.02) { var dh = R * d.size * d.hs * SPREAD * k; x.drawImage(spriteH, px - dh / 2, py - dh / 2, dh, dh); }
    });
  }

  // ---------- The clock ----------
  var lastSy = window.scrollY, lastT = performance.now(), lastDraw = 0;

  if ("IntersectionObserver" in window) {                            // pause cards that are off screen
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cards.forEach(function (c) { if (c.frame === e.target) c.visible = e.isIntersecting; }); });
    });
    cards.forEach(function (c) { io.observe(c.frame); });
  }
  window.addEventListener("resize", function () { cards.forEach(function (c) { c.h = 0; c.dirty = true; }); });

  function frameLoop(now) {
    var dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
    var sy = window.scrollY, dy = sy - lastSy; lastSy = sy;
    var busy = dy !== 0;
    cards.forEach(function (c) {
      c.speed += (c.target - c.speed) * 0.08;                        // hover speeds up and slows down gently
      c.follow = 0.06 + 0.12 * Math.min(1, (c.speed - 1) / 7);       // and the 8s follow more closely
      if (c.speed > 1.2) busy = true;
      var h = c.h || (c.h = c.frame.getBoundingClientRect().height || 1);
      c.clock += dt * c.speed + dy / (h * 4) * CYCLE;               // four card heights of scrolling = one cycle
      var round = Math.floor(c.clock / CYCLE);
      if (round !== c.round) { c.round = round; build(c, pickCorner()); }   // a new cycle from another corner
    });
    if (busy || now - lastDraw > 80) {                               // about 12 times a second while drifting
      lastDraw = now;
      cards.forEach(function (c) {
        if (!c.visible) return;
        targets(c, c.clock / CYCLE - c.round);
        if (follow(c) || c.dirty) { c.dirty = false; render(c); }
      });
    }
    requestAnimationFrame(frameLoop);
  }

  if (FORCED !== null) cards.forEach(function (c) { targets(c, FORCED); render(c); });
  else requestAnimationFrame(frameLoop);
})();
