/* PARTICIPA CORE — BEETLE (24 Nov 2026; .studio About, participa.beetle: true).
   A rhinoceros beetle seen from the side, walking inside the Participa Design box on the About page, on its
   bottom line. She appears from behind the box's left line and disappears behind its right line (or the
   other way round). Drawn as a silhouette in the ink colour, in parts: wing cases, the band of the abdomen below them,
   the high neck shield, the head with its curved horn, and three legs on the near side (the far legs paler).
   Thin gaps in the page colour separate the parts. Drawn for Participa, not traced from any picture.
   Each visit she walks in from one side, stops now and then, sometimes turns round for a few steps and turns
   back, and walks off the other side. Then a pause of 20 to 40 s before the next visit.
   Same rules as the ants and the spider: never in the way of clicks or text, hidden from screen readers,
   nothing at all with "reduce motion" switched on. */
(function () {
  var box = document.querySelector('.about__side--design');
  if (!box || !window.requestAnimationFrame) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
  /* a clipping layer inside the box's lines: she is hidden behind the left and right lines */
  var footer = document.createElement('div');
  footer.setAttribute('aria-hidden', 'true');
  footer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2';
  box.appendChild(footer);

  var INK = '#1A1A1A', NS = 'http://www.w3.org/2000/svg';

  /* the page colour, for the thin gaps between the parts */
  function pageColour() {
    var els = [box, document.body, document.documentElement];
    for (var i = 0; i < els.length; i++) {
      var c = getComputedStyle(els[i]).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) return c;
    }
    return '#FFFFFF';
  }
  var GAP = pageColour();

  /* drawing units: the ground is y = 0, up is negative; drawn walking right */
  var host = document.createElement('div');
  host.className = 'beetle';
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;bottom:0;left:0;pointer-events:none;z-index:2;opacity:0;will-change:transform';
  host.innerHTML =
    '<svg viewBox="-16 -18 32 18" width="32" height="18" style="display:block;overflow:visible">' +
      '<g class="dir"><g class="walk">' +
        '<g class="far" fill="none" stroke="' + INK + '" stroke-opacity="0.45" stroke-linecap="round" stroke-linejoin="round"></g>' +
        '<g class="parts" fill="' + INK + '" stroke-width="0.55" stroke-linejoin="round">' +
          /* band of the abdomen, under the wing cases */
          '<path d="M-11.4 -6.4 C-6 -4.4 0 -4.3 3.6 -5.2 L3.4 -3.4 C-1.6 -2.4 -7.6 -2.7 -10.6 -4.4 Z"/>' +
          /* wing cases: a long, low dome */
          '<path d="M-13 -8.4 C-13.2 -12.6 -9.6 -14.6 -4.4 -14.6 L1.6 -14.4 C3.4 -14.2 3.8 -12.4 3.8 -10.2 L3.6 -5.4 C-1.8 -4.4 -8.2 -4.8 -11.6 -6.2 C-12.6 -6.7 -13 -7.4 -13 -8.4 Z"/>' +
          /* neck shield (pronotum): high at the back, sloping to the head */
          '<path d="M3.8 -14.2 C5.8 -15.4 8.4 -15.2 9.4 -14.2 C9.6 -12.2 9.2 -10.6 10.8 -8.8 L11 -5.8 C8.6 -4.8 5.8 -4.8 3.8 -5.4 Z"/>' +
          /* head with the curved horn */
          '<path d="M10.6 -8.8 L11.8 -10.2 C12.6 -12.8 12.6 -15 11.8 -17 C13.8 -15.6 14.6 -12.6 13.8 -9.2 L14.2 -6.8 C13 -5.6 11.8 -5.4 11 -5.8 Z"/>' +
        '</g>' +
        '<g class="near" fill="none" stroke="' + INK + '" stroke-linecap="round" stroke-linejoin="round"></g>' +
      '</g></g>' +
    '</svg>';
  footer.appendChild(host);
  var svg = host.querySelector('svg'), dirG = host.querySelector('.dir'), walkG = host.querySelector('.walk');
  var partsG = host.querySelector('.parts'), nearG = host.querySelector('.near'), farG = host.querySelector('.far');
  partsG.setAttribute('stroke', GAP);

  var S = 1;
  function size() {
    S = window.innerWidth <= 720 ? 1.15 : 1.6;
    svg.setAttribute('width', 32 * S); svg.setAttribute('height', 18 * S);
  }
  size();
  window.addEventListener('resize', size);

  /* each leg: a thick upper part, a thinner lower part and a short jointed foot along the ground.
     hip = where it leaves the body; knee and foot are the resting positions */
  var LEGS = [
    { hip: [8.2, -5.4], knee: [11.2, -3.6], foot: [12.6, 0], toe: 1 },     /* front: reaches forward */
    { hip: [0.6, -4.2], knee: [2.4, -2.6], foot: [3.2, 0], toe: 1 },       /* middle */
    { hip: [-7.2, -4.4], knee: [-10.6, -3.2], foot: [-13.2, 0], toe: -1 }  /* back: trails behind */
  ];
  function makeLeg(g, w) {
    var a = document.createElementNS(NS, 'path'), b = document.createElementNS(NS, 'path'), c = document.createElementNS(NS, 'path');
    a.setAttribute('stroke-width', 1.5 * w); b.setAttribute('stroke-width', 1.0 * w);
    c.setAttribute('stroke-width', 0.6 * w); c.setAttribute('stroke-dasharray', '0.7 0.35');
    g.appendChild(a); g.appendChild(b); g.appendChild(c);
    return [a, b, c];
  }
  var near = LEGS.map(function () { return makeLeg(nearG, 1); });
  var far = LEGS.map(function () { return makeLeg(farG, 0.85); });
  function seg(p, x1, y1, x2, y2) { p.setAttribute('d', 'M' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' L' + x2.toFixed(2) + ' ' + y2.toFixed(2)); }
  function drawLegs(phase, moving) {
    LEGS.forEach(function (L, i) {
      [near[i], far[i]].forEach(function (P, side) {
        /* tripod gait: front and back of one side move with the middle of the other side */
        var group = (i % 2) ^ side, ph = phase + (group ? Math.PI : 0);
        var sw = moving ? Math.sin(ph) : 0, lift = moving ? Math.max(0, Math.cos(ph)) : 0;
        var off = side ? -1.4 : 0;                                  /* far legs sit a little behind */
        var fx = L.foot[0] + off + sw * 1.8, fy = -lift * 1.3;
        var kx = L.knee[0] + off + sw * 0.8, ky = L.knee[1] - lift * 0.8;
        seg(P[0], L.hip[0] + off * 0.5, L.hip[1], kx, ky);
        seg(P[1], kx, ky, fx, fy);
        seg(P[2], fx, fy, fx + L.toe * 1.8, fy);
      });
    });
  }
  drawLegs(0, false);

  function rand(a, b) { return a + Math.random() * (b - a); }

  function visit() {
    GAP = pageColour(); partsG.setAttribute('stroke', GAP);
    var W = footer.clientWidth, w = 32 * S, fromLeft = Math.random() < 0.5;
    var start = fromLeft ? -w : W + w, end = fromLeft ? W + w : -w, dir = fromLeft ? 1 : -1;
    var plan = [], n = 2 + Math.floor(Math.random() * 3);
    for (var k = 1; k <= n; k++) {
      var tx = start + (end - start) * (k / (n + 1)) + rand(-40, 40);
      plan.push({ to: tx });
      plan.push({ wait: rand(1200, 2800) });
      /* now and then she turns round, takes a few steps back the way she came, and turns again */
      if (Math.random() < 0.3) { plan.push({ to: tx - dir * rand(20, 40) }); plan.push({ wait: rand(600, 1400) }); }
    }
    plan.push({ to: end });

    var SPEED = rand(22, 30) / 1000 * (S < 1.3 ? 0.85 : 1);   /* px per ms: an unhurried walk */
    var x = start, step = 0, t0 = null, from = x, phase = 0, prev = null, facing = dir;
    host.style.opacity = 1;
    function frame(t) {
      if (prev === null) prev = t;
      var dt = t - prev; prev = t;
      var m = plan[step];
      if (!m) { host.style.opacity = 0; setTimeout(visit, rand(20000, 40000)); return; }
      if (t0 === null) { t0 = t; from = x; }
      var e = t - t0, moving = false, bob = 0;
      if (m.to !== undefined) {
        var dist = m.to - from, dur = Math.abs(dist) / SPEED, k = dur ? Math.min(1, e / dur) : 1;
        if (dist) facing = dist > 0 ? 1 : -1;
        x = from + dist * k;
        moving = true; phase += dt / 110;
        bob = Math.abs(Math.sin(phase)) * -0.35;                 /* a slight rise and fall with each step */
        if (k >= 1) { step++; t0 = null; }
      } else if (e >= m.wait) { step++; t0 = null; }
      host.style.transform = 'translateX(' + (x - w / 2).toFixed(1) + 'px)';
      dirG.setAttribute('transform', facing > 0 ? '' : 'scale(-1,1)');
      walkG.setAttribute('transform', 'translate(0,' + bob.toFixed(2) + ')');
      drawLegs(phase, moving);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  setTimeout(visit, rand(2500, 6000));
})();
