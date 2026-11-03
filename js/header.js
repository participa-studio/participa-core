/* ==========================================================
   PARTICIPA CORE — HEADER BEHAVIOUR
   One job for now: open and close the menu on mobile.
   It adds or removes the class "is-open" on the header;
   header.css decides what "open" looks like.
   ========================================================== */

document.querySelectorAll(".site-header").forEach(function (header) {
  var button = header.querySelector(".site-header__toggle");
  if (!button) return;

  button.addEventListener("click", function () {
    var open = header.classList.toggle("is-open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
});
