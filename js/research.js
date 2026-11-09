// === Research detail page ===
(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var researches = UI.sortResearches(Store.getResearches());
  var r = researches.filter(function (x) { return x.id === id; })[0];

  if (!r) {
    document.getElementById("rTitle").textContent = "Research not found";
    document.querySelector(".detail-layout").innerHTML =
      '<p class="lead">The requested entry does not exist. <a href="index.html#research">Back to all publications</a>.</p>';
    return;
  }

  document.title = r.title.split(":")[0] + " — Bacterial Detection Research";

  // ---------- Hero ----------
  var badges = [];
  if (UI.isNew(r)) badges.push('<span class="badge new">NEW</span>');
  badges.push(r.type === "Journal" ? '<span class="badge journal">JOURNAL ARTICLE</span>' : '<span class="badge conf">CONFERENCE PAPER</span>');
  var cat = (RESEARCH_CATEGORIES || []).filter(function (c) { return c.key === r.category; })[0];
  if (cat) badges.push('<span class="badge">' + escapeHtml(cat.label.toUpperCase()) + "</span>");
  document.getElementById("rBadges").innerHTML = badges.join("");

  document.getElementById("rTitle").textContent = r.title;
  var meta = [r.venue];
  if (r.volume) meta.push("Vol. " + r.volume + (r.issue ? " (" + r.issue + ")" : ""));
  if (r.pages) meta.push(r.pages);
  meta.push(UI.formatDate(r.date) || r.year);
  document.getElementById("rMeta").textContent = meta.filter(Boolean).join(" · ");
  document.getElementById("rAuthors").innerHTML = UI.highlightAuthors(r.authors);

  document.getElementById("rMetrics").innerHTML = (r.metrics || []).map(function (m) {
    return '<div class="metric-tile reveal"><b>' + escapeHtml(m.value) + "</b><span>" + escapeHtml(m.label) + "</span></div>";
  }).join("");

  // ---------- Abstract (collapsible) ----------
  var absWrap = document.getElementById("rAbstractWrap");
  document.getElementById("rAbstract").textContent = r.abstract || "";
  if ((r.abstract || "").length > 900) {
    absWrap.classList.add("collapsed");
    var more = document.createElement("button");
    more.className = "read-more";
    more.textContent = "Read full abstract ↓";
    more.addEventListener("click", function () {
      var c = absWrap.classList.toggle("collapsed");
      more.textContent = c ? "Read full abstract ↓" : "Show less ↑";
    });
    absWrap.appendChild(more);
  }

  // ---------- Highlights ----------
  if (r.highlights && r.highlights.length) {
    document.getElementById("rHighlightsWrap").hidden = false;
    document.getElementById("rHighlights").innerHTML = r.highlights.map(function (h) { return "<li>" + escapeHtml(h) + "</li>"; }).join("");
    document.getElementById("rHighlights").classList.add("stagger");
  }

  // ---------- Benchmark chart ----------
  if (r.results) {
    document.getElementById("rChartWrap").hidden = false;
    UI.renderResultsChart(document.getElementById("rChart"), r.results, 2);
  }

  // ---------- Figures ----------
  if (r.figures && r.figures.length) {
    document.getElementById("rFiguresSection").hidden = false;
    var figs = document.getElementById("rFigures");
    figs.innerHTML = r.figures.map(function (f, i) {
      return '<figure class="paper-figure" role="button" aria-label="Enlarge figure ' + (i + 1) + '">'
        + '<div class="fig-img"><img src="' + escapeHtml(f.src) + '" alt="Figure ' + (i + 1) + '" loading="lazy"></div>'
        + "<figcaption><strong>Figure " + (i + 1) + ".</strong> " + escapeHtml(f.caption || "") + "</figcaption>"
        + "</figure>";
    }).join("");
    UI.bindLightbox(figs, ".paper-figure", function (n, i) {
      return { src: r.figures[i].src, caption: "Figure " + (i + 1) + ". " + (r.figures[i].caption || "") };
    });
  }

  // ---------- Citation ----------
  var authorsList = (r.authors || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  function apaName(full) {
    var parts = full.split(/\s+/);
    var last = parts.pop();
    return last + ", " + parts.map(function (p) { return p.replace(/\.$/, "")[0] + "."; }).join(" ");
  }
  function apa() {
    var names = authorsList.map(apaName);
    var a = names.length > 1 ? names.slice(0, -1).join(", ") + ", & " + names[names.length - 1] : names[0];
    var venue = r.venue.replace(/\s*\((MDPI|Elsevier)\)\s*$/, "");
    var s = a + " (" + r.year + "). " + r.title + ". " + venue;
    if (r.volume) s += ", " + r.volume + (r.issue ? "(" + r.issue + ")" : "");
    if (r.pages) s += ", " + r.pages;
    s += ".";
    if (r.doi) s += " https://doi.org/" + r.doi;
    return s;
  }
  function bibtex() {
    var key = (authorsList[0] || "anon").split(/\s+/).pop().toLowerCase() + r.year + (r.title.split(/\W+/)[0] || "").toLowerCase();
    var isJ = r.type === "Journal";
    var venue = r.venue.replace(/\s*\((MDPI|Elsevier)\)\s*$/, "");
    var lines = ["@" + (isJ ? "article" : "inproceedings") + "{" + key + ","];
    lines.push("  title     = {" + r.title + "},");
    lines.push("  author    = {" + authorsList.join(" and ") + "},");
    lines.push("  " + (isJ ? "journal  " : "booktitle") + " = {" + venue + "},");
    lines.push("  year      = {" + r.year + "},");
    if (r.volume) lines.push("  volume    = {" + r.volume + "},");
    if (r.issue) lines.push("  number    = {" + r.issue + "},");
    if (r.pages) lines.push("  pages     = {" + r.pages + "},");
    if (r.doi) lines.push("  doi       = {" + r.doi + "},");
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, "");
    lines.push("}");
    return lines.join("\n");
  }
  var citeEl = document.getElementById("rCite");
  var fmt = "apa";
  function renderCite() { citeEl.textContent = fmt === "apa" ? apa() : bibtex(); }
  document.querySelectorAll(".cite-tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".cite-tabs button").forEach(function (x) { x.classList.toggle("active", x === b); });
      fmt = b.dataset.fmt;
      renderCite();
    });
  });
  document.getElementById("rCopyCite").addEventListener("click", function () { UI.copy(citeEl.textContent); });
  renderCite();

  // ---------- Tags ----------
  document.getElementById("rTags").innerHTML = (r.tags || []).map(function (t) {
    return '<a class="tag" href="index.html#research">' + escapeHtml(t) + "</a>";
  }).join("") || '<span class="meta">No tags.</span>';

  // ---------- Resources ----------
  var res = [];
  if (r.pdf) res.push('<a class="btn btn-primary" href="' + escapeHtml(r.pdf) + '" target="_blank" rel="noopener">Open PDF</a>');
  if (r.doiUrl) res.push('<a class="btn btn-' + (r.pdf ? "ghost" : "primary") + '" href="' + escapeHtml(r.doiUrl) + '" target="_blank" rel="noopener">Read at publisher ↗</a>');
  document.getElementById("rResources").innerHTML = res.join("");
  document.getElementById("rShare").addEventListener("click", function () {
    var data = { title: r.title, url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else UI.copy(location.href);
  });

  // ---------- Related ----------
  var related = researches.filter(function (x) { return x.id !== r.id; })
    .sort(function (a, b) { return (b.category === r.category) - (a.category === r.category); })
    .slice(0, 3);
  if (related.length) {
    document.getElementById("rRelatedWrap").hidden = false;
    document.getElementById("rRelated").innerHTML = related.map(function (x) {
      return '<a class="related-card" href="research.html?id=' + encodeURIComponent(x.id) + '"><small>'
        + escapeHtml((x.venueShort || x.venue) + " · " + x.year) + "</small><div>" + escapeHtml(x.title.split(":")[0]) + "</div></a>";
    }).join("");
  }

  // ---------- Table of contents ----------
  var toc = document.getElementById("rToc");
  var heads = Array.prototype.slice.call(document.querySelectorAll("#rBody h2")).filter(function (h) {
    return !h.closest("[hidden]");
  });
  heads.forEach(function (h, i) { if (!h.id) h.id = "sec-" + i; });
  toc.innerHTML = heads.map(function (h) { return '<a href="#' + h.id + '">' + escapeHtml(h.textContent) + "</a>"; }).join("");
  UI.initScrollSpy("#rToc a");
})();
