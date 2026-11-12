/* ==========================================================
   PARTICIPA CORE — STUDIO HOVER: GRADED DOTS (11 Nov 2026)
   Studio only: switched on with participa.sdots: true in the site's _config.yml.

   Over every case card image (Experiments page and home page), plain round dots in white at 40%,
   (12 Nov: one wave runs to the opposite corner and clears the image again; nothing stays behind)
   after a halftone gradient: large near one corner (almost touching), smaller and smaller towards
   the opposite corner. Computer: on hover the field grows in from that corner, dot after dot, with a
   small bounce; when the pointer leaves it shrinks back. Phone (no hover): it grows once as the card
   scrolls into view. The dot is half of the Participa 8: .design shows the whole 8, the Studio its parts.
   Light: the dots are set up once; CSS transitions do the rest. Reduced motion: no field.
   Test switches: ?on shows every field grown; ?corner=tl|tr|bl|br fixes the corner.
   Developed in preview/studio-dots.html.
   ========================================================== */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var NS = "http://www.w3.org/2000/svg", W = 300, H = 200, STEP = 20, RMAX = 8, RMIN = 0.6, SWEEP = 900;
  var params = new URLSearchParams(location.search), FORCE = params.get("on") !== null, FIXED = params.get("corner");
  // .design trial (11 Nov 2026): the diagonal 8 instead of the dot. On a site with sdots: "trial" the field runs only
  // with ?shape=8 in the address (goo.js then stands aside); on Studio, ?shape=8 shows the 8 too.
  var MODE = document.documentElement.getAttribute("data-sdots"), EIGHT = params.get("shape") === "8" || MODE === "8";
  if (MODE === "trial" && !EIGHT) return;
  var hoverable = window.matchMedia("(hover: hover)").matches;

  // One wave: restart the animation from the start, even if a wave is still running
  function play(frame) { frame.classList.remove("is-on"); void frame.offsetWidth; frame.classList.add("is-on"); }

  document.querySelectorAll(".home__case > img").forEach(function (img) {
    var frame = document.createElement("span");
    frame.className = "sdots";
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);

    var corner = FIXED || ["tl", "tr", "bl", "br"][Math.floor(Math.random() * 4)];
    var cx = corner.indexOf("r") > -1 ? W : 0, cy = corner.indexOf("b") > -1 ? H : 0;
    var maxD = Math.hypot(W, H), html = "";
    if (EIGHT) {
      // the 8 lies along the diagonal the wave travels on: two dots and a neck, drawn round (0,0)
      var a = (cx === 0) === (cy === 0) ? [-4.5, -4.5, 4.5, 4.5] : [4.5, -4.5, -4.5, 4.5];
      var sx = Math.sign(a[0] - a[2]), sy = Math.sign(a[1] - a[3]), n = 2.6 / Math.SQRT2;
      var neck = [[a[0] - n * sy, a[1] + n * sx], [a[2] - n * sy, a[3] + n * sx], [a[2] + n * sy, a[3] - n * sx], [a[0] + n * sy, a[1] - n * sx]]
        .map(function (q) { return q[0].toFixed(2) + "," + q[1].toFixed(2); }).join(" ");
      var mark = '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="4.6"/><circle cx="' + a[2] + '" cy="' + a[3] + '" r="4.6"/><polygon points="' + neck + '"/>';
    }
    for (var y = STEP / 2; y < H + STEP; y += STEP) {
      for (var x = STEP / 2; x < W + STEP; x += STEP) {
        var t = Math.min(1, Math.hypot(x - cx, y - cy) / maxD);           // 0 at the corner, 1 at the far corner
        var r = RMIN + (RMAX - RMIN) * Math.pow(1 - t, 1.6);             // large near the corner, tiny far away
        if (r < 0.7) continue;
        // drawn at full size; the wave grows each dot to full size, then it settles to its graded size (--s)
        var style = 'style="--d:' + Math.round(t * SWEEP) + 'ms;--s:' + (r / RMAX).toFixed(3) + '"';
        html += EIGHT ? '<g transform="translate(' + x + ' ' + y + ')"><g ' + style + '>' + mark + '</g></g>'
                      : '<circle cx="' + x + '" cy="' + y + '" r="' + RMAX + '" ' + style + '/>';
      }
    }
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = html;
    frame.appendChild(svg);

    if (FORCE) { play(frame); return; }
    var link = frame.closest(".home__case") || frame;
    if (hoverable) {
      // each hover sends one wave through; it clears itself, so leaving needs nothing (12 Nov 2026)
      link.addEventListener("pointerenter", function () { play(frame); });
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es, io) {
        es.forEach(function (e) { if (e.isIntersecting) play(e.target); });   // a wave each time the card scrolls into view
      }, { threshold: 0.6 }).observe(frame);
    }
  });
})();
