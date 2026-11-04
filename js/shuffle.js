/* PARTICIPA CORE — RANDOM CASES ON THE HOME PAGE
   A list marked data-random="3" holds every case. On each visit this script
   picks that many at random, shows them in a random order and hides the rest.
   Without the script, the cases marked "featured" stay visible instead. */
(function () {
  document.querySelectorAll("[data-random]").forEach(function (list) {
    var count = parseInt(list.getAttribute("data-random"), 10) || 3;
    var items = Array.prototype.slice.call(list.children);
    // Fisher–Yates shuffle: every order is equally likely
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = items[i]; items[i] = items[j]; items[j] = t;
    }
    items.forEach(function (item, n) {
      item.hidden = n >= count;
      list.appendChild(item);
    });
  });
})();
