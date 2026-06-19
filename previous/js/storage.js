// Tiny storage layer. Defaults come from data.js; the dashboard writes
// edits to localStorage. Each key falls back to defaults when missing.

const LS_KEYS = {
  researches: "site_researches_v1",
  members: "site_members_v1",
  gallery: "site_gallery_v1",
  site: "site_meta_v1",
  auth: "site_auth_v1"
};

const Store = {
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return JSON.parse(JSON.stringify(fallback));
      return JSON.parse(raw);
    } catch (e) {
      console.warn("storage read failed", key, e);
      return JSON.parse(JSON.stringify(fallback));
    }
  },
  _write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      alert(
        "Could not save changes — browser storage is full. Large PDFs and photos use a lot of space. " +
        "Try removing an item or using a smaller file."
      );
      console.error(e);
    }
  },

  // researches
  getResearches() { return this._read(LS_KEYS.researches, DEFAULT_RESEARCHES); },
  setResearches(list) { this._write(LS_KEYS.researches, list); },

  // members
  getMembers() { return this._read(LS_KEYS.members, DEFAULT_MEMBERS); },
  setMembers(list) { this._write(LS_KEYS.members, list); },

  // gallery
  getGallery() { return this._read(LS_KEYS.gallery, DEFAULT_GALLERY); },
  setGallery(list) { this._write(LS_KEYS.gallery, list); },

  // site meta
  getSite() { return this._read(LS_KEYS.site, DEFAULT_SITE); },
  setSite(obj) { this._write(LS_KEYS.site, obj); },

  // auth (very simple — client side only, just gates the dashboard UI)
  isLoggedIn() {
    return sessionStorage.getItem("dashboard_login") === "1";
  },
  login(password) {
    // Default password is "admin". Change it from the dashboard.
    const stored = localStorage.getItem(LS_KEYS.auth) || "admin";
    if (password === stored) {
      sessionStorage.setItem("dashboard_login", "1");
      return true;
    }
    return false;
  },
  logout() { sessionStorage.removeItem("dashboard_login"); },
  setPassword(newPwd) {
    if (!newPwd || newPwd.length < 3) return false;
    localStorage.setItem(LS_KEYS.auth, newPwd);
    return true;
  },

  // export / import (so users can move data between browsers)
  exportAll() {
    return {
      researches: this.getResearches(),
      members: this.getMembers(),
      gallery: this.getGallery(),
      site: this.getSite(),
      exportedAt: new Date().toISOString()
    };
  },
  importAll(obj) {
    if (!obj || typeof obj !== "object") return false;
    if (Array.isArray(obj.researches)) this.setResearches(obj.researches);
    if (Array.isArray(obj.members)) this.setMembers(obj.members);
    if (Array.isArray(obj.gallery)) this.setGallery(obj.gallery);
    if (obj.site && typeof obj.site === "object") this.setSite(obj.site);
    return true;
  },

  resetAll() {
    [LS_KEYS.researches, LS_KEYS.members, LS_KEYS.gallery, LS_KEYS.site]
      .forEach((k) => localStorage.removeItem(k));
  }
};

// helpers
function uid(prefix) {
  return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
