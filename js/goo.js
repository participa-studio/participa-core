/* ==========================================================
   PARTICIPA CORE — CONNECTED DOTS OVER CASE IMAGES (11 Nov 2026, simple version)
   .design only: switched on with participa.goo: true in the site's _config.yml.

   Along the edges of every case card image (Work page and home page), diagonal Participa 8s
   in white at 40% appear one after the other from one of the four corners, stay briefly and fade
   out again, so a short wave passes around the frame about every 24 s, as a hint. The middle of the
   photo stays clear. Each card has its own corner and its own moment. Hovering a card makes the wave
   run 6 times faster.

   Light: the shapes are set up once (one shared 8, reused); the browser runs the timing with CSS
   animations, so no script runs while it plays. Each 8 is plain filled shapes (two dots and a neck),
   which every browser draws the same way.

   Test switch: ?corner=tl|tr|bl|br fixes the corner. Reduced motion: no pattern.
   Developed in preview/simple.html. Earlier versions are in the design-history archive.
   ========================================================== */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (new URLSearchParams(location.search).get("shape") === "8") return;   // trial: js/sdots.js draws the graded 8s instead
  var NS = "http://www.w3.org/2000/svg";
  var W = 300, H = 200;          // drawing units; the pattern covers the card like "object-fit: cover"
  var STEP = 18;                 // grid spacing of the 8s
  var DUR = 24;                  // seconds for one wave on its own (also set in home.css)
  var SWEEP = 0.5;               // share of the cycle the wave takes to travel from corner to corner
  var MARGIN = 26;               // how far in from the edge the 8s reach before thinning out
  var FIXED = new URLSearchParams(location.search).get("corner");

  document.querySelectorAll(".home__case > img").forEach(function (img) {
    // a frame that holds the image and the pattern
    var frame = document.createElement("span");
    frame.className = "goo-card";
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);

    var corner = FIXED || ["tl", "tr", "bl", "br"][Math.floor(Math.random() * 4)];
    var cx = corner.indexOf("r") > -1 ? W : 0, cy = corner.indexOf("b") > -1 ? H : 0;
    // the 8 lies along the diagonal it travels on
    var a = (cx === 0) === (cy === 0) ? [-4.5, -4.5, 4.5, 4.5] : [4.5, -4.5, -4.5, 4.5];
    var sx = Math.sign(a[0] - a[2]), sy = Math.sign(a[1] - a[3]), n = 2.6 / Math.SQRT2;
    var neck = [[a[0] - n * sy, a[1] + n * sx], [a[2] - n * sy, a[3] + n * sx], [a[2] + n * sy, a[3] - n * sx], [a[0] + n * sy, a[1] - n * sx]];
    var id = "dots8-" + Math.random().toString(36).slice(2, 8);

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    var html = '<defs><g id="' + id + '"><circle cx="' + a[0] + '" cy="' + a[1] + '" r="4.6"/><circle cx="' + a[2] + '" cy="' + a[3] + '" r="4.6"/>' +
      '<polygon points="' + neck.map(function (q) { return q[0].toFixed(2) + "," + q[1].toFixed(2); }).join(" ") + '"/></g></defs>';

    var start = -Math.random() * DUR;                   // each card at its own moment
    var maxD = Math.hypot(W, H);
    for (var y = STEP / 2; y < H + STEP; y += STEP) {
      for (var x = STEP / 2; x < W + STEP; x += STEP) {
        // only near the edges: certain within a narrow margin, thinning out towards the middle
        var edge = Math.min(x, W - x, y, H - y);
        if (Math.random() > Math.max(0, Math.min(1, 1.4 - edge / MARGIN))) continue;
        var t = Math.hypot(x - cx, y - cy) / maxD + (Math.random() - 0.5) * 0.04;   // nearer the corner = earlier
        var delay = start + t * SWEEP * DUR - DUR;
        html += '<use href="#' + id + '" x="' + x + '" y="' + y + '" style="animation-delay:' + delay.toFixed(2) + 's"/>';
      }
    }
    svg.innerHTML = html;
    frame.appendChild(svg);

    // Hover: the wave runs 6 times faster (no jump, it keeps its place)
    var link = frame.closest(".home__case") || frame;
    function rate(r) { svg.getAnimations({ subtree: true }).forEach(function (an) { an.playbackRate = r; }); }
    link.addEventListener("pointerenter", function () { rate(6); });
    link.addEventListener("pointerleave", function () { rate(1); });
  });
})();
