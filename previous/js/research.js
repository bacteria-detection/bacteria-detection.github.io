// === Research detail page ===
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var researches = Store.getResearches();
  var r = null;
  for (var i = 0; i < researches.length; i++) {
    if (researches[i].id === id) { r = researches[i]; break; }
  }

  if (!r) {
    document.getElementById("rTitle").textContent = "Research not found";
    document.getElementById("rBody").innerHTML =
      '<p>The requested entry does not exist. <a href="index.html#research">Back to research</a>.</p>';
    return;
  }

  document.title = r.title + " — Research";
  document.getElementById("rTitle").textContent = r.title;
  var metaParts = [];
  if (r.venue) metaParts.push(r.venue);
  if (r.year)  metaParts.push(r.year);
  document.getElementById("rMeta").textContent = metaParts.join(" · ");
  document.getElementById("rAuthors").textContent = r.authors || "";
  document.getElementById("rAbstract").textContent = r.abstract || "";

  if (r.highlights && r.highlights.length) {
    document.getElementById("rHighlightsWrap").hidden = false;
    document.getElementById("rHighlights").innerHTML =
      r.highlights.map(function (h) { return "<li>" + escapeHtml(h) + "</li>"; }).join("");
  }

  if (r.figures && r.figures.length) {
    document.getElementById("rFiguresSection").hidden = false;
    document.getElementById("rFigures").innerHTML = r.figures.map(function (f, i) {
      return '<figure class="paper-figure">'
        + '<div class="fig-img"><img src="' + escapeHtml(f.src) + '" alt="Figure ' + (i+1) + '" loading="lazy"></div>'
        + '<figcaption><strong>Figure ' + (i+1) + '.</strong> ' + escapeHtml(f.caption || "") + '</figcaption>'
        + '</figure>';
    }).join("");
  }

  var tagsHtml = (r.tags || []).map(function (t) {
    return '<span class="tag">' + escapeHtml(t) + '</span>';
  }).join("");
  document.getElementById("rTags").innerHTML = tagsHtml || '<span class="meta">No tags.</span>';

  var resources = [];
  if (r.pdf) {
    resources.push('<a class="btn btn-primary" href="' + escapeHtml(r.pdf) + '" target="_blank" rel="noopener">Open PDF</a>');
  }
  if (r.doiUrl) {
    resources.push('<a class="btn btn-secondary" href="' + escapeHtml(r.doiUrl) + '" target="_blank" rel="noopener">DOI: ' + escapeHtml(r.doi || "") + '</a>');
  }
  document.getElementById("rResources").innerHTML =
    resources.join("") || '<span class="meta">No external links yet.</span>';
})();
