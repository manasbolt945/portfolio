(function () {
  const root = document.documentElement;
  const KEY = "theme";

  /* ---------- Theme (dark by default, light on request) ---------- */
  function stored() {
    try { return localStorage.getItem(KEY); } catch (_) { return null; }
  }
  function current() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  function apply(theme) {
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    try { localStorage.setItem(KEY, theme); } catch (_) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f6f8fb" : "#000000");
  }
  if (stored() === "light") apply("light");

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      apply(current() === "dark" ? "light" : "dark");
      requestAnimationFrame(positionIndicator);
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

  /* ---------- Download notification ---------- */
  // Pings the site's Worker, which emails the owner. sendBeacon survives the
  // navigation that the download link triggers. Fails silently everywhere else.
  function notifyDownload(where) {
    try {
      var data = JSON.stringify({
        location: where,
        page: location.pathname + location.search,
        referrer: document.referrer || ""
      });
      var blob = new Blob([data], { type: "application/json" });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/resume-download", blob);
      else fetch("/api/resume-download", { method: "POST", body: blob, keepalive: true });
    } catch (_) {}
  }

  /* ---------- Analytics events ---------- */
  // Named events so GA4 reports read clearly: resume_download, and social_click
  // with a label (linkedin / github / email) and where on the page it was clicked.
  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var where = (a.closest("section") && a.closest("section").id) ||
                (a.closest(".nav") ? "nav" : a.closest("footer") ? "footer" : "page");
    if (/\.pdf($|\?)/i.test(href)) {
      track("resume_download", { location: where });
      notifyDownload(where);
    } else if (/linkedin\.com/i.test(href)) {
      track("social_click", { network: "linkedin", location: where });
    } else if (/github\.com/i.test(href)) {
      track("social_click", { network: "github", location: where });
    } else if (/^mailto:/i.test(href)) {
      track("social_click", { network: "email", location: where });
    }
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Reveal on scroll ---------- */
  const groups = document.querySelectorAll(".section");
  const items = [];
  groups.forEach(function (section) {
    section.classList.add("reveal");
    items.push(section);
    const children = section.querySelectorAll(".card, .timeline > li, .marquee-row");
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

  /* ---------- Scroll spy with sliding glow indicator ---------- */
  const links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  const indicator = document.getElementById("navIndicator");
  let activeId = null;

  function positionIndicator() {
    if (!indicator) return;
    const a = links.find(function (l) { return l.classList.contains("active"); });
    if (!a) { indicator.classList.remove("on"); return; }
    indicator.style.left = a.offsetLeft + "px";
    indicator.style.width = a.offsetWidth + "px";
    indicator.classList.add("on");
  }

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    links.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
    positionIndicator();
  }

  function updateSpy() {
    if (!sections.length) return;
    const navH = document.querySelector(".nav").offsetHeight;
    // The section whose top has passed a line just under the nav wins; near the
    // bottom of the page the last section wins so Contact can become active.
    const line = window.scrollY + navH + window.innerHeight * 0.25;
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
    let currentId = null;
    if (atBottom) {
      currentId = sections[sections.length - 1].id;
    } else {
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= line) currentId = sections[i].id;
      }
    }
    if (currentId) setActive(currentId);
    else {
      activeId = null;
      links.forEach(function (a) { a.classList.remove("active"); });
      positionIndicator();
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { updateSpy(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { updateSpy(); positionIndicator(); });
  window.addEventListener("load", function () { updateSpy(); positionIndicator(); });
  updateSpy();

  /* ---------- Skills marquees ---------- */
  function buildMarquees() {
    const rows = document.querySelectorAll("#skillsMarquee .marquee-row");
    rows.forEach(function (row) {
      const label = row.getAttribute("data-label") || "";
      const skills = (row.getAttribute("data-skills") || "").split("|").filter(Boolean);
      row.innerHTML = "";
      const lab = document.createElement("span");
      lab.className = "marquee-label";
      lab.innerHTML = label;
      const vp = document.createElement("div");
      vp.className = "marquee-viewport";
      const track = document.createElement("div");
      track.className = "marquee-track";
      vp.appendChild(track);
      row.appendChild(lab);
      row.appendChild(vp);

      const makeSet = function (dup) {
        const frag = document.createDocumentFragment();
        skills.forEach(function (s) {
          const c = document.createElement("span");
          c.className = "chip" + (dup ? " dup" : "");
          c.textContent = s;
          frag.appendChild(c);
        });
        return frag;
      };

      // One set first, measure it, then repeat until it covers the viewport width,
      // then append an identical copy so translateX(-50%) loops without a seam.
      track.appendChild(makeSet(false));
      const vpWidth = vp.clientWidth || window.innerWidth;
      let setWidth = track.scrollWidth;
      let copies = 1;
      while (setWidth * copies < vpWidth + 80 && copies < 12) {
        track.appendChild(makeSet(true));
        copies++;
      }
      const half = track.scrollWidth;
      for (let i = 0; i < copies; i++) track.appendChild(makeSet(true));
      // Keep speed constant across rows: ~60px per second.
      row.style.setProperty("--dur", Math.max(18, Math.round(half / 60)) + "s");
    });
  }
  buildMarquees();
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildMarquees, 200);
  });
})();
