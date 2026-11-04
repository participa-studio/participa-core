/* PARTICIPA CORE — ROTATING QUOTES
   Finds every [data-quotes] block with two or more quotes,
   shows one at a time and moves to the next every 8 seconds.
   Pauses while the pointer is over it or while it has keyboard focus.
   With "reduce motion" switched on, it does not move by itself;
   the dots still let people pick a quote. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-quotes]").forEach(function (box) {
    var items = Array.prototype.slice.call(box.querySelectorAll(".quote"));
    if (items.length < 2) return;

    var current = 0, timer = null, paused = false;
    box.classList.add("is-rotating");

    var dots = document.createElement("ul");
    dots.className = "quotes__dots";
    items.forEach(function (item, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Quote " + (i + 1) + " of " + items.length);
      b.addEventListener("click", function () { show(i); restart(); });
      li.appendChild(b);
      dots.appendChild(li);
    });
    box.parentNode.insertBefore(dots, box.nextSibling);
    var buttons = dots.querySelectorAll("button");

    function show(i) {
      current = (i + items.length) % items.length;
      items.forEach(function (item, j) {
        var on = j === current;
        item.classList.toggle("is-active", on);
        item.setAttribute("aria-hidden", on ? "false" : "true");
        buttons[j].setAttribute("aria-current", on ? "true" : "false");
      });
    }
    function restart() {
      clearInterval(timer);
      if (reduce) return;
      timer = setInterval(function () { if (!paused) show(current + 1); }, 8000);
    }

    [box, dots].forEach(function (el) {
      el.addEventListener("mouseenter", function () { paused = true; });
      el.addEventListener("mouseleave", function () { paused = false; });
      el.addEventListener("focusin", function () { paused = true; });
      el.addEventListener("focusout", function () { paused = false; });
    });

    show(0);
    // switch the fades on only after the first quote is drawn
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { box.classList.add("is-ready"); });
    });
    restart();
  });
})();
