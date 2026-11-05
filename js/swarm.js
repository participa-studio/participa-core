/* ==========================================================
   PARTICIPA CORE — ANTS (prototype)
   On the home page of a site that switches it on (swarm: true in
   _config.yml), small dots wander like ants: a short run, a pause, a turn,
   another run. Both logos work as ant holes: an ant can come out from under
   a logo (it stays hidden inside the logo's circle) and go back into one.
   Some ants instead walk in from outside the screen, beside a logo or from
   the top.

   Each visit picks one variation at random (weights in VARIANTS):
     swarm        a dozen ants come out of the Design logo (right) and scatter
     trail        3-4 ants come out of the Design logo one after another, each
                  following the one in front
     group-in     3-4 ants walk in from outside the screen beside one of the
                  logos, pass under it and spread out
     left-hole    3-4 ants come out of the Studio logo (left), look around for
                  a while and go back into it
     to-left      three ants come out of the Design logo, walk along the header
                  and go into the Studio logo
     to-right     the same, from the Studio logo into the Design logo
     top-group    three ants drop in from the top of the screen
     walk-in      a single ant walks in from outside the screen beside a logo
     from-top     a single ant drops in from the top of the screen
     none         no ants this time
   To see one on purpose, add ?ants=NAME to the address, e.g. ?ants=left-hole

   Each ant is a small drawing (16 x 20 px): a large head and abdomen with a
   thin middle, like the hourglass in the Participa logo, long spread legs, two leg poses that alternate while it runs, turned to face
   the way it walks. Add ?antshape=dot to see the earlier dots instead.
   They never block clicks or text selection, screen readers ignore them,
   and with "reduce motion" switched on nothing appears.
   ========================================================== */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var header = document.querySelector(".site-header");
  var rightImg = document.querySelector(".site-header__sister img");
  var leftImg = document.querySelector(".site-header__home img");
  if (!header || !rightImg || !leftImg || !window.requestAnimationFrame) return;

  var VARIANTS = { "swarm": 3, "trail": 3, "group-in": 2, "left-hole": 3, "to-left": 2,
                   "to-right": 1, "top-group": 2, "walk-in": 1, "from-top": 1, "none": 1 };
  var SIZE = 5;              // dot size in pixels (?antshape=dot)
  var DOTS = /[?&]antshape=dot/.test(location.search);
  var ANT_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-16 -20 32 40\" width=\"16\" height=\"20\"><g class=\"pose-a\"><g fill=\"none\" stroke=\"#000\" stroke-width=\"1.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M-1.0 -5.0 L-5.2 -10.2 L-9.6 -18.2\"/><path d=\"M-1.0 -4.0 L-7.4 -4.2 L-14.6 -0.8\"/><path d=\"M-1.0 -3.0 L-6.4 0.4 L-12.4 11.6\"/><path d=\"M1.0 -5.0 L5.2 -8.6 L9.6 -15.0\"/><path d=\"M1.0 -4.0 L7.4 -5.8 L14.6 -4.0\"/><path d=\"M1.0 -3.0 L6.4 2.0 L12.4 14.8\"/><path d=\"M-1.3 -12.6 L-4.6 -15.4 L-5.0 -19.4\"/><path d=\"M1.3 -12.6 L4.6 -15.4 L5.0 -19.4\"/></g><g fill=\"#000\"><ellipse cx=\"0\" cy=\"-9.8\" rx=\"3.5\" ry=\"3.1\"/><ellipse cx=\"0\" cy=\"-4.2\" rx=\"1.6\" ry=\"2.5\"/><circle cx=\"0\" cy=\"-1.1\" r=\"0.95\"/><ellipse cx=\"0\" cy=\"5.0\" rx=\"4.3\" ry=\"5.4\"/></g></g><g class=\"pose-b\" style=\"display:none\"><g fill=\"none\" stroke=\"#000\" stroke-width=\"1.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M-1.0 -5.0 L-5.2 -8.6 L-9.6 -15.0\"/><path d=\"M-1.0 -4.0 L-7.4 -5.8 L-14.6 -4.0\"/><path d=\"M-1.0 -3.0 L-6.4 2.0 L-12.4 14.8\"/><path d=\"M1.0 -5.0 L5.2 -10.2 L9.6 -18.2\"/><path d=\"M1.0 -4.0 L7.4 -4.2 L14.6 -0.8\"/><path d=\"M1.0 -3.0 L6.4 0.4 L12.4 11.6\"/><path d=\"M-1.3 -12.6 L-4.6 -15.4 L-5.0 -19.4\"/><path d=\"M1.3 -12.6 L4.6 -15.4 L5.0 -19.4\"/></g><g fill=\"#000\"><ellipse cx=\"0\" cy=\"-9.8\" rx=\"3.5\" ry=\"3.1\"/><ellipse cx=\"0\" cy=\"-4.2\" rx=\"1.6\" ry=\"2.5\"/><circle cx=\"0\" cy=\"-1.1\" r=\"0.95\"/><ellipse cx=\"0\" cy=\"5.0\" rx=\"4.3\" ry=\"5.4\"/></g></g></svg>";
  var STEP_MS = 70;          // leg poses swap this often while running
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
  var R = circle(rightImg), L = circle(leftImg);
  var VW = window.innerWidth;
  var hb = header.getBoundingClientRect();
  var band = { top: hb.top + 10, bottom: hb.bottom - 10 };
  var D = Math.PI / 2, LEFT = Math.PI, RIGHT = 0, UP = -Math.PI / 2;

  // Build the ants for the chosen variation.
  // start: "hole" (inside a logo), "edge" (outside the screen beside a logo) or "top"
  var plan = [];
  if (name === "swarm") {
    var exits = [D, D, D, LEFT, LEFT, LEFT, RIGHT, UP];
    for (var i = 0; i < 12; i++) plan.push({ start: "hole", from: R, goal: pick(exits), born: (i / 12) * 1600 + rand(0, 200) });
  } else if (name === "walk-in") {
    plan.push({ start: "edge", from: Math.random() < 0.5 ? R : L, goal: D, born: 0, calm: true });
  } else if (name === "trail") {
    var tn = Math.random() < 0.5 ? 3 : 4, tgoal = pick([D, D, LEFT]);
    for (var q = 0; q < tn; q++) plan.push({ start: "hole", from: R, goal: tgoal, born: q * rand(450, 700),
                                             follow: q > 0 ? q - 1 : null, calm: true });
  } else if (name === "group-in") {
    var gside = Math.random() < 0.5 ? R : L, gn = Math.random() < 0.5 ? 3 : 4;
    for (var g = 0; g < gn; g++) plan.push({ start: "edge", from: gside, goal: pick([D, D, gside === R ? LEFT : RIGHT]),
                                             born: g * rand(300, 700), calm: true });
  } else if (name === "top-group") {
    for (var u = 0; u < 3; u++) plan.push({ start: "top", goal: pick([D, D, LEFT, RIGHT]), born: u * rand(300, 900), calm: true });
  } else if (name === "left-hole") {
    var n = Math.random() < 0.5 ? 3 : 4;
    for (var j = 0; j < n; j++) plan.push({ start: "hole", from: L, goal: pick([D, RIGHT, D]), born: j * rand(400, 900),
                                            back: rand(3500, 7000), calm: true });
  } else if (name === "to-left" || name === "to-right") {
    var toLeft = name === "to-left";
    for (var m = 0; m < 3; m++) plan.push({ start: "hole", from: toLeft ? R : L, to: toLeft ? L : R, born: m * rand(500, 900), menu: true });
  } else if (name === "from-top") {
    plan.push({ start: "top", goal: pick([D, D, LEFT, RIGHT]), born: 0, calm: true });
  }

  var layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.setAttribute("data-ants", name);
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden;";

  var ants = plan.map(function (p) {
    var el = document.createElement("div");
    if (DOTS) {
      el.style.cssText = "position:absolute;left:0;top:0;width:" + SIZE + "px;height:" + SIZE +
        "px;margin:-" + SIZE / 2 + "px 0 0 -" + SIZE / 2 + "px;border-radius:50%;background:#000;opacity:0;will-change:transform;";
    } else {
      el.style.cssText = "position:absolute;left:0;top:0;width:16px;height:20px;margin:-10px 0 0 -8px;opacity:0;will-change:transform;";
      el.innerHTML = ANT_SVG;
    }
    layer.appendChild(el);
    var a = { el: el, from: p.from, to: p.to, goal: p.goal, menu: p.menu, calm: p.calm, start: p.start,
              born: START_DELAY + p.born, back: p.back, follow: p.follow, speed: 0, mode: "pause", until: 0,
              gone: false, out: false, entering: false,
              poseA: el.querySelector(".pose-a"), poseB: el.querySelector(".pose-b"), stepAt: 0, legs: 0 };
    if (p.start === "hole") {
      a.x = p.from.x; a.y = p.from.y;
      a.heading = p.to ? Math.atan2(p.to.y - p.from.y, p.to.x - p.from.x) : p.goal + rand(-1, 1);
    } else if (p.start === "edge") {
      var fromRight = p.from === R;
      a.x = fromRight ? VW + 8 : -8; a.y = p.from.y + rand(-4, 4);
      a.inward = fromRight ? LEFT : RIGHT; a.heading = a.inward; a.entering = true;
    } else {                                         // top
      a.x = rand(VW * 0.15, VW * 0.85); a.y = -8;
      a.inward = D; a.heading = D; a.entering = true;
    }
    return a;
  });
  // Trail: each follower walks after the ant in front of it
  ants.forEach(function (a) { if (a.follow !== null && a.follow !== undefined) a.lead = ants[a.follow]; });
  document.body.appendChild(layer);

  function inside(a, c) { var dx = a.x - c.x, dy = a.y - c.y; return dx * dx + dy * dy < c.r * c.r; }
  function steer(a, target, pull) {
    var diff = Math.atan2(Math.sin(target - a.heading), Math.cos(target - a.heading));
    a.heading += diff * pull;
  }
  function doneEntering(a) {
    if (a.start === "top") return a.y > 24;
    return a.inward === RIGHT ? a.x > a.from.x + a.from.r : a.x < a.from.x - a.from.r;
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

      // Time to go home: head back to the hole it came out of
      if (a.back && !a.to && t > a.born + a.back) a.to = a.from;

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
            a.heading = a.inward + rand(-0.2, 0.2);  // walking in, straight
          } else {
            a.heading += a.menu ? rand(-0.9, 0.9) : rand(-1.1, 1.1);
            if (a.to) steer(a, Math.atan2(a.to.y - a.y, a.to.x - a.x), a.back ? 0.7 : 0.55);
            else if (a.lead && !a.lead.gone && t >= a.lead.born) steer(a, Math.atan2(a.lead.y - a.y, a.lead.x - a.x), 0.85);
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

      if (a.entering && doneEntering(a)) a.entering = false;
      // Hidden while under a logo
      var under = (a.from && inside(a, a.from)) || (a.to && a.out && inside(a, a.to));
      if (!a.entering && !under) a.out = true;
      a.el.style.opacity = under ? "0" : "1";
      var turn = DOTS ? "" : " rotate(" + (a.heading * 180 / Math.PI + 90).toFixed(1) + "deg)";
      a.el.style.transform = "translate(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px)" + turn;
      // Legs: swap poses while running, stand still while pausing
      if (a.poseA && a.mode === "run" && t - a.stepAt > STEP_MS) {
        a.stepAt = t; a.legs = 1 - a.legs;
        a.poseA.style.display = a.legs ? "none" : "";
        a.poseB.style.display = a.legs ? "" : "none";
      }

      var off = !a.entering && (a.x < -20 || a.x > W + 20 || a.y < -20 || a.y > H + 20);
      var home = a.to && a.out && inside(a, a.to);   // went into a logo
      if (off || home || t > (a.menu || a.back ? MAX_LIFE * 1.6 : MAX_LIFE)) {
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
