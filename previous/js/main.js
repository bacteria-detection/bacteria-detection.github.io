// === Main site behaviors ===
(function () {
  var ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>';
  var ICON_LINKEDIN = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.41-2.08 2.86V21h-4V9z"/></svg>';
  var ICON_GITHUB = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.11.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.8 1.19 1.82 1.19 3.08 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>';

  document.getElementById("year").textContent = new Date().getFullYear();

  var site = Store.getSite();
  var researches = Store.getResearches();
  var members = Store.getMembers();
  var gallery = Store.getGallery();

  document.getElementById("siteTitle").textContent = site.title || "";
  document.getElementById("siteTagline").textContent = site.tagline || "";
  document.getElementById("siteIntro").textContent = site.intro || "";
  document.getElementById("brandName").textContent = site.title || "Research";
  document.title = (site.title || "Research") + " — Showcase";

  var rgrid = document.getElementById("researchGrid");
  rgrid.innerHTML = researches.length
    ? researches.map(renderResearchCard).join("")
    : '<div class="empty">No research entries yet.</div>';

  var mgrid = document.getElementById("membersGrid");
  mgrid.innerHTML = members.length
    ? members.map(renderMemberCard).join("")
    : '<div class="empty">No team members yet.</div>';

  var ggrid = document.getElementById("galleryGrid");
  ggrid.innerHTML = gallery.length
    ? gallery.map(renderGalleryItem).join("")
    : '<div class="empty">No images yet.</div>';

  setupReveal();

  function setupReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { obs.observe(el); });
  }

  function renderResearchCard(r) {
    var tags = (r.tags || []).map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join("");
    var cover = r.cover ? '<img src="' + escapeHtml(r.cover) + '" alt="' + escapeHtml(r.title) + '" loading="lazy">' : "";
    var pdfBtn = r.pdf ? '<a class="btn btn-secondary" href="' + escapeHtml(r.pdf) + '" target="_blank" rel="noopener">Read PDF</a>' : "";
    var doiBtn = r.doiUrl ? '<a class="btn btn-secondary" href="' + escapeHtml(r.doiUrl) + '" target="_blank" rel="noopener">DOI</a>' : "";
    var venue = escapeHtml(r.venue || "");
    var yearMeta = r.year ? " · " + escapeHtml(r.year) : "";
    return '<article class="research-card">'
      + '<div class="cover">' + cover + '</div>'
      + '<div class="body">'
      +   '<div class="meta">' + venue + yearMeta + '</div>'
      +   '<h3>' + escapeHtml(r.title) + '</h3>'
      +   '<div class="authors">' + escapeHtml(r.authors || "") + '</div>'
      +   '<div class="tags">' + tags + '</div>'
      +   '<div class="actions">'
      +     '<a class="btn btn-primary" href="research.html?id=' + encodeURIComponent(r.id) + '">View details</a>'
      +     pdfBtn + doiBtn
      +   '</div>'
      + '</div>'
      + '</article>';
  }

  function renderMemberCard(m) {
    var initials = (m.name || "?").split(" ").map(function (p) { return p[0]; }).filter(Boolean).slice(0,2).join("").toUpperCase();
    var photo = m.photo
      ? '<img src="' + escapeHtml(m.photo) + '" alt="' + escapeHtml(m.name) + '">'
      : '<div class="initials">' + escapeHtml(initials) + '</div>';
    var links = [];
    if (m.email)    links.push(linkBtn("mailto:" + m.email, ICON_MAIL, "Email"));
    if (m.linkedin) links.push(linkBtn(m.linkedin, ICON_LINKEDIN, "LinkedIn"));
    if (m.github)   links.push(linkBtn(m.github, ICON_GITHUB, "GitHub"));
    return '<div class="member-card">'
      + '<div class="member-photo">' + photo + '</div>'
      + '<div class="member-body">'
      +   '<div class="member-name">' + escapeHtml(m.name) + '</div>'
      +   '<div class="member-role">' + escapeHtml(m.role || "") + '</div>'
      +   '<div class="member-affil">' + escapeHtml(m.affiliation || "") + '</div>'
      +   '<div class="member-links">' + links.join("") + '</div>'
      + '</div>'
      + '</div>';
  }

  function renderGalleryItem(g) {
    return '<div class="gallery-item">'
      + '<div class="thumb"><img src="' + escapeHtml(g.src) + '" alt="' + escapeHtml(g.caption || "") + '" loading="lazy"></div>'
      + '<div class="caption">' + escapeHtml(g.caption || "") + '</div>'
      + '</div>';
  }

  function linkBtn(href, svg, label) {
    return '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener" aria-label="' + label + '" title="' + label + '">' + svg + '</a>';
  }
})();
