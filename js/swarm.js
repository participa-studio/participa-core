/* ==========================================================
   PARTICIPA CORE — SWARM (prototype)
   On the home page of a site that switches it on (swarm: true in
   _config.yml), small dots come out of a "hole" just under the sister logo
   and wander like ants: a short run, a pause, a turn, another run. Each one
   picks a side of the screen to leave by (down, left, right or up) and
   drifts that way while it searches, then disappears off the edge.
   The dots are stand-ins: the real insect drawings replace them later.
   They never block clicks or text selection, screen readers ignore them,
   and with "reduce motion" switched on nothing appears.
   ========================================================== */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var anchor = document.querySelector(".site-header__sister img");
  if (!anchor || !window.requestAnimationFrame) return;

  var COUNT = 12;            // how many ants
  var SIZE = 5;              // dot size in pixels
  var EMERGE = 1600;         // ms over which they come out, one after another
  var START_DELAY = 900;     // ms after load, so the page is settled first
  var MAX_LIFE = 25000;      // ms: anyone still on screen then fades away

  function rand(a, b) { return a + Math.random() * (b - a); }

  var layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden;";

  var r = anchor.getBoundingClientRect();
  var hx = r.left + r.width / 2, hy = r.bottom + 6;   // the hole, just under the logo

  var hole = document.createElement("div");
  hole.style.cssText = "position:absolute;width:14px;height:5px;border-radius:50%;background:#000;opacity:0;" +
    "left:" + (hx - 7) + "px;top:" + (hy - 2.5) + "px;transition:opacity .6s ease;";
  layer.appendChild(hole);

  // Each ant leaves by one side; mostly down and left, where the page is
  var D = Math.PI / 2, L = Math.PI, R = 0, U = -Math.PI / 2;
  var exits = [D, D, D, L, L, L, R, U];   // the hole sits near the top right, so right and up are rare
  var ants = [];
  for (var i = 0; i < COUNT; i++) {
    var el = document.createElement("div");
    el.style.cssText = "position:absolute;left:0;top:0;width:" + SIZE + "px;height:" + SIZE +
      "px;margin:-" + SIZE / 2 + "px 0 0 -" + SIZE / 2 + "px;border-radius:50%;background:#000;opacity:0;will-change:transform;";
    layer.appendChild(el);
    var goal = exits[Math.floor(Math.random() * exits.length)];
    ants.push({
      el: el, x: hx, y: hy, goal: goal,
      heading: goal + rand(-1.2, 1.2),
      speed: 0, born: START_DELAY + (i / COUNT) * EMERGE + rand(0, 200),
      mode: "pause", until: 0, gone: false
    });
  }

  document.body.appendChild(layer);
  var t0 = null, last = null;

  function step(now) {
    if (t0 === null) { t0 = now; last = now; }
    var t = now - t0, dt = Math.min(now - last, 50) / 1000;
    last = now;
    hole.style.opacity = t > START_DELAY - 300 && t < START_DELAY + EMERGE + 600 ? "0.85" : "0";

    var W = window.innerWidth, H = window.innerHeight, alive = 0;
    ants.forEach(function (a) {
      if (a.gone) return;
      alive++;
      if (t < a.born) return;
      if (a.el.style.opacity === "0") a.el.style.opacity = "1";

      // Ant rhythm: run, stop, turn, run again
      if (t >= a.until) {
        if (a.mode === "run") {
          a.mode = "pause"; a.speed = 0; a.until = t + rand(120, 520);
        } else {
          a.mode = "run"; a.speed = rand(70, 170); a.until = t + rand(250, 900);
          // a new direction: a random turn, pulled back towards the exit side
          var turn = rand(-1.1, 1.1);
          var diff = Math.atan2(Math.sin(a.goal - a.heading), Math.cos(a.goal - a.heading));
          a.heading += turn + diff * 0.35;
        }
      }
      if (a.mode === "run") {
        a.heading += rand(-0.15, 0.15);              // small wobble while running
        a.x += Math.cos(a.heading) * a.speed * dt;
        a.y += Math.sin(a.heading) * a.speed * dt;
      }
      // grows from nothing as it comes out of the hole
      var grow = Math.min(1, (t - a.born) / 250);
      a.el.style.transform = "translate(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px) scale(" + grow.toFixed(2) + ")";

      var off = a.x < -20 || a.x > W + 20 || a.y < -20 || a.y > H + 20;
      if (off || t > MAX_LIFE) {
        a.gone = true;
        if (off) a.el.remove();
        else { a.el.style.transition = "opacity .8s"; a.el.style.opacity = "0"; }
      }
    });

    if (alive > 0) requestAnimationFrame(step);
    else setTimeout(function () { layer.remove(); }, 1000);
  }
  requestAnimationFrame(step);
})();
