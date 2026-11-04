/* ==========================================================
   PARTICIPA CORE — HEADER BEHAVIOUR
   Opens and closes the menu on mobile.
   It adds or removes the class "is-open" on the header;
   header.css decides what "open" looks like.
   The open menu closes when you:
   - tap the menu button again
   - tap or click anywhere outside the menu
   - choose a link in the menu (also for links within the page, like Work ↓)
   - press Escape (the keyboard focus goes back to the menu button)
   ========================================================== */

document.querySelectorAll(".site-header").forEach(function (header) {
  var button = header.querySelector(".site-header__toggle");
  var nav = header.querySelector(".site-header__nav");
  if (!button) return;

  function setOpen(open) {
    header.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function isOpen() {
    return header.classList.contains("is-open");
  }

  button.addEventListener("click", function () {
    setOpen(!isOpen());
  });

  // Outside the menu panel and outside the button: close
  document.addEventListener("click", function (event) {
    if (!isOpen()) return;
    if (button.contains(event.target)) return;
    if (nav && nav.contains(event.target)) return;
    setOpen(false);
  });

  // A link inside the menu: close
  if (nav) {
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
  }

  // Escape: close and give the focus back to the button
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      button.focus();
    }
  });
});
