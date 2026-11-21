/* PARTICIPA CORE — SPIDER (21 Nov 2026; .studio Reflections, participa.spider: true). A cellar spider: tiny long body, very long thin pale legs.: one spider on the whole Reflections list at a time. Each visit it picks one post
   at random and lowers itself from that post's top line, in the gap between the text and the image
   (phones: between the circle and the text). Small body, long thin legs: they wiggle on the way down,
   twitch while it hangs and pull in an alternating gait as it climbs back. Every 20 to 40 s, another post. */
(function () {
  var list = document.querySelector('.blog > .blog__list');
  if (!list) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var INK = '#1A1A1A', NS = 'http://www.w3.org/2000/svg';
  var host = document.createElement('div');
  host.className = 'spider';
  host.style.cssText = 'position:absolute;top:-1px;width:60px;height:300px;margin-left:-30px;pointer-events:none;z-index:2;clip-path:inset(1px -60px -400px -60px)';
  host.innerHTML = '<svg width="90" height="420" viewBox="0 0 90 420" style="overflow:visible;display:block">' +
    '<line class="silk" x1="45" y1="-2" x2="45" y2="0" stroke="' + INK + '" stroke-width="0.6"/>' +
    '<g class="sp"><g class="legs" fill="none" stroke="' + INK + '" stroke-opacity="0.7" stroke-width="0.45" stroke-linecap="round" stroke-linejoin="round"></g>' +
    '<circle cx="45" cy="0.4" r="1.3" fill="' + INK + '"/><ellipse cx="45" cy="4.3" rx="2.1" ry="2.8" fill="' + INK + '"/></g></svg>';
  /* size (21 Nov 2026): a little larger on wide screens, smaller on phones; the whole drawing scales, thread included */
  var svgEl = host.querySelector('svg');
  function size() {
    var s = window.innerWidth <= 720 ? 0.95 : 1.2;   /* phones a little smaller than desktop, not tiny */
    svgEl.setAttribute('width', 90 * s); svgEl.setAttribute('height', 420 * s);
    host.style.width = (90 * s) + 'px'; host.style.height = (420 * s) + 'px'; host.style.marginLeft = (-45 * s) + 'px';
    return s;
  }
  var scale = size();
  window.addEventListener('resize', function () { scale = size(); });
  var silk = host.querySelector('.silk'), sp = host.querySelector('.sp'), legsG = host.querySelector('.legs');
  /* long, thin legs: femur and tibia almost three times the body length together */
  /* cellar spider (Pholcidae), drawn as a cartoon (21 Nov 2026). Each leg: a femur rising from the body to a high
     knee, then a tibia falling outwards and down: together a curved umbrella. Angles in degrees from the horizontal,
     negative = up. */
  var LEGS = [ { up: -62, f: 9.5, down: 62, t: 14 }, { up: -45, f: 9, down: 70, t: 13 }, { up: -28, f: 8.5, down: 78, t: 12 }, { up: -12, f: 9, down: 84, t: 13 } ];
  var paths = [];
  for (var i = 0; i < 8; i++) { var p = document.createElementNS(NS, 'path'); legsG.appendChild(p); paths.push(p); }
  var R = Math.PI / 180;
  function leg(k, ox, oy, kx, ky, fx, fy) {
    paths[k].setAttribute('d', 'M' + ox.toFixed(2) + ' ' + oy.toFixed(2) + ' L' + kx.toFixed(2) + ' ' + ky.toFixed(2) + ' L' + fx.toFixed(2) + ' ' + fy.toFixed(2));
  }
  /* open: 0 = umbrella closed in, 1 = opened (sliding down); jitter: small twitches; climb: 0..1 blend into climbing;
     phase drives the hand-over-hand pull of the front legs on the thread */
  function drawLegs(open, jitter, climb, phase, ground) {
    LEGS.forEach(function (L, i) {
      [-1, 1].forEach(function (side, s) {
        var ox = 45 + side * 0.9, oy = 1.2;
        var tw = jitter ? Math.sin(phase * 1.7 + i * 1.3 + s * 2.1) * jitter : 0;
        var up = (L.up - open * 6 + tw) * R, down = (L.down - open * 14 - tw * 0.5) * R;
        var kx = ox + side * Math.cos(up) * L.f, ky = oy + Math.sin(up) * L.f;
        var fx = kx + side * Math.cos(down) * L.t, fy = ky + Math.sin(down) * L.t;
        if (ground) {
          /* walking on the line: every foot on the ground, alternate legs lifting and stepping */
          var step = Math.sin(phase + ((i + s) % 2 ? Math.PI : 0));
          fx = fx + side * 1 + step * 2.6; fy = ground - Math.max(0, step) * 2.2;
          ky = Math.min(ky, fy - 5);
        } else if (climb > 0 && i < 2) {
          /* front two pairs reach up to the thread and pull, alternating left and right (and pair 1 against pair 2) */
          var beat = Math.sin(phase + (s ? Math.PI : 0) + (i ? Math.PI / 2 : 0));
          var gy = -6 - 7 * (0.5 + 0.5 * beat) - i * 3;                  /* grip point on the thread above the body */
          var gx = 45 + side * 0.6;
          var mx = (ox + gx) / 2 + side * (5.5 + i * 1.5), my = (oy + gy) / 2 + 1;   /* elbow bent outwards */
          kx = kx + (mx - kx) * climb; ky = ky + (my - ky) * climb;
          fx = fx + (gx - fx) * climb; fy = fy + (gy - fy) * climb;
        } else if (climb > 0) {
          /* back legs tuck in a little and trail while she climbs */
          var tuck = 0.35 * climb, kick = Math.sin(phase * 1.3 + i + s * Math.PI) * 2 * climb;
          fx = fx + (ox - fx) * tuck + side * kick * 0.3; fy = fy + (oy + 10 - fy) * tuck * 0.5 + kick;
        }
        leg(i * 2 + s, ox, oy, kx, ky, fx, fy);
      });
    });
  }
  function spot(li) {
    /* x in a gap: wide screens, at random, between the date and the text or between the text and the image;
       phones, between the circle and the text. Each time a little left or right inside the gap. */
    var thumb = li.querySelector('.blog__thumb'), title = li.querySelector('.blog__title'), date = li.querySelector('.blog__date');
    var lr = li.getBoundingClientRect(), jig = (Math.random() - 0.5) * 12;
    if (!thumb || !title) return lr.width * 0.75 + jig;
    var t = thumb.getBoundingClientRect(), h = title.getBoundingClientRect();
    if (t.left > h.left) {                                                  /* wide: image on the right */
      var gaps = [(t.left - lr.left) - 48];
      if (date) { var d = date.getBoundingClientRect(); if (h.left - d.right > 40) gaps.push((d.right - lr.left) + (h.left - d.right) / 2); }
      return gaps[Math.floor(Math.random() * gaps.length)] + jig;
    }
    return (t.right - lr.left) + (h.left - t.right) / 2 + jig / 3;          /* phones: image on the left */
  }
  var last = -1;
  function cycle() {
    var items = list.querySelectorAll(':scope > li:not([hidden])');
    if (!items.length) return;
    var n; do { n = Math.floor(Math.random() * items.length); } while (items.length > 1 && n === last);
    last = n;
    var li = items[n];
    li.style.position = 'relative';
    li.appendChild(host);
    host.style.left = Math.round(spot(li)) + 'px';
    /* about one visit in twenty she goes all the way down to the bottom line and walks off along it */
    var walkOut = Math.random() < 0.05;
    /* the bottom line is the next post's top line (or the list's end): measured, as a margin can sit between */
    var lrTop = li.getBoundingClientRect().top, nxt = li.nextElementSibling;
    var lineY = (nxt ? nxt.getBoundingClientRect().top : list.getBoundingClientRect().bottom - 1) - lrTop + 1;
    var drop = walkOut ? (lineY - 10.5 * scale) / scale : (lineY * (0.25 + Math.random() * 0.67) - 16) / scale;   /* anywhere from a quarter of the way down to almost the line */
    var startX = parseFloat(host.style.left), toLeft = startX < li.clientWidth / 2;
    var walkDist = (toLeft ? startX : li.clientWidth - startX) + 10;            /* the shorter way to the end of the line */
    var t0 = null, D = 2400 + drop * 6, H = walkOut ? 700 : 2400, U = 900 + drop * 3, W = walkDist * 22;   /* walking about 45 px a second */
    drawLegs(0, 0, 0, 0);
    host.style.opacity = 1;
    function frame(t) {
      if (!t0) t0 = t;
      var e = t - t0, y, sway = 0, open = 0, jit = 0, climb = 0, phase = 0, ground = 0;
      if (e < D) { var k = e / D; y = drop * (1 - Math.pow(1 - k, 2.4)); open = Math.min(1, k * 3); jit = 1.2; phase = e / 140; }      /* umbrella opens as she slides down */
      else if (walkOut && e < D + H) { y = drop; open = 1 - (e - D) / H * 0.5; phase = (e - D) / 120; jit = 1.5; silk.style.opacity = 1 - (e - D) / H; }   /* lands, lets go of the thread */
      else if (walkOut && e < D + H + W) {
        var wk = (e - D - H) / W, dx = (toLeft ? -1 : 1) * walkDist * wk;
        host.style.left = (startX + dx) + 'px';
        host.style.opacity = Math.min(1, (walkDist - Math.abs(dx)) / 40);    /* fades over the last 40 px, at the end of the line */
        y = drop; ground = 9.5; open = 0.3; phase = (e - D - H) / 70;
      }
      else if (walkOut) { host.remove(); silk.style.opacity = 1; host.style.opacity = 1; sp.setAttribute('transform', 'translate(0,-30)'); silk.setAttribute('y2', 0); setTimeout(cycle, 20000 + Math.random() * 20000); return; }
      else if (e < D + H) { var h = (e - D) / H; y = drop; sway = Math.sin((e - D) / 320) * 2 * (1 - h); open = 1 - h * 0.6; phase = (e - D) / 90; jit = 2 * Math.max(0, Math.sin(h * Math.PI * 3)); }
      else if (e < D + H + U) { var u = (e - D - H) / U; y = drop - (drop + 26) * u * (2 - u); climb = Math.min(1, u * 6); open = 0.4; phase = (e - D - H) / 45; }   /* hand over hand, on past the line and out of view */
      else { sp.setAttribute('transform', 'translate(0,-30)'); silk.setAttribute('y2', 0); host.remove(); setTimeout(cycle, 20000 + Math.random() * 20000); return; }
      silk.setAttribute('x2', 45 + sway); silk.setAttribute('y2', Math.max(0, y - 1));   /* the thread starts under the line and touches it; she disappears behind the line */
      sp.setAttribute('transform', 'translate(' + sway + ',' + y + ')');
      drawLegs(open, jit, climb, phase, ground ? ground : 0);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  sp.setAttribute('transform', 'translate(0,-30)');
  setTimeout(cycle, 1500 + Math.random() * 2500);
})();
