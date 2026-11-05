/* ==========================================================
   PARTICIPA CORE — SWAP TO THE SISTER SITE (a hint of a roll)
   When you click the sister logo, it starts rolling left and fades out
   halfway, while the rest of the header fades. It never reaches the other
   end, so there is no landing to match: the movement only points the way.
   Then the sister site opens normally: no second roll on arrival.
   A rolling logo turns by the distance it travels divided by its radius,
   so it looks like a wheel, not a spinning coin.
   It rolls halfway across the header in 0.6 s on every screen; the next site
   only starts loading once it ends.
   Back button: browsers may show the page as it was left, frozen at the end
   of the roll; the reset below puts the header back.
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

  var DURATION = 600;
  var EASE = "cubic-bezier(.4,0,.7,1)";           // starts gently, keeps going
  var SHARE = 0.5;                                // halfway across the header, on every screen
  var running = [];

  function centre(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, w: r.width };
  }

  function reset() {
    running.forEach(function (a) { a.cancel(); });
    running = [];
  }

  sister.addEventListener("click", function (event) {
    // New tab or window: no roll, the browser handles it
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    var href = sister.href;

    var from = centre(sisterImg), to = centre(ownImg);
    var dx = (to.x - from.x) * SHARE;             // negative: rolling left
    var radius = from.w / 2;
    var turn = (dx / radius) * (180 / Math.PI);

    reset();
    header.querySelectorAll(
      ".site-header__name, .site-header__nav, .site-header__toggle, .site-header__sister > span, .site-header__home img"
    ).forEach(function (el) {
      running.push(el.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: DURATION * 0.6, fill: "forwards", easing: "ease-out" }));
    });
    var roll = sisterImg.animate([
      { transform: "translateX(0) rotate(0deg)", opacity: 1 },
      { transform: "translateX(" + (dx * 0.4) + "px) rotate(" + (turn * 0.4) + "deg)", opacity: 1, offset: 0.4 },
      { transform: "translateX(" + dx + "px) rotate(" + turn + "deg)", opacity: 0 }
    ], { duration: DURATION, easing: EASE, fill: "forwards" });
    running.push(roll);

    var gone = false;
    var go = function () { if (!gone) { gone = true; window.location.href = href; } };
    roll.onfinish = go;
    setTimeout(go, DURATION + 300);               // in case the animation is interrupted
  });

  // Coming back with the browser's back button: put the header back
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) reset();
  });
})();
