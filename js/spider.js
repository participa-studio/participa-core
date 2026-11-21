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
  host.innerHTML = '<svg width="90" height="300" viewBox="0 0 90 300" style="overflow:visible;display:block">' +
    '<line class="silk" x1="45" y1="-2" x2="45" y2="0" stroke="' + INK + '" stroke-width="0.6"/>' +
    '<g class="sp"><g class="legs" fill="none" stroke="' + INK + '" stroke-opacity="0.7" stroke-width="0.45" stroke-linecap="round" stroke-linejoin="round"></g>' +
    '<circle cx="45" cy="0.4" r="1.3" fill="' + INK + '"/><ellipse cx="45" cy="5.2" rx="1.5" ry="3.9" fill="' + INK + '"/></g></svg>';
  /* size (21 Nov 2026): a little larger on wide screens, smaller on phones; the whole drawing scales, thread included */
  var svgEl = host.querySelector('svg');
  function size() {
    var s = window.innerWidth <= 720 ? 0.7 : 1.2;
    svgEl.setAttribute('width', 90 * s); svgEl.setAttribute('height', 300 * s);
    host.style.width = (90 * s) + 'px'; host.style.height = (300 * s) + 'px'; host.style.marginLeft = (-45 * s) + 'px';
    return s;
  }
  var scale = size();
  window.addEventListener('resize', function () { scale = size(); });
  var silk = host.querySelector('.silk'), sp = host.querySelector('.sp'), legsG = host.querySelector('.legs');
  /* long, thin legs: femur and tibia almost three times the body length together */
  /* cellar spider (Pholcidae, 21 Nov 2026): legs about five times the body length, the front pair longest */
  var LEGS = [ { a: -62, f: 15, t: 21 }, { a: -28, f: 13, t: 17 }, { a: 14, f: 12, t: 15 }, { a: 46, f: 13, t: 18 } ];
  var paths = [];
  for (var i = 0; i < 8; i++) { var p = document.createElementNS(NS, 'path'); legsG.appendChild(p); paths.push(p); }
  function drawLegs(phase, amp, jitter, spread) {
    spread = spread || 0;
    LEGS.forEach(function (L, i) {
      [-1, 1].forEach(function (side, s) {
        var g = ((i + s) % 2 ? 1 : -1) * Math.sin(phase) * amp + (jitter ? Math.sin(phase * 1.7 + i * 1.3 + s * 2.1) * jitter : 0);
        var a = (L.a * (1 - spread * 0.35) + g) * Math.PI / 180;   /* spread: legs splay outwards, as a parachute */
        var ox = 45 + side * 0.9, oy = 1.2;
        var kx = ox + side * Math.cos(a) * L.f * (1 + spread * 0.25), ky = oy + Math.sin(a) * L.f - 4.5 * (1 - spread * 0.6);        /* high knees */
        var bend = a + (i < 2 ? -0.2 : 0.55);
        var fx = kx + side * Math.cos(bend) * L.t * (0.5 + spread * 0.4), fy = ky + Math.abs(Math.sin(bend + 0.9)) * L.t;
        paths[i * 2 + s].setAttribute('d', 'M' + ox + ' ' + oy + ' Q' + (kx - side * 1.5).toFixed(2) + ' ' + (ky - 1).toFixed(2) + ' ' + kx.toFixed(2) + ' ' + ky.toFixed(2) + ' L' + fx.toFixed(2) + ' ' + fy.toFixed(2));
      });
    });
  }
  function spot(li) {
    /* x in the gap between the text and the image; phones: between the circle and the text */
    var item = li.querySelector('.blog__item'), thumb = li.querySelector('.blog__thumb'), title = li.querySelector('.blog__title');
    var lr = li.getBoundingClientRect();
    if (!thumb || !title) return lr.width * 0.75;
    var t = thumb.getBoundingClientRect(), h = title.getBoundingClientRect();
    if (t.left > h.left) return (t.left - lr.left) - 48;                 /* image on the right: 48 px before it, clear of the long legs */
    return (t.right - lr.left) + (h.left - t.right) / 2;                 /* image on the left: midway to the text */
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
    var drop = Math.min(li.clientHeight - 30, 60 + Math.random() * 70) / scale;   /* in drawing units */
    var t0 = null, D = 2400, H = 2400, U = 650;                         /* slides down slowly, runs back up fast */
    drawLegs(0, 0, 0, 0);
    function frame(t) {
      if (!t0) t0 = t;
      var e = t - t0, y, sway = 0, phase = 0, amp = 0, jit = 0, spread = 0;
      if (e < D) { var k = e / D; y = drop * (1 - Math.pow(1 - k, 2.4)); spread = Math.min(1, k * 4); phase = e / 120; jit = 1.5; }   /* legs open wide like a parachute, a slight float */
      else if (e < D + H) { var h = (e - D) / H; y = drop; sway = Math.sin((e - D) / 320) * 2 * (1 - h); spread = 1 - h * 0.7; phase = (e - D) / 90; jit = 2.5 * Math.max(0, Math.sin(h * Math.PI * 3)); }   /* hangs, legs slowly close */
      else if (e < D + H + U) { var u = (e - D - H) / U; y = drop * (1 - u * (2 - u)); phase = e / 28; amp = 20; }   /* scared: very fast legs, races back up */
      else { sp.setAttribute('transform', 'translate(0,-30)'); silk.setAttribute('y2', 0); host.remove(); setTimeout(cycle, 20000 + Math.random() * 20000); return; }
      silk.setAttribute('x2', 45 + sway); silk.setAttribute('y2', Math.max(0, y - 1));   /* the thread starts under the line and touches it */
      sp.setAttribute('transform', 'translate(' + sway + ',' + y + ')');
      drawLegs(phase, amp, jit, spread);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  sp.setAttribute('transform', 'translate(0,-30)');
  setTimeout(cycle, 1500 + Math.random() * 2500);
})();
