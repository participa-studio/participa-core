/* ==========================================================
   PARTICIPA CORE — PHOTO SLIDER BEHAVIOUR
   Adds arrows and one dot per slide to every .slider,
   keeps the active dot in step while swiping, and lets the
   keyboard's left/right keys move between photos.
   ========================================================== */

document.querySelectorAll(".slider").forEach(function (slider) {
  var track = slider.querySelector(".slider__track");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".slider__slide"));
  if (slides.length < 2) return;

  var arrow = function (dir, label, path) {
    var b = document.createElement("button");
    b.className = "slider__arrow";
    b.type = "button";
    b.setAttribute("aria-label", label);
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"/></svg>';
    b.addEventListener("click", function () { go(current + dir); });
    return b;
  };

  var controls = document.createElement("div");
  controls.className = "slider__controls";
  var prev = arrow(-1, "Previous photo", "M15 5l-7 7 7 7");
  var next = arrow(1, "Next photo", "M9 5l7 7-7 7");
  var dots = document.createElement("div");
  dots.className = "slider__dots";

  slides.forEach(function (slide, i) {
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", (i + 1) + " of " + slides.length);
    var d = document.createElement("button");
    d.className = "slider__dot";
    d.type = "button";
    d.setAttribute("aria-label", "Photo " + (i + 1));
    d.addEventListener("click", function () { go(i); });
    dots.appendChild(d);
  });

  controls.appendChild(prev);
  controls.appendChild(dots);
  controls.appendChild(next);
  slider.appendChild(controls);

  var current = 0;

  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
  }

  function update(i) {
    current = i;
    Array.prototype.forEach.call(dots.children, function (d, n) {
      d.setAttribute("aria-current", n === i ? "true" : "false");
    });
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
  }

  // Keep the dots in step with swiping and scrolling
  track.addEventListener("scroll", function () {
    var i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== current) update(i);
  }, { passive: true });

  // Keyboard: left/right arrows when the slider has focus
  slider.tabIndex = 0;
  slider.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { go(current + 1); e.preventDefault(); }
    if (e.key === "ArrowLeft")  { go(current - 1); e.preventDefault(); }
  });

  update(0);
});
