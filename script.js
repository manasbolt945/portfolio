(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const KEY = "theme";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function current() {
    const s = stored();
    if (s === "dark" || s === "light") return s;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (_) {}
  }

  const initial = stored();
  if (initial === "dark" || initial === "light") root.setAttribute("data-theme", initial);

  if (toggle) {
    toggle.addEventListener("click", function () {
      apply(current() === "dark" ? "light" : "dark");
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Reveal sections as they scroll into view.
  // Only sections animate; cards inside them stay visible so a lagging observer never hides content.
  const targets = document.querySelectorAll(".section");
  const revealAll = function () { targets.forEach(function (el) { el.classList.add("in"); }); };
  targets.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.01 });
    targets.forEach(function (el) { io.observe(el); });
    // Safety net: whatever the observer missed becomes visible shortly after load.
    setTimeout(revealAll, 1200);
  } else {
    revealAll();
  }
})();
