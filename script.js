(function () {
  const root = document.documentElement;
  const KEY = "theme";

  /* ---------- Theme ---------- */
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

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      apply(current() === "dark" ? "light" : "dark");
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  function setMenu(open) {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      setMenu(!navLinks.classList.contains("open"));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    document.addEventListener("click", function (e) {
      if (navLinks.classList.contains("open") && !e.target.closest(".nav")) setMenu(false);
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Reveal on scroll ---------- */
  // Sections fade in, and the cards / timeline rows inside each one follow with a short stagger.
  // A timed fallback guarantees nothing stays hidden if the observer never fires.
  const groups = document.querySelectorAll(".section");
  const items = [];
  groups.forEach(function (section) {
    section.classList.add("reveal");
    items.push(section);
    const children = section.querySelectorAll(".card, .timeline > li");
    children.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.setProperty("--i", String(Math.min(i, 6)));
      items.push(el);
    });
  });
  const revealAll = function () { items.forEach(function (el) { el.classList.add("in"); }); };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(revealAll, 1500);
  } else {
    revealAll();
  }

  /* ---------- Active nav link ---------- */
  const links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
  }
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
