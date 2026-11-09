// === Shared UI behaviours for every page ===
// Header state, mobile nav, scroll progress, reveal-on-scroll, animated
// counters, lightbox, card tilt, scroll-spy, toast and generated cover art.

var UI = (function () {
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Header / nav ----------
  function initHeader() {
    var header = document.querySelector(".site-header");
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.appendChild(progress);

    var toTop = document.createElement("button");
    toTop.className = "to-top";
    toTop.setAttribute("aria-label", "Back to top");
    toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });
    document.body.appendChild(toTop);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
        if (header) header.classList.toggle("scrolled", y > 10);
        toTop.classList.toggle("show", y > 700);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var toggle = document.querySelector(".nav-toggle");
    if (toggle && header) {
      toggle.addEventListener("click", function () {
        var open = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      header.querySelectorAll(".nav-links a").forEach(function (a) {
        a.addEventListener("click", function () {
          header.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  // ---------- Theme (light default, dark optional, remembered) ----------
  var THEME_KEY = "site_theme";
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function applyTheme(theme, animate) {
    var root = document.documentElement;
    if (animate && !reduceMotion) {
      root.classList.add("theme-anim");
      setTimeout(function () { root.classList.remove("theme-anim"); }, 400);
    }
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#060a13" : "#f5f7fb");
    document.querySelectorAll(".theme-toggle").forEach(function (b) {
      b.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      b.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
  }
  function initTheme() {
    applyTheme(currentTheme(), false);
    document.querySelectorAll(".theme-toggle").forEach(function (b) {
      b.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
        applyTheme(next, true);
      });
    });
  }

  // ---------- Reveal on scroll ----------
  var revealObs = null;
  function observeReveal(root) {
    var els = (root || document).querySelectorAll(".reveal, .stagger, .race, [data-count]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add("in"); if (el.dataset.count) runCounter(el, true); });
      return;
    }
    if (!revealObs) {
      revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          if (e.target.dataset.count) runCounter(e.target);
          revealObs.unobserve(e.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    els.forEach(function (el) { if (!el.classList.contains("in")) revealObs.observe(el); });
  }

  // ---------- Counters ----------
  // <span data-count="14318" data-decimals="0" data-suffix=" h"></span>
  function runCounter(el, instant) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    function fmt(v) {
      var s = v.toFixed(dec);
      if (dec === 0) s = Number(s).toLocaleString("en-US");
      return prefix + s + suffix;
    }
    if (instant || reduceMotion) { el.textContent = fmt(target); return; }
    var dur = 1600, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- Scroll-spy ----------
  function initScrollSpy(linkSelector, activeClass) {
    var links = Array.prototype.slice.call(document.querySelectorAll(linkSelector));
    var map = [];
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var hash = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#")) : "";
      if (!hash || hash.length < 2) return;
      var page = href.split("#")[0];
      var here = location.pathname.split("/").pop() || "index.html";
      if (page && page !== here) return;
      var sec = document.querySelector(hash);
      if (sec) map.push({ a: a, sec: sec });
    });
    if (!map.length || !("IntersectionObserver" in window)) return;
    var visible = new Map();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible.set(e.target, e.isIntersecting ? e.intersectionRatio : 0); });
      var best = null, bestR = 0;
      map.forEach(function (m) { var r = visible.get(m.sec) || 0; if (r > bestR) { bestR = r; best = m; } });
      map.forEach(function (m) { m.a.classList.toggle(activeClass || "active", m === best); });
    }, { threshold: [0, .15, .3, .5, .7], rootMargin: "-80px 0px -35% 0px" });
    map.forEach(function (m) { obs.observe(m.sec); });
  }

  // ---------- Lightbox ----------
  var lb = null, lbItems = [], lbIndex = 0;
  function buildLightbox() {
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML =
      '<span class="lb-count"></span>' +
      '<button class="lb-btn lb-close" aria-label="Close">&times;</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous">&#8249;</button>' +
      '<button class="lb-btn lb-next" aria-label="Next">&#8250;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(lb);
    lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lb.querySelector(".lb-prev").addEventListener("click", function () { stepLightbox(-1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { stepLightbox(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); stepLightbox(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); stepLightbox(1); }
    }, true);
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) stepLightbox(dx > 0 ? -1 : 1);
      x0 = null;
    });
  }
  function renderLightbox() {
    var it = lbItems[lbIndex];
    var img = lb.querySelector("img");
    img.src = it.src;
    img.alt = it.caption || "";
    lb.querySelector("figcaption").textContent = it.caption || "";
    lb.querySelector(".lb-count").textContent = (lbIndex + 1) + " / " + lbItems.length;
    var multi = lbItems.length > 1;
    lb.querySelector(".lb-prev").style.display = multi ? "" : "none";
    lb.querySelector(".lb-next").style.display = multi ? "" : "none";
  }
  function openLightbox(items, index) {
    if (!lb) buildLightbox();
    lbItems = items; lbIndex = index || 0;
    renderLightbox();
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  }
  function stepLightbox(d) { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; renderLightbox(); }
  function closeLightbox() { lb.classList.remove("open"); document.body.style.overflow = ""; }

  // Bind a group: clicking any [selector] inside root opens the lightbox for that group.
  function bindLightbox(root, selector, getItem) {
    if (!root) return;
    var nodes = Array.prototype.slice.call(root.querySelectorAll(selector));
    var items = nodes.map(getItem);
    nodes.forEach(function (n, i) {
      n.setAttribute("tabindex", n.getAttribute("tabindex") || "0");
      n.addEventListener("click", function () { openLightbox(items, i); });
      n.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(items, i); } });
    });
  }

  // ---------- Card tilt + spotlight ----------
  function tilt(el, max) {
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    max = max || 6;
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", (px * 100) + "%");
      el.style.setProperty("--my", (py * 100) + "%");
      el.style.transform = "perspective(900px) rotateX(" + ((0.5 - py) * max) + "deg) rotateY(" + ((px - 0.5) * max) + "deg) translateY(-4px)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  }

  // ---------- Toast ----------
  var toastEl = null, toastT = null;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2000);
  }
  function copy(text) {
    function done() { toast("Copied to clipboard"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed"); }
      document.body.removeChild(ta);
    }
  }

  // ---------- Generated cover art ----------
  // Draws a stylised microscopy field (rod-shaped microcolonies with detection
  // boxes) for papers that do not have a figure to use as a cover.
  function seeded(seedStr) {
    var h = 2166136261;
    for (var i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
  }
  function drawCover(canvas, seed, accent) {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = rect.width || 400, h = rect.height || 225;
    canvas.width = w * dpr; canvas.height = h * dpr;
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    var rnd = seeded(seed);
    var bg = ctx.createRadialGradient(w * 0.7, h * 0.3, 10, w * 0.5, h * 0.5, w * 0.8);
    bg.addColorStop(0, "#14223a"); bg.addColorStop(1, "#070c16");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    // faint grid
    ctx.strokeStyle = "rgba(148,178,230,0.06)"; ctx.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 24) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
    for (var gy = 0; gy < h; gy += 24) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
    var n = 26;
    for (var i = 0; i < n; i++) {
      var x = rnd() * w, y = rnd() * h * 0.75, len = 10 + rnd() * 26, ang = rnd() * Math.PI, rad = 3 + rnd() * 2.5;
      var col = rnd() > 0.5 ? accent : "rgba(255,184,77,1)";
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.shadowColor = col; ctx.shadowBlur = 10;
      ctx.fillStyle = col.replace(/1\)$/, "0.75)");
      roundRect(ctx, -len / 2, -rad, len, rad * 2, rad); ctx.fill();
      ctx.restore();
      if (i % 5 === 0) {
        ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.setLineDash([]);
        var bw = len + 14, bh = len * 0.7 + 12;
        ctx.strokeRect(x - bw / 2, y - bh / 2, bw, bh);
      }
    }
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + r, y + h); ctx.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
  }

  // ---------- Results bar chart ----------
  // res = { title, note, metrics: [..], rows: [{ name, values: [..], baseline? }] }
  function renderResultsChart(host, res, defaultMetric) {
    var mi = res.defaultMetric != null ? res.defaultMetric : (defaultMetric == null ? 0 : defaultMetric);
    host.innerHTML =
      '<div class="explorer-head"><div><h3>' + escapeHtml(res.title) + '</h3><p>Pick a metric to re-rank · higher is better</p></div>'
      + '<div class="segmented">' + res.metrics.map(function (m, i) {
        return '<button class="seg-btn' + (i === mi ? " active" : "") + '" data-v="' + i + '">' + escapeHtml(m) + "</button>";
      }).join("") + "</div></div>"
      + '<div class="bars"></div><div class="axis-note"></div>';
    var bars = host.querySelector(".bars");
    // show values with the precision the paper reports (3 or 4 decimals)
    var dec = 3;
    res.rows.forEach(function (r) { r.values.forEach(function (v) {
      if (v != null) dec = Math.max(dec, Math.min(4, (String(v).split(".")[1] || "").length));
    }); });
    var note = host.querySelector(".axis-note");

    function draw() {
      var rows = res.rows.slice().sort(function (a, b) {
        var va = a.values[mi], vb = b.values[mi];
        if (va == null) return 1;
        if (vb == null) return -1;
        return vb - va;
      });
      var vals = rows.map(function (r) { return r.values[mi]; }).filter(function (v) { return v != null; });
      var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
      // zoomed axis so small differences between strong models stay visible
      var floor = Math.max(0, Math.floor((min - 0.08) * 20) / 20);
      bars.innerHTML = rows.map(function (r) {
        var v = r.values[mi];
        var pct = v == null ? 0 : Math.max(3, (v - floor) / (max - floor) * 100);
        var cls = "bar-row" + (r.baseline ? " baseline" : "") + (v === max ? " best" : "") + (v == null ? " na" : "");
        return '<div class="' + cls + '" title="' + escapeHtml(r.name) + ": " + (v == null ? "not reported" : v) + '">'
          + '<div class="bar-name">' + (v === max ? "★ " : "") + escapeHtml(r.name) + "</div>"
          + '<div class="bar-track"><div class="bar-fill" data-w="' + pct + '"></div></div>'
          + '<div class="bar-val">' + (v == null ? "—" : v.toFixed(dec)) + "</div></div>";
      }).join("");
      var fills = bars.querySelectorAll(".bar-fill");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { fills.forEach(function (f) { f.style.width = f.dataset.w + "%"; }); });
      });
      note.textContent = (res.note ? res.note + " " : "") + "Axis starts at " + floor.toFixed(2) + " to make differences visible.";
    }
    host.querySelector(".segmented").addEventListener("click", function (e) {
      var b = e.target.closest(".seg-btn");
      if (!b) return;
      this.querySelectorAll(".seg-btn").forEach(function (x) { x.classList.toggle("active", x === b); });
      mi = Number(b.dataset.v);
      draw();
    });
    // first draw when scrolled into view so the bars animate in
    if ("IntersectionObserver" in window && !reduceMotion) {
      var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { draw(); o.disconnect(); } }, { threshold: 0.2 });
      o.observe(host);
    } else draw();
  }

  // ---------- Helpers ----------
  function highlightAuthors(authors) {
    var names = (typeof TEAM_SURNAMES !== "undefined") ? TEAM_SURNAMES : [];
    return (authors || "").split(",").map(function (a) {
      var t = escapeHtml(a.trim());
      var isTeam = names.some(function (s) { return a.indexOf(s) >= 0; });
      return isTeam ? "<b>" + t + "</b>" : t;
    }).join(", ");
  }
  function formatDate(ym) {
    if (!ym) return "";
    var parts = ym.split("-");
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (parts[1] ? months[parseInt(parts[1], 10) - 1] + " " : "") + parts[0];
  }
  function isNew(r) {
    if (!r.date) return false;
    var p = r.date.split("-");
    var d = new Date(parseInt(p[0], 10), parseInt(p[1] || "1", 10) - 1, 1);
    return (Date.now() - d.getTime()) < 1000 * 60 * 60 * 24 * 200;
  }
  function sortResearches(list) {
    return list.slice().sort(function (a, b) { return (b.date || b.year || "").localeCompare(a.date || a.year || ""); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initTheme();
    observeReveal();
    initScrollSpy(".nav-links a");
  });

  return {
    reduceMotion: reduceMotion,
    theme: currentTheme,
    observeReveal: observeReveal,
    initScrollSpy: initScrollSpy,
    openLightbox: openLightbox,
    bindLightbox: bindLightbox,
    tilt: tilt,
    toast: toast,
    copy: copy,
    drawCover: drawCover,
    renderResultsChart: renderResultsChart,
    highlightAuthors: highlightAuthors,
    formatDate: formatDate,
    isNew: isNew,
    sortResearches: sortResearches
  };
})();
