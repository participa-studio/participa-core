/* ==========================================================
   PARTICIPA CORE — ANTS (prototype)
   On the home page of a site that switches it on (swarm: true in
   _config.yml), small dots walk in from outside the screen, level with one
   of the two logos, pass under that logo and come out the other side, then
   wander like ants: a short run, a pause, a turn, another run.
   Nothing appears out of nowhere: every ant walks in from the edge.

   Each visit picks one variation at random (weights in VARIANTS):
     swarm-right   a dozen ants from the sister logo, scattering off-screen
     swarm-left    the same from the own logo on the left
     one-right     a single ant from the sister logo, heading down the page
     one-left      a single ant from the own logo, heading down the page
     menu-left     two ants walk along the header, up and down around the
                   menu, from the sister logo to the own logo, and go under it
     menu-right    the same, from the own logo to the sister logo
     none          no ants this time
   To see one on purpose, add ?ants=NAME to the address, e.g. ?ants=menu-left

   The dots are stand-ins: the real insect drawings replace them later.
   They never block clicks or text selection, screen readers ignore them,
   and with "reduce motion" switched on nothing appears.
   ========================================================== */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var header = document.querySelector(".site-header");
  var right = document.querySelector(".site-header__sister img");
  var left = document.querySelector(".site-header__home img");
  if (!header || !right || !left || !window.requestAnimationFrame) return;

  var VARIANTS = { "swarm-right": 2, "swarm-left": 1, "one-right": 2, "one-left": 1,
                   "menu-left": 2, "menu-right": 1, "none": 1 };
  var SIZE = 5;              // dot size in pixels
  var START_DELAY = 900;     // ms after load, so the page is settled first
  var MAX_LIFE = 25000;      // ms: anyone still on screen then fades away

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  var forced = (location.search.match(/[?&]ants=([a-z-]+)/) || [])[1];
  var name = forced && VARIANTS[forced] !== undefined ? forced : (function () {
    var total = 0, k; for (k in VARIANTS) total += VARIANTS[k];
    var r = Math.random() * total;
    for (k in VARIANTS) { r -= VARIANTS[k]; if (r < 0) return k; }
    return "none";
  })();
  if (name === "none") return;

  function circle(img) {
    var r = img.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 + 1 };
  }
  var R = circle(right), Lc = circle(left);
  var VW = window.innerWidth;
  // Where an ant enters: just outside the screen edge beside the logo
  function entry(c) {
    var fromRight = c === R;
    return { x: fromRight ? VW + 8 : -8, y: c.y + rand(-4, 4), inward: fromRight ? Math.PI : 0 };
  }
  var hb = header.getBoundingClientRect();
  var band = { top: hb.top + 10, bottom: hb.bottom - 10, mid: (R.y + Lc.y) / 2 };

  var D = Math.PI / 2, LEFT = Math.PI, RIGHT = 0, UP = -Math.PI / 2;

  // Build the ants for the chosen variation
  var plan = [];
  if (name === "swarm-right" || name === "swarm-left") {
    var fromRight = name === "swarm-right";
    var exits = fromRight ? [D, D, D, LEFT, LEFT, LEFT, RIGHT, UP] : [D, D, D, RIGHT, RIGHT, RIGHT, LEFT, UP];
    for (var i = 0; i < 12; i++) {
      plan.push({ from: fromRight ? R : Lc, goal: pick(exits), born: (i / 12) * 1600 + rand(0, 200) });
    }
  } else if (name === "one-right" || name === "one-left") {
    plan.push({ from: name === "one-right" ? R : Lc, goal: D, born: 0, calm: true });
  } else {
    var toLeft = name === "menu-left";
    for (var j = 0; j < 2; j++) {
      plan.push({ from: toLeft ? R : Lc, to: toLeft ? Lc : R, born: j * rand(500, 900), menu: true });
    }
  }

  var layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.setAttribute("data-ants", name);
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden;";

  var ants = plan.map(function (p) {
    var el = document.createElement("div");
    el.style.cssText = "position:absolute;left:0;top:0;width:" + SIZE + "px;height:" + SIZE +
      "px;margin:-" + SIZE / 2 + "px 0 0 -" + SIZE / 2 + "px;border-radius:50%;background:#000;opacity:0;will-change:transform;";
    layer.appendChild(el);
    var e = entry(p.from);
    return { el: el, x: e.x, y: e.y, inward: e.inward, entering: true, from: p.from, to: p.to, goal: p.goal,
             menu: p.menu, calm: p.calm, heading: e.inward, speed: 0, born: START_DELAY + p.born,
             mode: "pause", until: 0, gone: false, out: false };
  });
  document.body.appendChild(layer);

  function inside(a, c) { var dx = a.x - c.x, dy = a.y - c.y; return dx * dx + dy * dy < c.r * c.r; }
  function steer(a, target, pull) {
    var diff = Math.atan2(Math.sin(target - a.heading), Math.cos(target - a.heading));
    a.heading += diff * pull;
  }

  var t0 = null, last = null;
  function step(now) {
    if (t0 === null) { t0 = now; last = now; }
    var t = now - t0, dt = Math.min(now - last, 50) / 1000;
    last = now;
    var W = window.innerWidth, H = window.innerHeight, alive = 0;

    ants.forEach(function (a) {
      if (a.gone) return;
      alive++;
      if (t < a.born) return;

      // Ant rhythm: run, stop, turn, run again
      if (t >= a.until) {
        if (a.mode === "run") {
          a.mode = "pause"; a.speed = 0;
          a.until = t + (a.menu ? rand(60, 260) : rand(120, 520));
        } else {
          a.mode = "run";
          a.speed = a.menu ? rand(90, 160) : a.calm ? rand(60, 120) : rand(70, 170);
          a.until = t + rand(250, 900);
          if (a.entering) {
            a.heading = a.inward + rand(-0.2, 0.2);    // walking in, straight under the logo
          } else {
            a.heading += a.menu ? rand(-0.9, 0.9) : rand(-1.1, 1.1);
            if (a.to) steer(a, Math.atan2(a.to.y - a.y, a.to.x - a.x), 0.55);
            else steer(a, a.goal, a.calm ? 0.6 : 0.35);
          }
        }
      }
      if (a.mode === "run") {
        a.heading += a.entering ? rand(-0.05, 0.05) : rand(-0.15, 0.15);   // small wobble while running
        a.x += Math.cos(a.heading) * a.speed * dt;
        a.y += Math.sin(a.heading) * a.speed * dt;
        if (a.menu) {                                 // stay in the header, up and down around the menu
          if (a.y < band.top) { a.y = band.top; a.heading = -a.heading; }
          if (a.y > band.bottom) { a.y = band.bottom; a.heading = -a.heading; }
        }
      }

      // Past the logo it walked under: free to wander
      if (a.entering && (a.inward === 0 ? a.x > a.from.x + a.from.r : a.x < a.from.x - a.from.r)) a.entering = false;
      // Hidden while under a logo
      var under = inside(a, a.from) || (a.to && a.out && inside(a, a.to));
      if (!a.entering) a.out = true;
      a.el.style.opacity = under ? "0" : "1";
      a.el.style.transform = "translate(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px)";

      var off = !a.entering && (a.x < -20 || a.x > W + 20 || a.y < -20 || a.y > H + 20);
      var home = a.to && a.out && inside(a, a.to);   // went under the other logo
      if (off || home || t > (a.menu ? MAX_LIFE * 1.6 : MAX_LIFE)) {
        a.gone = true;
        if (off || home) a.el.remove();
        else { a.el.style.transition = "opacity .8s"; a.el.style.opacity = "0"; }
      }
    });

    if (alive > 0) requestAnimationFrame(step);
    else setTimeout(function () { layer.remove(); }, 1000);
  }
  requestAnimationFrame(step);
})();
