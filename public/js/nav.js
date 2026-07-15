(function () {
  var toggle = document.getElementById("nav-toggle");
  var panel = document.getElementById("site-nav-panel");
  if (!toggle || !panel) return;

  var openLabel = "Open menu";
  var closeLabel = "Close menu";

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? closeLabel : openLabel);
    document.body.classList.toggle("nav-open", open);
  }

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  toggle.addEventListener("click", function () {
    setOpen(!isOpen());
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
    if (e.matches) setOpen(false);
  });
})();
