/* ==========================================================
   PARTICIPA CORE — CURRENT YEAR
   Fills every element marked data-current-year with the
   visitor's current year, e.g. in the footer copyright.
   The year typed in the HTML stays as a fallback for the
   rare visitor whose browser does not run scripts.
   ========================================================== */

document.querySelectorAll("[data-current-year]").forEach(function (el) {
  el.textContent = new Date().getFullYear();
});
