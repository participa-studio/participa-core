/* ==========================================================
   PARTICIPA CORE — HOME BUTTONS ON ONE LINE
   The home buttons stay on a single line. When the screen is too narrow
   for all of them, the last ones (About) are hidden instead of wrapping
   to a second line; they stay reachable through the menu.
   Checked again whenever the window is resized.
   ========================================================== */
(function () {
  var list = document.querySelector(".home__actions");
  if (!list) return;
  var items = Array.prototype.slice.call(list.children);
  if (items.length < 2) return;

  function fit() {
    items.forEach(function (li) { li.hidden = false; });
    var top = items[0].offsetTop;
    // Hide from the end (About first) until every visible button is on line one
    for (var i = items.length - 1; i > 0; i--) {
      var wraps = items.some(function (li) { return !li.hidden && li.offsetTop > top; });
      if (!wraps) break;
      items[i].hidden = true;
    }
  }

  fit();
  window.addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
