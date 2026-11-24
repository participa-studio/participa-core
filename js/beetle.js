/* PARTICIPA CORE — DUNG BEETLE (24 Nov 2026; .studio About, participa.beetle: true).
   Seen from the side, on the lowest line of the page (the bottom edge of the footer). A small dung beetle
   rolls a ball along that line the way they really do: head down, walking backwards on the front and middle
   legs, the long hind legs up on the ball, pushing it. The ball turns as it rolls.
   Each visit she rolls in from one side, stops now and then (the ball sometimes rolls back a little and she
   catches up with it), and rolls off the other side. Then a pause of 20 to 40 s before the next visit.
   Same rules as the ants and the spider: never in the way of clicks or text, hidden from screen readers,
   nothing at all with "reduce motion" switched on. Drawn for Participa in the ink colour; not traced from
   any picture. */
(function () {
  var footer = document.querySelector('.site-footer');
  if (!footer || !window.requestAnimationFrame) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var INK = '#1A1A1A', NS = 'http://www.w3.org/2000/svg';
  if (getComputedStyle(footer).position === 'static') footer.style.position = 'relative';

  /* drawing units: the ground is y = 0, up is negative; drawn travelling right (ball on the right) */
  var BALL_R = 6.5, BALL_X = 8.5;
  var host = document.createElement('div');
  host.className = 'beetle';
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;bottom:0;left:0;pointer-events:none;z-index:2;opacity:0;will-change:transform';
  host.innerHTML =
    '<svg viewBox="-16 -16 32 16" width="32" height="16" style="display:block;overflow:visible">' +
      '<g class="dir">' +
        '<g class="ball" transform="translate(' + BALL_X + ',' + (-BALL_R) + ')">' +
          '<circle r="' + BALL_R + '" fill="' + INK + '"/>' +
          /* a few pale flecks, so the turning shows */
          '<g class="flecks" fill="#FFFFFF" opacity="0.25"><circle cx="2.6" cy="-2.2" r="0.7"/><circle cx="-3" cy="1.4" r="0.55"/><circle cx="0.8" cy="3.4" r="0.45"/></g>' +
        '</g>' +
        '<g class="bug">' +
          '<g class="legs" fill="none" stroke="' + INK + '" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"></g>' +
          /* abdomen and wing cases: raised towards the ball */
          '<ellipse cx="-2.0" cy="-6.4" rx="5.4" ry="4.1" transform="rotate(-30 -2.0 -6.4)" fill="' + INK + '"/>' +
          /* pronotum and head, low, towards the ground */
          '<ellipse cx="-6.8" cy="-3.6" rx="3.0" ry="2.5" transform="rotate(-20 -6.8 -3.6)" fill="' + INK + '"/>' +
          '<path d="M-9.2 -3.2 L-11.4 -1.6 L-10.6 -0.9 L-11.8 -0.6 L-9.4 -1.2 Z" fill="' + INK + '"/>' +   /* the toothed head shield */
          /* thin pale seam between the wing case and the pronotum */
          '<path d="M-5.6 -6.4 Q-4.6 -4.2 -5.4 -2.2" stroke="#FFFFFF" stroke-width="0.35" fill="none" opacity="0.8"/>' +
        '</g>' +
      '</g>' +
    '</svg>';
  footer.appendChild(host);
  var svg = host.querySelector('svg'), dirG = host.querySelector('.dir'), bug = host.querySelector('.bug');
  var ballG = host.querySelector('.ball'), flecks = host.querySelector('.flecks'), legsG = host.querySelector('.legs');

  var S = 1;
  function size() {
    S = window.innerWidth <= 720 ? 1.1 : 1.5;
    svg.setAttribute('width', 32 * S); svg.setAttribute('height', 16 * S);
  }
  size();
  window.addEventListener('resize', size);

  /* legs (two seen from the side, the far ones a little paler): front and middle on the ground, walking
     backwards; hind legs long, up on the ball */
  var paths = [];
  for (var i = 0; i < 6; i++) {
    var p = document.createElementNS(NS, 'path');
    if (i % 2) p.setAttribute('stroke-opacity', '0.55');
    legsG.appendChild(p); paths.push(p);
  }
  function L(k, pts) {
    paths[k].setAttribute('d', 'M' + pts.map(function (q) { return q[0].toFixed(2) + ' ' + q[1].toFixed(2); }).join(' L'));
  }
  function drawLegs(phase, moving, push) {
    var s0 = moving ? Math.sin(phase) : 0, s1 = moving ? Math.sin(phase + Math.PI) : 0;
    /* front legs: from under the head to the ground, stepping */
    L(0, [[-7.4, -2.6], [-9.6, -2.8], [-10.4 + s0 * 1.6, -Math.max(0, -s0) * 1.2]]);
    L(1, [[-7.0, -2.4], [-8.8, -1.8], [-8.6 + s1 * 1.6, -Math.max(0, -s1) * 1.2]]);
    /* middle legs */
    L(2, [[-4.2, -4.0], [-5.0, -1.8], [-4.4 + s1 * 1.4, -Math.max(0, -s1) * 1.0]]);
    L(3, [[-3.8, -3.8], [-3.2, -1.6], [-2.2 + s0 * 1.4, -Math.max(0, -s0) * 1.0]]);
    /* hind legs: knee up and back, foot on the ball's surface; push straightens them a little */
    var a1 = (200 + push * 10) * Math.PI / 180, a2 = (180 + push * 10) * Math.PI / 180;
    L(4, [[0.6, -8.2], [2.4, -11.6 - push], [BALL_X + Math.cos(a1) * BALL_R, -BALL_R + Math.sin(a1) * BALL_R]]);
    L(5, [[1.0, -7.4], [2.6, -9.0], [BALL_X + Math.cos(a2) * BALL_R, -BALL_R + Math.sin(a2) * BALL_R]]);
  }
  drawLegs(0, false, 0);

  function rand(a, b) { return a + Math.random() * (b - a); }

  function visit() {
    var W = footer.clientWidth, w = 32 * S, fromLeft = Math.random() < 0.5;
    var start = fromLeft ? -w : W + w, end = fromLeft ? W + w : -w, dir = fromLeft ? 1 : -1;
    var plan = [], n = 2 + Math.floor(Math.random() * 3);
    for (var k = 1; k <= n; k++) {
      var tx = start + (end - start) * (k / (n + 1)) + rand(-40, 40);
      plan.push({ to: tx });
      plan.push({ wait: rand(1200, 2800) });
      /* now and then the ball rolls back a little and she has to catch it */
      if (Math.random() < 0.35) { plan.push({ back: rand(8, 18) }); plan.push({ to: tx }); plan.push({ wait: rand(600, 1200) }); }
    }
    plan.push({ to: end });

    var SPEED = rand(18, 24) / 1000 * (S < 1.3 ? 0.85 : 1);   /* px per ms: slow and steady */
    var x = start, roll = 0, step = 0, t0 = null, from = x, phase = 0, prev = null;
    var R = BALL_R * S;                                          /* ball radius on screen, for the turning */
    host.style.opacity = 1;
    dirG.setAttribute('transform', dir > 0 ? '' : 'scale(-1,1)');
    function frame(t) {
      if (prev === null) prev = t;
      var dt = t - prev; prev = t;
      var m = plan[step];
      if (!m) { host.style.opacity = 0; setTimeout(visit, rand(20000, 40000)); return; }
      if (t0 === null) { t0 = t; from = x; }
      var e = t - t0, moving = false, push = 0, gap = 0, bob = 0;
      if (m.to !== undefined) {
        var dist = m.to - from, dur = Math.abs(dist) / SPEED, k = dur ? Math.min(1, e / dur) : 1;
        var nx = from + dist * k; roll += (nx - x) * dir / R; x = nx;
        moving = true; phase += dt / 140; push = 0.5 + 0.5 * Math.sin(phase * 2);
        if (k >= 1) { step++; t0 = null; }
      } else if (m.back !== undefined) {
        /* the ball rolls back towards her on its own: the ball moves, she stays; she then walks up to it again */
        var kb = Math.min(1, e / 700), eb = kb * (2 - kb);
        var bx = from - dir * m.back * eb; roll += (bx - x) * dir / R; x = bx;
        if (kb >= 1) { step++; t0 = null; }
      } else {
        bob = Math.sin(e / 300) * 0.25;                          /* resting, a small shift of weight */
        if (e >= m.wait) { step++; t0 = null; }
      }
      host.style.transform = 'translateX(' + (x - w / 2).toFixed(1) + 'px)';
      ballG.setAttribute('transform', 'translate(' + BALL_X + ',' + (-BALL_R) + ')');
      flecks.setAttribute('transform', 'rotate(' + (roll * 180 / Math.PI).toFixed(1) + ')');
      bug.setAttribute('transform', 'translate(' + (-gap).toFixed(2) + ',' + bob.toFixed(2) + ')');
      drawLegs(phase, moving, push);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  setTimeout(visit, rand(2500, 6000));
})();
