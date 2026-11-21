/* PARTICIPA CORE — SPIDER (21 Nov 2026; .studio Reflections, participa.spider: true): one spider on the whole Reflections list at a time. Each visit it picks one post
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
  host.innerHTML = '<svg width="60" height="300" viewBox="0 0 60 300" style="overflow:visible;display:block">' +
    '<line class="silk" x1="30" y1="-2" x2="30" y2="0" stroke="' + INK + '" stroke-width="0.6"/>' +
    '<g class="sp"><g class="legs" fill="none" stroke="' + INK + '" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"></g>' +
    '<circle cx="30" cy="0" r="1.6" fill="' + INK + '"/><ellipse cx="30" cy="3.6" rx="2.3" ry="2.7" fill="' + INK + '"/></g></svg>';
  /* size (21 Nov 2026): a little larger on wide screens, smaller on phones; the whole drawing scales, thread included */
  var svgEl = host.querySelector('svg');
  function size() {
    var s = window.innerWidth <= 720 ? 0.8 : 1.2;
    svgEl.setAttribute('width', 60 * s); svgEl.setAttribute('height', 300 * s);
    host.style.width = (60 * s) + 'px'; host.style.height = (300 * s) + 'px'; host.style.marginLeft = (-30 * s) + 'px';
    return s;
  }
  var scale = size();
  window.addEventListener('resize', function () { scale = size(); });
  var silk = host.querySelector('.silk'), sp = host.querySelector('.sp'), legsG = host.querySelector('.legs');
  /* long, thin legs: femur and tibia almost three times the body length together */
  var LEGS = [ { a: -58, f: 10, t: 13 }, { a: -22, f: 10.5, t: 13.5 }, { a: 16, f: 10, t: 13 }, { a: 48, f: 9, t: 12 } ];
  var paths = [];
  for (var i = 0; i < 8; i++) { var p = document.createElementNS(NS, 'path'); legsG.appendChild(p); paths.push(p); }
  function drawLegs(phase, amp, jitter) {
    LEGS.forEach(function (L, i) {
      [-1, 1].forEach(function (side, s) {
        var g = ((i + s) % 2 ? 1 : -1) * Math.sin(phase) * amp + (jitter ? Math.sin(phase * 1.7 + i * 1.3 + s * 2.1) * jitter : 0);
        var a = (L.a + g) * Math.PI / 180;
        var ox = 30 + side * 1.2, oy = 1.2;
        var kx = ox + side * Math.cos(a) * L.f, ky = oy + Math.sin(a) * L.f - 4.5;        /* high knees */
        var bend = a + (i < 2 ? -0.2 : 0.55);
        var fx = kx + side * Math.cos(bend) * L.t * 0.5, fy = ky + Math.abs(Math.sin(bend + 0.9)) * L.t;
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
    if (t.left > h.left) return (t.left - lr.left) - 24;                 /* image on the right: 24 px before it */
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
    var t0 = null, D = 2200, H = 2600, U = 1700;
    drawLegs(0, 0, 0);
    function frame(t) {
      if (!t0) t0 = t;
      var e = t - t0, y, sway = 0, phase, amp, jit = 0;
      if (e < D) { var k = e / D; y = drop * (1 - Math.pow(1 - k, 3)); phase = e / 55; amp = 0; jit = 5 * (1 - k * 0.6); }          /* a light wiggle on the way down */
      else if (e < D + H) { var h = (e - D) / H; y = drop; sway = Math.sin((e - D) / 320) * 2 * (1 - h); phase = (e - D) / 90; amp = 0; jit = 3 * Math.max(0, Math.sin(h * Math.PI * 3)); }   /* twitches */
      else if (e < D + H + U) { var u = (e - D - H) / U; y = drop * (1 - u * u * (3 - 2 * u)); phase = e / 75; amp = 16; }        /* climbing */
      else { sp.setAttribute('transform', 'translate(0,-30)'); silk.setAttribute('y2', 0); host.remove(); setTimeout(cycle, 20000 + Math.random() * 20000); return; }
      silk.setAttribute('x2', 30 + sway); silk.setAttribute('y2', Math.max(0, y - 1));   /* the thread starts under the line and touches it */
      sp.setAttribute('transform', 'translate(' + sway + ',' + y + ')');
      drawLegs(phase, amp, jit);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  sp.setAttribute('transform', 'translate(0,-30)');
  setTimeout(cycle, 1500 + Math.random() * 2500);
})();
