// === Hero: live "microscope field" built from real colonies ===
// window.INSTANCES (built by tools/build_instances.py) holds cut-outs of every
// annotated E. coli / Salmonella colony from our 60x microscopy fields, with
// their YOLO-seg polygons. A modest number drift across the hero at a time;
// new ones float in from the edges as others leave. A detector lens follows
// them one by one and reveals mask, box and class. Move the cursor to steer
// the lens; click to inoculate a few colonies at that spot.

(function () {
  var canvas = document.getElementById("heroCanvas");
  var DATA = window.INSTANCES;
  if (!canvas || !canvas.getContext || !DATA || !DATA.items.length) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.UI && UI.reduceMotion;

  var W = 0, H = 0, DPR = 1, t = 0, DS = 0.3;
  var running = true, visible = true;
  var lens = { x: 0, y: 0, tx: 0, ty: 0, r: 120, user: false, lastMove: 0, target: null, dwell: 0 };
  var hudCount = document.getElementById("heroHudCount");
  var hudField = document.getElementById("heroHudField");
  var detected = 0;

  var NAMES = { ecoli: "E. coli", salm: "Salmonella" };
  var BG = DATA.bg.join(",");
  var PALETTES = {
    light: { ecoli: "10,150,138", salm: "214,122,0", lens: "10,130,120",
             wash: "245,247,251", washA: 0.16, dim: "245,247,251", dimA: 0.24, labelInk: "255,255,255" },
    dark:  { ecoli: "46,230,214", salm: "255,184,77", lens: "46,230,214",
             wash: "6,10,19", washA: 0.62, dim: "6,10,19", dimA: 0.30, labelInk: "4,18,26" }
  };
  var PAL = PALETTES[(window.UI && UI.theme()) || "light"];
  document.addEventListener("themechange", function (e) {
    PAL = PALETTES[e.detail.theme] || PALETTES.light;
    if (reduce) draw();
  });

  // ---- sprite sheets ----
  var sheets = DATA.sheets.map(function (src) {
    var im = new Image();
    im.decoding = "async";
    im.src = src;
    return im;
  });
  function sheetsReady() {
    return sheets.every(function (im) { return im.complete && im.naturalWidth > 0; });
  }
  var BY = { ecoli: [], salm: [] };
  DATA.items.forEach(function (it, i) { (BY[it.c] || (BY[it.c] = [])).push(i); });

  function rand(a, b) { return a + Math.random() * (b - a); }

  // ---- population ----
  var cols = [];
  var inUse = {};
  var textBoxes = [];

  function targetCount() {
    return Math.round(Math.max(7, Math.min(22, (W * H) / 60000)));
  }

  function pickItem() {
    var n = { ecoli: 0, salm: 0 };
    cols.forEach(function (c) { n[c.it.c]++; });
    var sp = n.ecoli === n.salm ? (Math.random() < 0.5 ? "ecoli" : "salm") : (n.ecoli < n.salm ? "ecoli" : "salm");
    var list = BY[sp];
    for (var tries = 0; tries < 20; tries++) {
      var idx = list[Math.floor(Math.random() * list.length)];
      if (!inUse[idx]) return idx;
    }
    return list[Math.floor(Math.random() * list.length)];
  }

  // A colony with its polygon kept in local (centred, unrotated) space.
  function makeColony(idx, x, y, vx, vy) {
    var it = DATA.items[idx];
    var k = DS / DATA.scale;
    var w = it.w * k, h = it.h * k, flip = Math.random() < 0.5 ? -1 : 1;
    var local = [];
    for (var i = 0; i < it.p.length; i += 2) local.push((it.p[i] - 0.5) * w * flip, (it.p[i + 1] - 0.5) * h);
    inUse[idx] = true;
    return {
      it: it, idx: idx, x: x, y: y, vx: vx, vy: vy, speed: Math.sqrt(vx * vx + vy * vy),
      a: rand(0, Math.PI * 2), va: rand(-0.0015, 0.0015), flip: flip,
      w: w, h: h, rad: Math.sqrt(w * w + h * h) / 2, local: local,
      pts: [], box: [0, 0, 0, 0],
      alpha: 1, entered: false, det: 0, seen: false
    };
  }

  // Spawn just outside a random edge, heading towards a point inside the hero.
  function spawnFromEdge() {
    var idx = pickItem(), it = DATA.items[idx];
    var k = DS / DATA.scale, rad = Math.sqrt(it.w * it.w + it.h * it.h) * k / 2 + 4;
    var edge = Math.floor(Math.random() * 4), x, y;
    if (edge === 0) { x = rand(0, W); y = -rad; }
    else if (edge === 1) { x = W + rad; y = rand(0, H); }
    else if (edge === 2) { x = rand(0, W); y = H + rad; }
    else { x = -rad; y = rand(0, H); }
    var aimX = rand(W * 0.2, W * 0.8), aimY = rand(H * 0.2, H * 0.8);
    var dx = aimX - x, dy = aimY - y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var sp = rand(0.18, 0.42);
    cols.push(makeColony(idx, x, y, dx / d * sp, dy / d * sp));
  }

  // Initial scatter so the hero isn't empty on load (no overlaps).
  function seed() {
    var want = targetCount();
    for (var n = 0, tries = 0; n < want && tries < want * 30; tries++) {
      var x = rand(0, W), y = rand(40, H);
      var ok = true;
      for (var i = 0; i < cols.length && ok; i++) {
        var o = cols[i], dx = o.x - x, dy = o.y - y;
        if (dx * dx + dy * dy < (o.rad + 70) * (o.rad + 70)) ok = false;
      }
      if (!ok) continue;
      var a = rand(0, Math.PI * 2), sp = rand(0.18, 0.42);
      var c = makeColony(pickItem(), x, y, Math.cos(a) * sp, Math.sin(a) * sp);
      c.entered = true;
      c.alpha = reduce ? 1 : -Math.random() * 1.2; // staggered fade-in
      cols.push(c);
      n++;
    }
  }

  // ---- hero text boxes (the lens never parks behind the headline) ----
  var TEXT_SEL = ".hero-inner h1, .hero-inner .intro, .hero-actions, .hero-pill, .hero-hint";
  function measureText() {
    var cr = canvas.getBoundingClientRect(), m = 20;
    textBoxes = [];
    document.querySelectorAll(TEXT_SEL).forEach(function (el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var rs = range.getClientRects();
      for (var i = 0; i < rs.length; i++) {
        var r = rs[i];
        if (r.width && r.height) textBoxes.push({ l: r.left - cr.left - m, t: r.top - cr.top - m, r: r.right - cr.left + m, b: r.bottom - cr.top + m });
      }
    });
  }
  function overText(x, y) {
    for (var i = 0; i < textBoxes.length; i++) {
      var r = textBoxes[i];
      if (x > r.l && x < r.r && y > r.t && y < r.b) return true;
    }
    return false;
  }

  function resize() {
    var r = canvas.getBoundingClientRect();
    var oldW = W, oldH = H;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    DS = Math.max(0.2, Math.min(0.32, W / 4500)); // source px -> CSS px
    lens.r = Math.max(70, Math.min(120, W * 0.08));
    if (!lens.x) { lens.x = lens.tx = W * 0.72; lens.y = lens.ty = H * 0.5; }
    measureText();
    if (Math.abs(W - oldW) > 40 || Math.abs(H - oldH) > 40) {
      cols.forEach(function (c) { delete inUse[c.idx]; });
      cols = [];
      lens.target = null;
      seed();
    }
  }

  // ---- simulation ----
  var DWELL = 55;
  function onScreen(c, m) { return c.x > m && c.x < W - m && c.y > m && c.y < H - m; }

  function chooseTarget() {
    var best = null, bd = Infinity;
    for (var i = 0; i < cols.length; i++) {
      var c = cols[i];
      if (c.seen || c.alpha < 1 || !onScreen(c, 60) || overText(c.x, c.y)) continue;
      var dx = c.x - lens.x, dy = c.y - lens.y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  }

  function transform(c) {
    var cos = Math.cos(c.a), sin = Math.sin(c.a), L = c.local, P = c.pts;
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    P.length = L.length;
    for (var k = 0; k < L.length; k += 2) {
      var sx = c.x + L[k] * cos - L[k + 1] * sin, sy = c.y + L[k] * sin + L[k + 1] * cos;
      P[k] = sx; P[k + 1] = sy;
      if (sx < minX) minX = sx; if (sx > maxX) maxX = sx;
      if (sy < minY) minY = sy; if (sy > maxY) maxY = sy;
    }
    c.box[0] = minX; c.box[1] = minY; c.box[2] = maxX - minX; c.box[3] = maxY - minY;
  }

  function update() {
    // lens: follow the user, otherwise chase the nearest undetected colony
    var idle = !lens.user || performance.now() - lens.lastMove > 4000;
    if (idle) {
      lens.user = false;
      var tg = lens.target;
      if (!tg || (tg.seen && lens.dwell > DWELL) || cols.indexOf(tg) < 0 || !onScreen(tg, 30)) {
        lens.target = tg = chooseTarget(); lens.dwell = 0;
      }
      if (tg) {
        lens.tx = tg.x; lens.ty = tg.y;
        if (Math.abs(lens.x - tg.x) < 10 && Math.abs(lens.y - tg.y) < 10) lens.dwell++;
      } else {
        lens.tx = W * (0.68 + 0.18 * Math.sin(t * 0.004));
        lens.ty = H * (0.5 + 0.25 * Math.sin(t * 0.0063 + 1));
      }
    }
    lens.x += (lens.tx - lens.x) * 0.08;
    lens.y += (lens.ty - lens.y) * 0.08;

    // gentle separation so drifting colonies rarely pile on top of each other
    for (var i = 0; i < cols.length; i++) {
      for (var j = i + 1; j < cols.length; j++) {
        var a = cols[i], b = cols[j];
        var dx = b.x - a.x, dy = b.y - a.y, min = (a.rad + b.rad) * 0.75;
        var d2 = dx * dx + dy * dy;
        if (d2 < min * min && d2 > 0.01) {
          var d = Math.sqrt(d2), f = (min - d) / min * 0.02;
          dx /= d; dy /= d;
          a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
        }
      }
    }

    var r2 = lens.r * lens.r;
    for (var n = cols.length - 1; n >= 0; n--) {
      var c = cols[n];
      if (c.alpha < 1) c.alpha = Math.min(1, c.alpha + 0.02);
      // drift with a little wobble, easing back towards each colony's cruise speed
      c.vx += rand(-0.006, 0.006); c.vy += rand(-0.006, 0.006);
      var s = Math.sqrt(c.vx * c.vx + c.vy * c.vy) || 1;
      var adj = 1 + (c.speed / s - 1) * 0.05;
      c.vx *= adj; c.vy *= adj;
      c.x += c.vx; c.y += c.vy; c.a += c.va;

      var m = c.rad + 6;
      var inside = c.x > -m && c.x < W + m && c.y > -m && c.y < H + m;
      if (onScreen(c, 0)) c.entered = true;
      if (c.entered && !inside) { delete inUse[c.idx]; cols.splice(n, 1); continue; }

      var ldx = c.x - lens.x, ldy = c.y - lens.y;
      var inLens = ldx * ldx + ldy * ldy < r2 * 0.75;
      if (inLens && c.det > 0.6 && !c.seen && c.alpha >= 1) {
        c.seen = true; detected++;
        showMeta(c.it);
      }
      var target = inLens ? 1 : (c.seen ? 0.5 : 0);
      c.det += (target - c.det) * 0.12;
      if (c.det > 0.05) transform(c);
    }

    // keep the population topped up, one newcomer at a time from the edges
    if (cols.length < targetCount() && t % 45 === 0) spawnFromEdge();
  }

  // ---- drawing ----
  function drawColony(c) {
    var it = c.it;
    ctx.save();
    ctx.globalAlpha = Math.max(0, c.alpha);
    ctx.translate(c.x, c.y);
    ctx.rotate(c.a);
    ctx.scale(c.flip, 1);
    ctx.drawImage(sheets[it.k], it.x, it.y, it.w, it.h, -c.w / 2, -c.h / 2, c.w, c.h);
    ctx.restore();
  }

  function drawDetection(c, a) {
    var col = PAL[c.it.c] || PAL.ecoli, p = c.pts;
    if (!p.length) return;
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (var k = 2; k < p.length; k += 2) ctx.lineTo(p[k], p[k + 1]);
    ctx.closePath();
    ctx.fillStyle = "rgba(" + col + "," + 0.3 * a + ")";
    ctx.fill();
    ctx.strokeStyle = "rgba(" + col + "," + a + ")";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    var pad = 4, b = c.box;
    var bx = b[0] - pad, by = b[1] - pad, bw = b[2] + pad * 2, bh = b[3] + pad * 2;
    ctx.lineWidth = 1.1;
    ctx.strokeRect(bx, by, bw, bh);
    if (a > 0.45) {
      var label = NAMES[c.it.c] || c.it.c;
      ctx.font = "600 10px 'JetBrains Mono', ui-monospace, monospace";
      var tw = ctx.measureText(label).width + 8;
      var ly = by - 15 < 0 ? by + bh + 1 : by - 15;
      ctx.fillStyle = "rgba(" + col + "," + a + ")";
      ctx.fillRect(bx, ly, tw, 14);
      ctx.fillStyle = "rgba(" + PAL.labelInk + "," + a + ")";
      ctx.fillText(label, bx + 4, ly + 10.5);
    }
  }

  function draw() {
    ctx.fillStyle = "rgb(" + BG + ")";
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < cols.length; i++) drawColony(cols[i]);

    ctx.fillStyle = "rgba(" + PAL.wash + "," + PAL.washA + ")";
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgba(" + PAL.dim + "," + PAL.dimA + ")";
    ctx.fill("evenodd");
    ctx.restore();

    for (var j = 0; j < cols.length; j++) {
      var c = cols[j];
      if (c.det > 0.05) drawDetection(c, Math.min(1, c.det) * Math.max(0, c.alpha));
    }

    if (!reduce) drawLens();
    if (hudCount && hudCount.textContent !== String(detected)) hudCount.textContent = detected;
  }

  function drawLens() {
    var x = lens.x, y = lens.y, r = lens.r;
    ctx.save();
    var sy = y - r + ((t * 2) % (2 * r));
    var half = Math.sqrt(Math.max(0, r * r - (sy - y) * (sy - y)));
    var g = ctx.createLinearGradient(0, sy - 14, 0, sy);
    g.addColorStop(0, "rgba(" + PAL.lens + ",0)");
    g.addColorStop(1, "rgba(" + PAL.lens + ",0.28)");
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = g;
    ctx.fillRect(x - half, sy - 14, half * 2, 14);
    ctx.strokeStyle = "rgba(" + PAL.lens + ",0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - half, sy); ctx.lineTo(x + half, sy); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(" + PAL.lens + ",0.7)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 6]);
    ctx.lineDashOffset = -t * 0.4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(" + PAL.lens + ",0.95)";
    ctx.lineWidth = 2;
    for (var q = 0; q < 4; q++) {
      var ang = q * Math.PI / 2 + t * 0.002;
      ctx.beginPath(); ctx.arc(x, y, r + 6, ang - 0.18, ang + 0.18); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(" + PAL.lens + ",0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
    ctx.stroke();
    ctx.restore();
  }

  function showMeta(it) {
    if (hudField) hudField.textContent = it.species + " · " + it.time + " h · " + it.medium;
  }

  function loop() {
    if (!running) return;
    if (visible && !document.hidden) {
      t++;
      update();
      draw();
    }
    requestAnimationFrame(loop);
  }

  // ---- input ----
  function setLensFromEvent(e) {
    var r = canvas.getBoundingClientRect();
    var p = e.touches ? e.touches[0] : e;
    lens.tx = p.clientX - r.left;
    lens.ty = p.clientY - r.top;
    lens.user = true;
    lens.lastMove = performance.now();
  }
  var hero = canvas.parentElement;
  hero.addEventListener("mousemove", setLensFromEvent);
  hero.addEventListener("mouseleave", function () { lens.lastMove = 0; });
  canvas.addEventListener("click", function (e) {
    // inoculate: a few real colonies appear at the click and drift outwards
    if (reduce || cols.length > targetCount() + 8) return;
    var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    for (var i = 0; i < 3; i++) {
      var a = rand(0, Math.PI * 2), sp = rand(0.25, 0.45);
      var c = makeColony(pickItem(), x + Math.cos(a) * 20, y + Math.sin(a) * 20, Math.cos(a) * sp, Math.sin(a) * sp);
      c.entered = true; c.alpha = 0;
      cols.push(c);
    }
  });
  canvas.addEventListener("touchstart", setLensFromEvent, { passive: true });

  window.addEventListener("resize", function () { resize(); if (reduce) showStatic(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureText);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
  }

  // reduced motion: one still, fully annotated field
  function showStatic() {
    cols.forEach(function (c) {
      c.alpha = 1; c.seen = true;
      c.det = overText(c.x, c.y) ? 0 : 1;
      transform(c);
    });
    draw();
  }

  function start() {
    resize();
    if (reduce) showStatic();
    else loop();
  }
  (function waitForSheets() {
    if (sheetsReady()) start();
    else setTimeout(waitForSheets, 50);
  })();
})();
