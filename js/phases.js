// === Phases page ===
// Carousels for "Data Collection" and "Inference" with swipe + keyboard
// navigation, and species switching (E. coli / Salmonella / Mixed).

(function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  // --- Image sets --------------------------------------------------------
  // Filename pattern for collection: <n>_<species><time><bg>_<suffix>.png
  // species: e=ecoli, s=salmonella  |  time: 2=2h, 25=2.5h, 3=3h, 35=3.5h, 4=4h
  // bg: p=plain, o=onion

  var COLLECTION = {
    ecoli: [
      "1_e2p_100.png","2_e2o_52.png","3_e25p_03.png","4_e25o_46.png",
      "5_e3p_66.png","6_e3o_32.png","7_e35p_90.png","8_e35o_49.png",
      "9_e4p_67.png","10_e4o_87.png"
    ],
    salm: [
      "1_s2p_17.png","2_s2o_40.png","3_s25p_19.png","4_s25o_83.png",
      "5_s3p_2.png","6_s3o_16.png","7_s35p_37.png","8_s35o_69.png",
      "9_s4p_42.png","10_s4o_75.png"
    ]
  };
  var COLLECTION_DIR = {
    ecoli: "assets/phases/1.Data%20Collection/ecoli/",
    salm:  "assets/phases/1.Data%20Collection/salmonella/"
  };

  var INFERENCE = {
    ecoli: ["1.ecoli.png","2.ecoli.png","3.ecoli.png","4.ecoli.png"],
    salm:  ["1.salm.png","2.salm.png","3.salm.png","4.salm.png","5.salm.png"],
    mixed: ["1.mixed.png","2.mixed.png","3.mixed.png","4.mixed.png"]
  };
  var INFERENCE_DIR = "assets/phases/5.Inference/";

  // --- Filename -> caption parser ---------------------------------------
  var TIME_MAP = { "2": "2 hr", "25": "2.5 hr", "3": "3 hr", "35": "3.5 hr", "4": "4 hr" };
  var BG_MAP   = { "p": "Plain background", "o": "Onion-mixture background" };

  function parseCollectionCaption(filename, species) {
    // expected: "<n>_<code>_<suffix>.png" where code starts with species letter
    var m = filename.match(/^\d+_([es])(\d+)([po])_/);
    if (!m) return filename;
    var letter = m[1], timeCode = m[2], bgCode = m[3];
    var name = letter === "e" ? "E. coli" : "Salmonella";
    var t = TIME_MAP[timeCode] || (timeCode + " hr");
    var bg = BG_MAP[bgCode] || "";
    return name + " · " + t + " · " + bg;
  }

  function inferenceCaption(filename, species) {
    var m = filename.match(/^(\d+)\./);
    var idx = m ? m[1] : "?";
    var label = species === "ecoli" ? "E. coli inference" :
                species === "salm"  ? "Salmonella inference" :
                                       "Mixed-colony inference";
    return label + " · sample " + idx;
  }

  // --- Carousel widget ---------------------------------------------------
  function Carousel(rootEl, sets, dirFor, captionFor) {
    var self = this;
    this.root = rootEl;
    this.sets = sets;        // { ecoli: [files], salm: [files], ...}
    this.dirFor = dirFor;    // function(species) => directory URL
    this.captionFor = captionFor; // function(filename, species) => caption
    this.species = Object.keys(sets)[0];
    this.index = 0;

    this.img      = rootEl.querySelector(".car-img");
    this.caption  = rootEl.querySelector("[data-caption]");
    this.counter  = rootEl.querySelector("[data-counter]");
    this.dotsBox  = rootEl.querySelector("[data-dots]");
    this.prevBtn  = rootEl.querySelector("[data-carousel-prev]");
    this.nextBtn  = rootEl.querySelector("[data-carousel-next]");

    this.prevBtn.addEventListener("click", function () { self.move(-1); });
    this.nextBtn.addEventListener("click", function () { self.move( 1); });

    // Keyboard navigation when focused
    rootEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { e.preventDefault(); self.move(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); self.move( 1); }
    });

    // Global keyboard when this carousel is the most-visible one
    rootEl._carouselInstance = self;

    // Touch swipe
    var tx0 = null, ty0 = null;
    rootEl.addEventListener("touchstart", function (e) {
      if (!e.touches.length) return;
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
    }, { passive: true });
    rootEl.addEventListener("touchend", function (e) {
      if (tx0 == null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - tx0;
      var dy = t.clientY - ty0;
      // horizontal swipe wins only if dominant and big enough
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        self.move(dx > 0 ? -1 : 1);
      }
      tx0 = null; ty0 = null;
    });

    // Mouse drag fallback (desktop)
    var mx0 = null;
    rootEl.addEventListener("mousedown", function (e) {
      if (e.target.closest(".car-nav") || e.target.closest(".car-dot")) return;
      mx0 = e.clientX;
    });
    rootEl.addEventListener("mouseup", function (e) {
      if (mx0 == null) return;
      var dx = e.clientX - mx0;
      if (Math.abs(dx) > 60) self.move(dx > 0 ? -1 : 1);
      mx0 = null;
    });

    this.render();
  }

  Carousel.prototype.setSpecies = function (species) {
    if (!this.sets[species]) return;
    this.species = species;
    this.index = 0;
    this.render();
  };

  Carousel.prototype.move = function (delta) {
    var list = this.sets[this.species];
    if (!list || !list.length) return;
    this.index = (this.index + delta + list.length) % list.length;
    this.render();
  };

  Carousel.prototype.render = function () {
    var list = this.sets[this.species] || [];
    if (!list.length) {
      this.img.removeAttribute("src");
      this.caption.textContent = "No images.";
      this.counter.textContent = "0 / 0";
      this.dotsBox.innerHTML = "";
      return;
    }
    var fname = list[this.index];
    var src = this.dirFor(this.species) + encodeURIComponent(fname);
    this.img.src = src;
    this.img.alt = fname;
    this.caption.textContent = this.captionFor(fname, this.species);
    this.counter.textContent = (this.index + 1) + " / " + list.length;

    // Dots
    var dotsHtml = "";
    for (var i = 0; i < list.length; i++) {
      dotsHtml += '<button class="car-dot' + (i === this.index ? ' active' : '') +
                  '" data-i="' + i + '" aria-label="Go to ' + (i+1) + '"></button>';
    }
    this.dotsBox.innerHTML = dotsHtml;
    var self = this;
    this.dotsBox.querySelectorAll(".car-dot").forEach(function (d) {
      d.addEventListener("click", function () {
        self.index = Number(d.dataset.i);
        self.render();
      });
    });
  };

  // --- Wire everything up -----------------------------------------------
  var carousels = {};

  carousels.collection = new Carousel(
    document.querySelector('[data-carousel="collection"]'),
    COLLECTION,
    function (sp) { return COLLECTION_DIR[sp]; },
    parseCollectionCaption
  );

  carousels.inference = new Carousel(
    document.querySelector('[data-carousel="inference"]'),
    INFERENCE,
    function () { return INFERENCE_DIR; },
    inferenceCaption
  );

  // Segmented species tabs
  document.querySelectorAll(".segmented").forEach(function (segGroup) {
    segGroup.querySelectorAll(".seg-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.dataset.target;
        var species = btn.dataset.species;
        // Active state
        segGroup.querySelectorAll(".seg-btn").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        if (carousels[target]) carousels[target].setSpecies(species);
      });
    });
  });

  // Global arrow-key support — drive whichever carousel is most visible
  window.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    // Don't hijack typing in inputs
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

    var mostVisible = null, mostVisibleArea = 0;
    Object.keys(carousels).forEach(function (k) {
      var el = carousels[k].root;
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var visibleH = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (visibleH > mostVisibleArea) {
        mostVisibleArea = visibleH;
        mostVisible = carousels[k];
      }
    });
    if (mostVisible && mostVisibleArea > 80) {
      e.preventDefault();
      mostVisible.move(e.key === "ArrowLeft" ? -1 : 1);
    }
  });

  // Reveal-on-scroll
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(function (el) { obs.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // === Model training chip clicks ===
  var modelList = document.getElementById("modelList");
  if (modelList) {
    var modelImg     = document.getElementById("modelGraphImg");
    var modelCaption = document.getElementById("modelGraphCaption");
    var fallbackImg  = modelImg ? modelImg.getAttribute("src") : "";
    var fallbackCap  = modelCaption ? modelCaption.textContent : "";

    function encodePath(p) {
      // encode each segment so spaces become %20 but keep slashes
      return p.split("/").map(function (s) { return encodeURIComponent(s); }).join("/");
    }

    modelList.querySelectorAll(".model-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        modelList.querySelectorAll(".model-chip").forEach(function (c) {
          c.classList.remove("active");
        });
        chip.classList.add("active");

        if (!modelImg) return;
        var src = chip.dataset.img;
        var cap = chip.dataset.caption || "";

        if (src) {
          var encoded = encodePath(src);
          // Probe the image; if it 404s, fall back to the comparison graph
          var probe = new Image();
          probe.onload = function () {
            modelImg.src = encoded;
            if (modelCaption) modelCaption.textContent = cap;
          };
          probe.onerror = function () {
            modelImg.src = fallbackImg;
            if (modelCaption) {
              modelCaption.textContent =
                cap + " (per-model chart not yet uploaded — showing the combined comparison.)";
            }
          };
          probe.src = encoded;
        }
      });
    });
  }

  // === Annotation video first-visit autoplay ===
  // Plays the annotation video automatically the first time the user reaches
  // it in a browser session (muted, so browsers allow autoplay). After playing
  // once we mark a sessionStorage flag so it won't auto-replay on every reload
  // within the same session.
  var video = document.getElementById("annotationVideo");
  if (video) {
    var SESSION_KEY = "annotation_video_autoplayed_v1";
    var alreadyPlayed = false;
    try { alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) {}
    if (!alreadyPlayed) {
      var tryPlay = function () {
        // muted is already on; just ensure it stays on for the autoplay attempt
        video.muted = true;
        var p = video.play();
        if (p && typeof p.then === "function") {
          p.then(function () {
            try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
          }).catch(function () {
            // Autoplay blocked — leave controls visible so the user can press play
          });
        } else {
          try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
        }
      };
      if ("IntersectionObserver" in window) {
        var vObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { tryPlay(); vObs.unobserve(e.target); }
          });
        }, { threshold: 0.35 });
        vObs.observe(video);
      } else {
        tryPlay();
      }
    }
  }
})();
