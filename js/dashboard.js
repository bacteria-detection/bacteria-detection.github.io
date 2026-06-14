// === Dashboard ===

(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const loginView = document.getElementById("loginView");
  const dashView = document.getElementById("dashView");
  const logoutLink = document.getElementById("logoutLink");

  function showDashboard() {
    loginView.hidden = true;
    dashView.hidden = false;
    logoutLink.hidden = false;
    renderAll();
    bindSiteForm();
  }
  function showLogin() {
    loginView.hidden = false;
    dashView.hidden = true;
    logoutLink.hidden = true;
  }

  if (Store.isLoggedIn()) showDashboard();
  else showLogin();

  // Login
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pwd = document.getElementById("loginPwd").value;
    if (Store.login(pwd)) {
      showDashboard();
      toast("Welcome back");
    } else {
      toast("Wrong password");
    }
  });
  function doLogout() { Store.logout(); showLogin(); }
  document.getElementById("logoutBtn")?.addEventListener("click", doLogout);
  logoutLink.addEventListener("click", (e) => { e.preventDefault(); doLogout(); });

  // Tabs
  const tabs = document.querySelectorAll(".dash-tab");
  const panels = document.querySelectorAll("[data-panel]");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const name = btn.dataset.tab;
      panels.forEach((p) => (p.hidden = p.dataset.panel !== name));
    });
  });

  // ====== Research ======
  const rForm = document.getElementById("researchForm");
  const rList = document.getElementById("researchList");
  const rSaveBtn = document.getElementById("rfSaveBtn");

  document.getElementById("rfResetBtn").addEventListener("click", () => clearResearchForm());

  rForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("rfId").value || uid("paper");
    const all = Store.getResearches();
    const existing = all.find((r) => r.id === id) || {};

    let pdf = document.getElementById("rfPdfUrl").value.trim();
    const pdfFile = document.getElementById("rfPdfFile").files[0];
    if (pdfFile) {
      try { pdf = await fileToDataUrl(pdfFile); }
      catch { toast("Could not read PDF"); return; }
    }
    if (!pdf && existing.pdf) pdf = existing.pdf;

    let cover = document.getElementById("rfCoverUrl").value.trim();
    const coverFile = document.getElementById("rfCoverFile").files[0];
    if (coverFile) {
      try { cover = await fileToDataUrl(coverFile); }
      catch { toast("Could not read cover image"); return; }
    }
    if (!cover && existing.cover) cover = existing.cover;

    const entry = {
      id,
      title: document.getElementById("rfTitle").value.trim(),
      authors: document.getElementById("rfAuthors").value.trim(),
      venue: document.getElementById("rfVenue").value.trim(),
      year: document.getElementById("rfYear").value.trim(),
      doi: document.getElementById("rfDoi").value.trim(),
      doiUrl: document.getElementById("rfDoiUrl").value.trim(),
      tags: document.getElementById("rfTags").value.split(",").map((t) => t.trim()).filter(Boolean),
      pdf,
      cover,
      abstract: document.getElementById("rfAbstract").value.trim(),
      highlights: document.getElementById("rfHighlights").value.split("\n").map((s) => s.trim()).filter(Boolean)
    };

    const idx = all.findIndex((r) => r.id === id);
    if (idx >= 0) all[idx] = entry;
    else all.push(entry);
    Store.setResearches(all);
    clearResearchForm();
    renderResearchList();
    toast(idx >= 0 ? "Research updated" : "Research added");
  });

  function clearResearchForm() {
    rForm.reset();
    document.getElementById("rfId").value = "";
    rSaveBtn.textContent = "Add research";
  }

  function renderResearchList() {
    const list = Store.getResearches();
    if (!list.length) {
      rList.innerHTML = '<div class="empty">No research entries yet.</div>';
      return;
    }
    rList.innerHTML = list.map((r) => `
      <div class="item-row">
        <div class="item-thumb">${r.cover ? `<img src="${escapeHtml(r.cover)}">` : `<div class="initials">PDF</div>`}</div>
        <div class="item-meta">
          <div class="t">${escapeHtml(r.title)}</div>
          <div class="s">${escapeHtml(r.authors || "")} · ${escapeHtml(r.venue || "")} ${r.year ? "(" + escapeHtml(r.year) + ")" : ""}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-secondary" data-act="edit-research" data-id="${escapeHtml(r.id)}">Edit</button>
          <button class="btn btn-danger" data-act="del-research" data-id="${escapeHtml(r.id)}">Delete</button>
        </div>
      </div>
    `).join("");
  }
  rList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.act === "edit-research") {
      const r = Store.getResearches().find((x) => x.id === id);
      if (!r) return;
      document.getElementById("rfId").value = r.id;
      document.getElementById("rfTitle").value = r.title || "";
      document.getElementById("rfAuthors").value = r.authors || "";
      document.getElementById("rfVenue").value = r.venue || "";
      document.getElementById("rfYear").value = r.year || "";
      document.getElementById("rfDoi").value = r.doi || "";
      document.getElementById("rfDoiUrl").value = r.doiUrl || "";
      document.getElementById("rfTags").value = (r.tags || []).join(", ");
      document.getElementById("rfPdfUrl").value = (r.pdf || "").startsWith("data:") ? "" : (r.pdf || "");
      document.getElementById("rfCoverUrl").value = (r.cover || "").startsWith("data:") ? "" : (r.cover || "");
      document.getElementById("rfAbstract").value = r.abstract || "";
      document.getElementById("rfHighlights").value = (r.highlights || []).join("\n");
      rSaveBtn.textContent = "Save changes";
      rForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (btn.dataset.act === "del-research") {
      if (!confirm("Delete this research entry?")) return;
      Store.setResearches(Store.getResearches().filter((r) => r.id !== id));
      renderResearchList();
      toast("Research deleted");
    }
  });

  // ====== Members ======
  const mForm = document.getElementById("memberForm");
  const mList = document.getElementById("memberList");
  const mSaveBtn = document.getElementById("mfSaveBtn");

  document.getElementById("mfResetBtn").addEventListener("click", () => clearMemberForm());

  mForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("mfId").value || uid("m");
    const all = Store.getMembers();
    const existing = all.find((m) => m.id === id) || {};

    let photo = document.getElementById("mfPhotoUrl").value.trim();
    const photoFile = document.getElementById("mfPhotoFile").files[0];
    if (photoFile) {
      try { photo = await fileToDataUrl(photoFile); }
      catch { toast("Could not read photo"); return; }
    }
    if (!photo && existing.photo) photo = existing.photo;

    const entry = {
      id,
      name: document.getElementById("mfName").value.trim(),
      role: document.getElementById("mfRole").value.trim(),
      affiliation: document.getElementById("mfAffiliation").value.trim(),
      email: document.getElementById("mfEmail").value.trim(),
      linkedin: document.getElementById("mfLinkedin").value.trim(),
      github: document.getElementById("mfGithub").value.trim(),
      photo
    };

    const idx = all.findIndex((m) => m.id === id);
    if (idx >= 0) all[idx] = entry;
    else all.push(entry);
    Store.setMembers(all);
    clearMemberForm();
    renderMemberList();
    toast(idx >= 0 ? "Member updated" : "Member added");
  });

  function clearMemberForm() {
    mForm.reset();
    document.getElementById("mfId").value = "";
    mSaveBtn.textContent = "Add member";
  }

  function renderMemberList() {
    const list = Store.getMembers();
    if (!list.length) {
      mList.innerHTML = '<div class="empty">No members yet.</div>';
      return;
    }
    mList.innerHTML = list.map((m) => {
      const initials = (m.name || "?").split(" ").map((p) => p[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
      const thumb = m.photo
        ? `<img src="${escapeHtml(m.photo)}">`
        : `<div class="initials">${escapeHtml(initials)}</div>`;
      return `
        <div class="item-row">
          <div class="item-thumb">${thumb}</div>
          <div class="item-meta">
            <div class="t">${escapeHtml(m.name)} <span style="color: var(--muted); font-weight:400;">· ${escapeHtml(m.role || "")}</span></div>
            <div class="s">${escapeHtml(m.affiliation || "")} ${m.email ? "· " + escapeHtml(m.email) : ""}</div>
          </div>
          <div class="item-actions">
            <button class="btn btn-secondary" data-act="edit-member" data-id="${escapeHtml(m.id)}">Edit</button>
            <button class="btn btn-secondary" data-act="photo-member" data-id="${escapeHtml(m.id)}">Replace photo</button>
            <button class="btn btn-danger" data-act="del-member" data-id="${escapeHtml(m.id)}">Delete</button>
          </div>
        </div>
      `;
    }).join("");
  }

  mList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.act === "edit-member") {
      const m = Store.getMembers().find((x) => x.id === id);
      if (!m) return;
      document.getElementById("mfId").value = m.id;
      document.getElementById("mfName").value = m.name || "";
      document.getElementById("mfRole").value = m.role || "";
      document.getElementById("mfAffiliation").value = m.affiliation || "";
      document.getElementById("mfEmail").value = m.email || "";
      document.getElementById("mfLinkedin").value = m.linkedin || "";
      document.getElementById("mfGithub").value = m.github || "";
      document.getElementById("mfPhotoUrl").value = (m.photo || "").startsWith("data:") ? "" : (m.photo || "");
      mSaveBtn.textContent = "Save changes";
      mForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (btn.dataset.act === "photo-member") {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "image/*";
      inp.addEventListener("change", async () => {
        if (!inp.files[0]) return;
        try {
          const dataUrl = await fileToDataUrl(inp.files[0]);
          const all = Store.getMembers();
          const idx = all.findIndex((x) => x.id === id);
          if (idx < 0) return;
          all[idx].photo = dataUrl;
          Store.setMembers(all);
          renderMemberList();
          toast("Photo replaced");
        } catch { toast("Could not read image"); }
      });
      inp.click();
    }
    if (btn.dataset.act === "del-member") {
      if (!confirm("Delete this member?")) return;
      Store.setMembers(Store.getMembers().filter((m) => m.id !== id));
      renderMemberList();
      toast("Member deleted");
    }
  });

  // ====== Gallery ======
  const gForm = document.getElementById("galleryForm");
  const gList = document.getElementById("galleryList");

  gForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let src = document.getElementById("gfUrl").value.trim();
    const f = document.getElementById("gfFile").files[0];
    if (f) {
      try { src = await fileToDataUrl(f); }
      catch { toast("Could not read image"); return; }
    }
    if (!src) { toast("Please add a URL or upload"); return; }
    const caption = document.getElementById("gfCaption").value.trim();
    const all = Store.getGallery();
    all.push({ src, caption });
    Store.setGallery(all);
    gForm.reset();
    renderGalleryList();
    toast("Image added");
  });

  function renderGalleryList() {
    const list = Store.getGallery();
    if (!list.length) {
      gList.innerHTML = '<div class="empty">No images yet.</div>';
      return;
    }
    gList.innerHTML = list.map((g, i) => `
      <div class="item-row">
        <div class="item-thumb"><img src="${escapeHtml(g.src)}"></div>
        <div class="item-meta">
          <div class="t">${escapeHtml(g.caption || "(no caption)")}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-danger" data-act="del-gallery" data-i="${i}">Delete</button>
        </div>
      </div>
    `).join("");
  }

  gList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.act === "del-gallery") {
      const i = Number(btn.dataset.i);
      const all = Store.getGallery();
      all.splice(i, 1);
      Store.setGallery(all);
      renderGalleryList();
      toast("Image removed");
    }
  });

  // ====== Site content ======
  function bindSiteForm() {
    const site = Store.getSite();
    document.getElementById("sfTitle").value = site.title || "";
    document.getElementById("sfTagline").value = site.tagline || "";
    document.getElementById("sfIntro").value = site.intro || "";
  }
  document.getElementById("siteForm").addEventListener("submit", (e) => {
    e.preventDefault();
    Store.setSite({
      title: document.getElementById("sfTitle").value.trim(),
      tagline: document.getElementById("sfTagline").value.trim(),
      intro: document.getElementById("sfIntro").value.trim()
    });
    toast("Site content saved");
  });

  // ====== Settings ======
  document.getElementById("pwdForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pwd = document.getElementById("newPwd").value;
    if (Store.setPassword(pwd)) {
      toast("Password updated");
      document.getElementById("newPwd").value = "";
    } else {
      toast("Password must be at least 3 chars");
    }
  });
  document.getElementById("exportBtn").addEventListener("click", () => {
    const data = Store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById("importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const obj = JSON.parse(text);
      if (Store.importAll(obj)) {
        toast("Backup restored");
        renderAll();
      } else { toast("Invalid backup file"); }
    } catch { toast("Could not read backup"); }
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all content to defaults? Your edits will be lost.")) return;
    Store.resetAll();
    renderAll();
    bindSiteForm();
    toast("Reset to defaults");
  });

  function renderAll() {
    renderResearchList();
    renderMemberList();
    renderGalleryList();
  }

  // Toast helper
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
})();
