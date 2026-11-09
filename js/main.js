// === Homepage ===
(function () {
  var ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>';
  var ICON_LINKEDIN = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.41-2.08 2.86V21h-4V9z"/></svg>';
  var ICON_SCHOLAR = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 1 9.5l4 2.36V17c0 2 3.13 4 7 4s7-2 7-4v-5.14l2-1.18V16h2V9.5L12 3zm0 2.32L19.3 9.5 12 13.68 4.7 9.5 12 5.32zM7 13.04l5 2.95 5-2.95V17c0 .6-1.9 2-5 2s-5-1.4-5-2v-3.96z"/></svg>';
  var ICON_GITHUB = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.11.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.8 1.19 1.82 1.19 3.08 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>';

  var site = Store.getSite();
  var researches = UI.sortResearches(Store.getResearches());
  var members = Store.getMembers();
  var gallery = Store.getGallery();

  document.getElementById("siteIntro").textContent = site.intro || "";
  document.getElementById("brandName").textContent = site.title || "Research";
  document.title = (site.title || "Research") + " — Explainable AI for Food Safety";

  // ---------- Hero ----------
  var newCount = researches.filter(UI.isNew).length;
  var pillText = document.getElementById("heroPillText");
  if (newCount) {
    pillText.textContent = newCount + " new paper" + (newCount > 1 ? "s" : "") + " in " +
      researches.filter(UI.isNew).map(function (r) { return r.venueShort || r.venue; }).join(" & ");
  } else {
    document.querySelector("#heroPill .new").textContent = "LATEST";
    pillText.textContent = researches[0] ? (researches[0].venueShort || researches[0].venue) : "Publications";
  }
  document.getElementById("statPubs").dataset.count = researches.length;
  initRotator();

  function initRotator() {
    var el = document.getElementById("rotator");
    var words = ["in hours, not days.", "at the microcolony stage.", "with explainable AI.", "before outbreaks start."];
    if (UI.reduceMotion) return;
    var wi = 0, ci = words[0].length, deleting = true, hold = 2200;
    function tick() {
      var w = words[wi];
      if (deleting) {
        ci--;
        el.textContent = w.slice(0, ci) || "​";
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
        setTimeout(tick, 28);
      } else {
        var nw = words[wi];
        ci++;
        el.textContent = nw.slice(0, ci);
        if (ci >= nw.length) { deleting = true; setTimeout(tick, hold); }
        else setTimeout(tick, 55);
      }
    }
    setTimeout(tick, hold);
  }

  // ---------- Publications ----------
  var grid = document.getElementById("researchGrid");
  var filtersEl = document.getElementById("pubFilters");
  var searchEl = document.getElementById("pubSearch");
  var timelineEl = document.getElementById("pubTimeline");
  var state = { cat: "all", q: "" };

  grid.innerHTML = researches.length
    ? researches.map(renderResearchCard).join("") + '<div class="empty" id="pubEmpty" hidden>No publications match your search.</div>'
    : '<div class="empty">No research entries yet.</div>';

  // generated covers
  grid.querySelectorAll(".gen-cover canvas").forEach(function (cv) {
    UI.drawCover(cv, cv.dataset.seed, cv.dataset.accent === "violet" ? "rgba(157,140,255,1)" : "rgba(46,230,214,1)");
  });
  grid.querySelectorAll(".research-card").forEach(function (c) { UI.tilt(c, 5); });

  // filters
  var cats = (typeof RESEARCH_CATEGORIES !== "undefined" ? RESEARCH_CATEGORIES : []).filter(function (c) {
    return researches.some(function (r) { return r.category === c.key; });
  });
  filtersEl.innerHTML = chip("all", "All", researches.length, true) + cats.map(function (c) {
    return chip(c.key, c.label, researches.filter(function (r) { return r.category === c.key; }).length, false);
  }).join("") + chip("journal", "Journals", researches.filter(function (r) { return r.type === "Journal"; }).length, false);
  function chip(key, label, n, active) {
    return '<button class="chip' + (active ? " active" : "") + '" data-cat="' + key + '">' + escapeHtml(label) + '<span class="count">' + n + "</span></button>";
  }
  filtersEl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    filtersEl.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("active", x === b); });
    state.cat = b.dataset.cat;
    applyFilter();
  });
  searchEl.addEventListener("input", function () { state.q = searchEl.value.trim().toLowerCase(); applyFilter(); });

  function applyFilter() {
    var shown = 0;
    grid.querySelectorAll(".research-card").forEach(function (card) {
      var r = researches[Number(card.dataset.idx)];
      var okCat = state.cat === "all" || r.category === state.cat || (state.cat === "journal" && r.type === "Journal");
      var hay = (r.title + " " + r.authors + " " + r.venue + " " + (r.tags || []).join(" ") + " " + r.year).toLowerCase();
      var okQ = !state.q || state.q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
      var show = okCat && okQ;
      card.classList.toggle("hidden", !show);
      if (show) shown++;
    });
    var empty = document.getElementById("pubEmpty");
    if (empty) empty.hidden = shown > 0;
  }

  // timeline (oldest → newest, left to right)
  var chron = researches.slice().reverse();
  timelineEl.innerHTML = chron.map(function (r) {
    return '<div class="tl-node" data-id="' + escapeHtml(r.id) + '" tabindex="0" role="button">'
      + '<div class="tl-date">' + escapeHtml(UI.formatDate(r.date) || r.year) + " · " + escapeHtml(r.venueShort || "") + '</div>'
      + '<div class="tl-title">' + escapeHtml(shortTitle(r.title)) + '</div></div>';
  }).join("");
  timelineEl.querySelectorAll(".tl-node").forEach(function (n) {
    function go() {
      // reset filters so the card is visible, then scroll + flash it
      state.cat = "all"; state.q = ""; searchEl.value = "";
      filtersEl.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("active", x.dataset.cat === "all"); });
      applyFilter();
      var card = grid.querySelector('[data-id="' + n.dataset.id + '"]');
      if (!card) return;
      card.scrollIntoView({ behavior: UI.reduceMotion ? "auto" : "smooth", block: "center" });
      card.style.boxShadow = "0 0 0 2px var(--cyan), 0 0 50px -6px rgba(46,230,214,.7)";
      setTimeout(function () { card.style.boxShadow = ""; }, 1600);
    }
    n.addEventListener("click", go);
    n.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    n.addEventListener("mouseenter", function () { n.classList.add("active"); });
    n.addEventListener("mouseleave", function () { n.classList.remove("active"); });
  });

  function shortTitle(t) {
    var s = t.split(":")[0];
    if (s.length > 70) s = s.slice(0, 67) + "…";
    return s;
  }

  function renderResearchCard(r, idx) {
    var isNew = UI.isNew(r);
    var typeBadge = r.type === "Journal"
      ? '<span class="badge journal">JOURNAL</span>'
      : '<span class="badge conf">CONFERENCE</span>';
    var newBadge = isNew ? '<span class="badge new">NEW</span>' : "<span></span>";
    var cover;
    if (r.cover) {
      cover = '<img src="' + escapeHtml(r.cover) + '" alt="" loading="lazy">';
    } else {
      var m = (r.metrics && r.metrics[0]) || { value: r.year, label: "" };
      cover = '<div class="gen-cover"><canvas data-seed="' + escapeHtml(r.id) + '" data-accent="' + (idx % 2 ? "violet" : "cyan") + '"></canvas>'
        + '<div class="gen-metric grad-text">' + escapeHtml(m.value) + '<small>' + escapeHtml(m.label) + '</small></div></div>';
    }
    var metrics = (r.metrics || []).slice(0, 3).map(function (m) {
      return '<div class="card-metric"><b>' + escapeHtml(m.value) + '</b><span>' + escapeHtml(m.label) + "</span></div>";
    }).join("");
    var url = "research.html?id=" + encodeURIComponent(r.id);
    var pdfBtn = r.pdf ? '<a class="btn btn-ghost" href="' + escapeHtml(r.pdf) + '" target="_blank" rel="noopener">PDF</a>' : "";
    var doiBtn = r.doiUrl ? '<a class="btn btn-ghost" href="' + escapeHtml(r.doiUrl) + '" target="_blank" rel="noopener">DOI ↗</a>' : "";
    return '<article class="research-card" data-idx="' + idx + '" data-id="' + escapeHtml(r.id) + '">'
      + '<div class="cover"><div class="cover-badges">' + newBadge + typeBadge + "</div>" + cover + "</div>"
      + '<div class="body">'
      +   '<div class="meta">' + escapeHtml(r.venueShort || r.venue) + " · " + escapeHtml(UI.formatDate(r.date) || r.year) + "</div>"
      +   '<h3><a href="' + url + '">' + escapeHtml(r.title) + "</a></h3>"
      +   '<div class="authors">' + UI.highlightAuthors(r.authors) + "</div>"
      +   (metrics ? '<div class="card-metrics">' + metrics + "</div>" : "")
      +   '<div class="card-actions"><a class="btn btn-primary" href="' + url + '">Read more</a>' + pdfBtn + doiBtn + "</div>"
      + "</div></article>";
  }

  // ---------- Growth explorer ----------
  initGrowth();
  function initGrowth() {
    var stage = document.getElementById("growthStage");
    if (!stage) return;
    var FILES = {
      ecoli: { p: ["1_e2p_100", "3_e25p_03", "5_e3p_66", "7_e35p_90", "9_e4p_67"],
               o: ["2_e2o_52", "4_e25o_46", "6_e3o_32", "8_e35o_49", "10_e4o_87"] },
      salm:  { p: ["1_s2p_17", "3_s25p_19", "5_s3p_2", "7_s35p_37", "9_s4p_42"],
               o: ["2_s2o_40", "4_s25o_83", "6_s3o_16", "8_s35o_69", "10_s4o_75"] }
    };
    var DIR = { ecoli: "assets/phases/1.Data%20Collection/ecoli/", salm: "assets/phases/1.Data%20Collection/salmonella/" };
    var TIMES = ["2.0", "2.5", "3.0", "3.5", "4.0"];
    var DESCS = [
      "Early microcolonies are small and low-contrast — the hardest stage to detect, and the most valuable.",
      "Colonies begin to elongate and expand. Our detectors already identify them with high confidence.",
      "Clusters form and boundaries become clearer — segmentation masks trace their irregular shapes.",
      "Dense aggregation: neighbouring colonies start to touch, testing instance separation.",
      "Mature microcolonies — easy for humans, but detection is only useful if it happens earlier."
    ];
    var st = { sp: "ecoli", bg: "p", i: 0 };
    var range = document.getElementById("growthRange");
    var hud = document.getElementById("growthHud");
    var ticks = document.getElementById("growthTicks").children;
    var imgs = {};

    function key() { return st.sp + st.bg; }
    function ensureImgs() {
      var k = key();
      if (imgs[k]) return imgs[k];
      imgs[k] = FILES[st.sp][st.bg].map(function (f, i) {
        var im = new Image();
        im.alt = (st.sp === "ecoli" ? "E. coli" : "Salmonella") + " at " + TIMES[i] + " h";
        im.decoding = "async";
        im.src = DIR[st.sp] + f + ".png";
        stage.appendChild(im);
        return im;
      });
      return imgs[k];
    }
    function render() {
      var set = ensureImgs();
      stage.querySelectorAll("img").forEach(function (im) { im.classList.remove("on"); });
      set[st.i].classList.add("on");
      var spName = st.sp === "ecoli" ? "E. coli" : "Salmonella";
      hud.innerHTML = "<b>" + spName + "</b> · " + TIMES[st.i] + " h · " + (st.bg === "p" ? "plain" : "onion mixture");
      hud.classList.toggle("salm", st.sp === "salm");
      document.getElementById("growthTitle").textContent = TIMES[st.i] + " hours of incubation";
      document.getElementById("growthDesc").textContent = DESCS[st.i];
      range.value = st.i;
      range.style.setProperty("--pct", (st.i / 4 * 100) + "%");
      for (var t = 0; t < ticks.length; t++) ticks[t].classList.toggle("on", t === st.i);
    }
    range.addEventListener("input", function () { st.i = Number(range.value); stop(); render(); });
    bindSeg("growthSpecies", function (v) { st.sp = v; render(); });
    bindSeg("growthBg", function (v) { st.bg = v; render(); });

    var playBtn = document.getElementById("growthPlay"), timer = null;
    function stop() {
      clearInterval(timer); timer = null;
      playBtn.querySelector("span").textContent = "Play time-lapse";
      playBtn.querySelector("svg").innerHTML = '<path d="M7 5v14l12-7z"/>';
    }
    playBtn.addEventListener("click", function () {
      if (timer) return stop();
      playBtn.querySelector("span").textContent = "Pause";
      playBtn.querySelector("svg").innerHTML = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
      timer = setInterval(function () { st.i = (st.i + 1) % 5; render(); }, 1100);
    });
    render();
  }

  function bindSeg(id, onChange) {
    var root = document.getElementById(id);
    root.addEventListener("click", function (e) {
      var b = e.target.closest(".seg-btn");
      if (!b) return;
      root.querySelectorAll(".seg-btn").forEach(function (x) { x.classList.toggle("active", x === b); });
      onChange(b.dataset.v);
    });
  }

  // ---------- Results explorer ----------
  initExplorer();
  function initExplorer() {
    var host = document.getElementById("explorer");
    var sources = researches.filter(function (r) { return r.results; });
    if (!host) return;
    if (!sources.length) { host.style.display = "none"; return; }

    // Paper switcher (only shown when more than one paper has benchmark data)
    var picker = null;
    if (sources.length > 1) {
      picker = document.createElement("div");
      picker.className = "chip-filters explorer-picker";
      picker.innerHTML = sources.map(function (r, i) {
        return '<button class="chip' + (i === 0 ? " active" : "") + '" data-i="' + i + '">'
          + escapeHtml(r.shortName || shortTitle(r.title)) + '<span class="count">' + escapeHtml(r.venueShort || "") + "</span></button>";
      }).join("");
      host.parentNode.insertBefore(picker, host);
      picker.addEventListener("click", function (e) {
        var b = e.target.closest(".chip");
        if (!b) return;
        picker.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("active", x === b); });
        show(sources[Number(b.dataset.i)]);
      });
    }
    function show(src) {
      document.getElementById("explorerSub").innerHTML =
        "From <a href=\"research.html?id=" + encodeURIComponent(src.id) + "\">" + escapeHtml(shortTitle(src.title)) +
        "</a> (" + escapeHtml(src.venueShort || src.venue) + ", " + escapeHtml(src.year) + "). Pick a metric to re-rank every model we benchmarked.";
      UI.renderResultsChart(host, src.results, 2);
    }
    show(sources[0]);
  }

  // ---------- Team ----------
  var mgrid = document.getElementById("membersGrid");
  mgrid.innerHTML = members.length ? members.map(renderMemberCard).join("") : '<div class="empty">No team members yet.</div>';

  function renderMemberCard(m) {
    var initials = (m.name || "?").split(" ").map(function (p) { return p[0]; }).filter(Boolean).slice(0, 2).join("").toUpperCase();
    var photo = m.photo
      ? '<img src="' + escapeHtml(m.photo) + '" alt="' + escapeHtml(m.name) + '" loading="lazy">'
      : '<div class="initials">' + escapeHtml(initials) + "</div>";
    var surname = (m.name || "").split(" ").pop().toLowerCase();
    // totalPapers (e.g. from Google Scholar) overrides the count of papers listed on this site
    var nPubs = m.totalPapers || researches.filter(function (r) { return (r.authors || "").toLowerCase().indexOf(surname) >= 0; }).length;
    var links = [];
    if (m.email) links.push(linkBtn("mailto:" + m.email, ICON_MAIL, "Email " + m.name));
    if (m.linkedin) links.push(linkBtn(m.linkedin, ICON_LINKEDIN, "LinkedIn"));
    if (m.github) links.push(linkBtn(m.github, ICON_GITHUB, "GitHub"));
    if (m.scholar) links.push(linkBtn(m.scholar, ICON_SCHOLAR, "Google Scholar"));
    return '<div class="member-card">'
      + '<div class="member-photo">' + photo + "</div>"
      + '<div class="member-name">' + escapeHtml(m.name) + "</div>"
      + '<div class="member-role">' + escapeHtml(m.role || "") + "</div>"
      + '<div class="member-affil">' + escapeHtml(m.affiliation || "") + "</div>"
      + (nPubs ? '<div class="member-pubs">' + (m.scholar
          ? '<a href="' + escapeHtml(m.scholar) + '" target="_blank" rel="noopener" title="View on Google Scholar">' + nPubs + " paper" + (nPubs > 1 ? "s" : "") + " ↗</a>"
          : nPubs + " paper" + (nPubs > 1 ? "s" : "")) + "</div>" : "")
      + '<div class="member-links">' + links.join("") + "</div>"
      + "</div>";
  }
  function linkBtn(href, svg, label) {
    var ext = href.indexOf("mailto:") === 0 ? "" : ' target="_blank" rel="noopener"';
    return '<a href="' + escapeHtml(href) + '"' + ext + ' aria-label="' + escapeHtml(label) + '" title="' + escapeHtml(label) + '">' + svg + "</a>";
  }

  // ---------- Contact ----------
  document.getElementById("contactList").innerHTML = members.filter(function (m) { return m.email; }).map(function (m) {
    return '<a href="mailto:' + escapeHtml(m.email) + '">' + escapeHtml(m.name) + "<span>" + escapeHtml(m.email) + "</span></a>";
  }).join("");

  // ---------- Gallery ----------
  var ggrid = document.getElementById("galleryGrid");
  ggrid.innerHTML = gallery.length ? gallery.map(function (g) {
    return '<div class="gallery-item reveal" role="button" aria-label="Enlarge: ' + escapeHtml(g.caption || "") + '">'
      + '<img src="' + escapeHtml(g.src) + '" alt="' + escapeHtml(g.caption || "") + '" loading="lazy">'
      + '<div class="caption">' + escapeHtml(g.caption || "") + "</div></div>";
  }).join("") : '<div class="empty">No images yet.</div>';
  UI.bindLightbox(ggrid, ".gallery-item", function (n) {
    var img = n.querySelector("img");
    return { src: img.getAttribute("src"), caption: img.alt };
  });
})();
