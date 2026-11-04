/* ==========================================================
   PARTICIPA CORE — SWAP BETWEEN SISTER SITES
   Two halves of one movement, because the browser cannot animate
   across two domains:
   1. Leaving: the sister logo rolls left across the header to the place
      of the own logo, growing to its size; the rest of the header fades.
      Then the sister site opens, with ?via=roll in its address.
   2. Arriving: the own logo starts on the right, where the sister logo
      was clicked, and rolls into its place; name and menu fade in.
   A rolling logo turns by the distance it travels divided by its radius,
   so it looks like a wheel, not a spinning coin.
   With "reduce motion" switched on, nothing moves: the page simply changes.
   ========================================================== */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");
  if (!header || reduce || !header.animate) return;

  var sister = header.querySelector(".site-header__sister");
  var sisterImg = sister && sister.querySelector("img");
  var home = header.querySelector(".site-header__home");
  var ownImg = home && home.querySelector("img");
  if (!sister || !sisterImg || !ownImg) return;

  var DURATION = 900;
  var EASE = "cubic-bezier(.45,.05,.35,1)";

  function centre(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
  }
  function roll(distance, radius) {
    return (distance / radius) * (180 / Math.PI);
  }
  // Everything in the header except the moving logo
  function others(except) {
    return Array.prototype.filter.call(header.querySelectorAll(
      ".site-header__name, .site-header__nav, .site-header__toggle, .site-header__sister > span, .site-header__home img, .site-header__sister img"
    ), function (el) { return el !== except; });
  }

  /* ---------- 1. Leaving ---------- */
  sister.addEventListener("click", function (event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    var href = sister.href;

    var from = centre(sisterImg), to = centre(ownImg);
    var dx = to.x - from.x;               // negative: rolling left
    var scale = to.w / from.w;
    var radius = (from.w + to.w) / 4;      // average radius while growing

    others(sisterImg).forEach(function (el) {
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DURATION * 0.4, fill: "forwards", easing: "ease-out" });
    });
    var anim = sisterImg.animate([
      { transform: "translateX(0) rotate(0deg) scale(1)" },
      { transform: "translateX(" + dx + "px) rotate(" + roll(dx, radius) + "deg) scale(" + scale + ")" }
    ], { duration: DURATION, easing: EASE, fill: "forwards" });

    var go = function () {
      var url = new URL(href);
      url.searchParams.set("via", "roll");
      window.location.href = url.toString();
    };
    anim.onfinish = go;
    setTimeout(go, DURATION + 400);       // in case the animation is interrupted
  });

  /* ---------- 2. Arriving ---------- */
  var params = new URLSearchParams(window.location.search);
  if (params.get("via") === "roll") {
    params.delete("via");
    var clean = window.location.pathname + (params.toString() ? "?" + params.toString() : "") + window.location.hash;
    history.replaceState(null, "", clean);

    var start = centre(sisterImg), end = centre(ownImg);
    var dx2 = start.x - end.x;            // positive: starts on the right
    var scale2 = start.w / end.w;
    var radius2 = (start.w + end.w) / 4;

    header.classList.add("is-arriving");
    ownImg.animate([
      { transform: "translateX(" + dx2 + "px) rotate(" + roll(dx2, radius2) + "deg) scale(" + scale2 + ")" },
      { transform: "translateX(0) rotate(0deg) scale(1)" }
    ], { duration: DURATION, easing: EASE, fill: "backwards" });
    others(ownImg).forEach(function (el) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION * 0.5, delay: DURATION * 0.6, fill: "backwards", easing: "ease-in" });
    });
    setTimeout(function () { header.classList.remove("is-arriving"); }, DURATION * 1.2);
  }
})();
