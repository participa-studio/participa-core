/* ==========================================================
   PARTICIPA CORE — STUDIO HOVER: GRADED DOTS (11 Nov 2026)
   Studio only: switched on with participa.sdots: true in the site's _config.yml.

   Over every case card image (Experiments page and home page), plain round dots in white at 40%,
   (12 Nov: the growth now runs as a wave all the way to the opposite corner, then settles into the gradient)
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
  var NS = "http://www.w3.org/2000/svg", W = 300, H = 200, STEP = 20, RMAX = 9.5, RMIN = 0.6, SWEEP = 900;
  var params = new URLSearchParams(location.search), FORCE = params.get("on") !== null, FIXED = params.get("corner");
  var hoverable = window.matchMedia("(hover: hover)").matches;

  document.querySelectorAll(".home__case > img").forEach(function (img) {
    var frame = document.createElement("span");
    frame.className = "sdots";
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);

    var corner = FIXED || ["tl", "tr", "bl", "br"][Math.floor(Math.random() * 4)];
    var cx = corner.indexOf("r") > -1 ? W : 0, cy = corner.indexOf("b") > -1 ? H : 0;
    var maxD = Math.hypot(W, H), html = "";
    for (var y = STEP / 2; y < H + STEP; y += STEP) {
      for (var x = STEP / 2; x < W + STEP; x += STEP) {
        var t = Math.min(1, Math.hypot(x - cx, y - cy) / maxD);           // 0 at the corner, 1 at the far corner
        var r = RMIN + (RMAX - RMIN) * Math.pow(1 - t, 1.6);             // large near the corner, tiny far away
        if (r < 0.7) continue;
        // drawn at full size; the wave grows each dot to full size, then it settles to its graded size (--s)
        html += '<circle cx="' + x + '" cy="' + y + '" r="' + RMAX + '" style="--d:' + Math.round(t * SWEEP) + 'ms;--s:' + (r / RMAX).toFixed(3) + '"/>';
      }
    }
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = html;
    frame.appendChild(svg);

    if (FORCE) { frame.classList.add("is-on"); return; }
    var link = frame.closest(".home__case") || frame;
    if (hoverable) {
      link.addEventListener("pointerenter", function () { frame.classList.remove("is-leaving"); frame.classList.add("is-on"); });
      link.addEventListener("pointerleave", function () { frame.classList.add("is-leaving"); frame.classList.remove("is-on"); });
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es, io) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-on"); io.unobserve(e.target); } });
      }, { threshold: 0.6 }).observe(frame);
    }
  });
})();
