/* PARTICIPA CORE — LADYBUG (24 Nov 2026; .studio About, participa.ladybug: true).
   One small ladybug walks along the top of the footer on the About page. Seen from above: a red domed back
   with black spots and a seam down the middle, a black head and six short legs in a tripod gait.
   Each visit she walks in from one side, stops now and then to look around, sometimes turns back for a
   moment, and walks off the other side. Then a pause of 20 to 40 s before the next visit.
   Like the ants and the spider: never in the way of clicks or text, hidden from screen readers,
   and nothing at all with "reduce motion" switched on. */
(function () {
  var footer = document.querySelector('.site-footer');
  if (!footer || !window.requestAnimationFrame) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var INK = '#1A1A1A', RED = '#BD483D', NS = 'http://www.w3.org/2000/svg';
  if (getComputedStyle(footer).position === 'static') footer.style.position = 'relative';

  var host = document.createElement('div');
  host.className = 'ladybug';
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;top:2px;left:0;pointer-events:none;z-index:2;opacity:0;will-change:transform';
  /* drawn facing right, centred on 0,0; body about 12 x 10 units */
  host.innerHTML =
    '<svg viewBox="-12 -10 24 20" width="24" height="20" style="display:block;overflow:visible">' +
      '<g class="lb">' +
        '<g class="legs" fill="none" stroke="' + INK + '" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"></g>' +
        '<ellipse cx="6.2" cy="0" rx="2.6" ry="3.1" fill="' + INK + '"/>' +                       /* head */
        '<path class="ant" d="M7.8 -1.6 L10.2 -3.4 M7.8 1.6 L10.2 3.4" stroke="' + INK + '" stroke-width="0.6" stroke-linecap="round" fill="none"/>' +
        '<ellipse cx="-0.6" cy="0" rx="6.4" ry="5.4" fill="' + RED + '"/>' +                     /* back */
        '<path d="M5.2 -1.9 Q5.9 0 5.2 1.9" stroke="#FFFFFF" stroke-width="0.7" fill="none" opacity="0.9"/>' +  /* pale edge of the pronotum */
        '<line x1="-7" y1="0" x2="5" y2="0" stroke="' + INK + '" stroke-width="0.55"/>' +            /* seam between the wing cases */
        '<g fill="' + INK + '">' +
          '<circle cx="1.6" cy="-2.6" r="1.15"/><circle cx="1.6" cy="2.6" r="1.15"/>' +
          '<circle cx="-2.6" cy="-3.1" r="1.25"/><circle cx="-2.6" cy="3.1" r="1.25"/>' +
          '<circle cx="-4.9" cy="-1.3" r="0.9"/><circle cx="-4.9" cy="1.3" r="0.9"/>' +
        '</g>' +
      '</g>' +
    '</svg>';
  footer.appendChild(host);
  var svg = host.querySelector('svg'), lb = host.querySelector('.lb'), legsG = host.querySelector('.legs');

  /* size: a little smaller on phones */
  var S = 1;
  function size() {
    S = window.innerWidth <= 720 ? 0.85 : 1.1;
    svg.setAttribute('width', 24 * S); svg.setAttribute('height', 20 * S);
  }
  size();
  window.addEventListener('resize', size);

  /* six legs: front, middle, back on each side; each is a short bent line from the body edge */
  var LEGS = [ { x: 3.2, a: 35 }, { x: -0.2, a: 90 }, { x: -3.8, a: 140 } ];
  var paths = [];
  for (var i = 0; i < 6; i++) { var p = document.createElementNS(NS, 'path'); legsG.appendChild(p); paths.push(p); }
  var R = Math.PI / 180;
  function drawLegs(phase, moving) {
    LEGS.forEach(function (L, i) {
      [-1, 1].forEach(function (side, s) {
        /* tripod gait: front and back of one side move with the middle of the other side */
        var group = (i % 2) ^ s;
        var swing = moving ? Math.sin(phase + (group ? Math.PI : 0)) * 14 : 0;
        var a = (L.a - swing) * R;
        var ox = L.x * 0.9, oy = side * 3.4;                                      /* starts under the shell */
        var kx = ox + Math.cos(a) * 1.7, ky = oy + side * (2.4 + Math.sin(a) * 0.6);   /* knee just outside the edge */
        var bend = i === 0 ? 1.4 : i === 2 ? -1.4 : 0;                            /* front feet forward, back feet back */
        var fx = kx + bend + Math.cos(a) * 0.6, fy = ky + side * 1.3;
        paths[i * 2 + s].setAttribute('d', 'M' + ox.toFixed(2) + ' ' + oy.toFixed(2) + ' L' + kx.toFixed(2) + ' ' + ky.toFixed(2) + ' L' + fx.toFixed(2) + ' ' + fy.toFixed(2));
      });
    });
  }
  drawLegs(0, false);

  function rand(a, b) { return a + Math.random() * (b - a); }

  /* one visit: a list of moves, each walking to a target x or standing still for a while */
  function visit() {
    var W = footer.clientWidth, w = 24 * S, fromLeft = Math.random() < 0.5;
    var start = fromLeft ? -w : W + w, end = fromLeft ? W + w : -w, dir = fromLeft ? 1 : -1;
    var plan = [], x = start, n = 2 + Math.floor(Math.random() * 3);
    for (var k = 1; k <= n; k++) {
      var tx = start + (end - start) * (k / (n + 1)) + rand(-30, 30);
      plan.push({ to: tx });
      plan.push({ wait: rand(900, 2400) });
      if (Math.random() < 0.3) { plan.push({ to: tx - dir * rand(14, 30) }); plan.push({ wait: rand(500, 1200) }); }
    }
    plan.push({ to: end });

    var SPEED = rand(26, 34) / 1000 * (S < 1 ? 0.85 : 1);   /* px per ms: a slow, steady walk */
    var step = 0, t0 = null, from = x, facing = dir, phase = 0, prev = null, look = 0;
    host.style.opacity = 1;
    function frame(t) {
      if (prev === null) prev = t;
      var dt = t - prev; prev = t;
      var m = plan[step];
      if (!m) { host.style.opacity = 0; setTimeout(visit, rand(20000, 40000)); return; }
      if (t0 === null) { t0 = t; from = x; }
      var e = t - t0, moving = false;
      if (m.to !== undefined) {
        var dist = m.to - from, dur = Math.abs(dist) / SPEED;
        facing = dist >= 0 ? 1 : -1;
        var k = dur ? Math.min(1, e / dur) : 1;
        x = from + dist * k;
        moving = true; phase += dt / 55; look = 0;
        if (k >= 1) { step++; t0 = null; }
      } else {
        /* standing: the head turns a little from side to side, as if looking around */
        look = Math.sin(e / 420) * 6;
        if (e >= m.wait) { step++; t0 = null; }
      }
      host.style.transform = 'translateX(' + (x - w / 2).toFixed(1) + 'px)';
      lb.setAttribute('transform', 'scale(' + facing + ',1) rotate(' + look.toFixed(2) + ')');
      drawLegs(phase, moving);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  setTimeout(visit, rand(2500, 6000));
})();
