// === Hero: live "microscope field" ===
// Rod-shaped E. coli (cyan) and Salmonella (amber) drift, grow and divide.
// A detector lens follows the cursor (or wanders on its own) and draws
// bounding boxes + class/confidence labels on cells inside it, mimicking the
// group's detection models. Click / tap to inoculate new cells.

(function () {
  var canvas = document.getElementById("heroCanvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.UI && UI.reduceMotion;

  var W = 0, H = 0, DPR = 1;
  var cells = [];
  var MAX_CELLS = 90;
  var lens = { x: 0, y: 0, tx: 0, ty: 0, r: 150, user: false, lastMove: 0 };
  var running = true, visible = true, t = 0;
  var detectedCount = 0;
  var hud = document.getElementById("heroHudCount");

  var SPECIES = {
    ecoli: { name: "E. coli",    len: [16, 30], rad: [4.2, 5.4] },
    salm:  { name: "Salmonella", len: [13, 24], rad: [4.6, 6.0] }
  };

  // Colour palettes per site theme (RGB triplets as strings for rgba()).
  var PALETTES = {
    light: { bg0: "#eaf4f7", bg1: "#f5f7fb", ecoli: "14,170,156", salm: "226,140,16", lens: "10,130,120",
             ink: "255,255,255", labelInk: "255,255,255", base: 0.42, glow: 0.35 },
    dark:  { bg0: "#0d1a2e", bg1: "#060a13", ecoli: "46,230,214", salm: "255,184,77", lens: "46,230,214",
             ink: "6,10,19", labelInk: "4,18,26", base: 0.32, glow: 1 }
  };
  var PAL = PALETTES[(window.UI && UI.theme()) || "light"];
  document.addEventListener("themechange", function (e) {
    PAL = PALETTES[e.detail.theme] || PALETTES.light;
    if (reduce) draw();
  });

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeCell(x, y, sp, len) {
    var s = SPECIES[sp];
    var base = rand(s.len[0], s.len[1]);
    return {
      x: x, y: y, sp: sp,
      a: Math.random() * Math.PI * 2,
      va: rand(-0.004, 0.004),
      vx: rand(-0.18, 0.18), vy: rand(-0.18, 0.18),
      len: len || base * rand(0.6, 1),
      maxLen: base * 1.9,
      rad: rand(s.rad[0], s.rad[1]),
      grow: rand(0.006, 0.016),
      conf: (0.86 + Math.random() * 0.13).toFixed(2),
      phase: Math.random() * Math.PI * 2,
      det: 0 // detection highlight 0..1
    };
  }

  function resize() {
    var r = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    lens.r = Math.max(110, Math.min(170, W * 0.12));
    var target = Math.round(Math.min(MAX_CELLS - 20, (W * H) / 16000));
    while (cells.length < target) {
      cells.push(makeCell(rand(0, W), rand(0, H), Math.random() > 0.5 ? "ecoli" : "salm"));
    }
    if (!lens.x) { lens.x = lens.tx = W * 0.72; lens.y = lens.ty = H * 0.5; }
  }

  function capsule(len, rad) {
    var hl = len / 2;
    ctx.beginPath();
    ctx.moveTo(-hl, -rad);
    ctx.lineTo(hl, -rad);
    ctx.arc(hl, 0, rad, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(-hl, rad);
    ctx.arc(-hl, 0, rad, Math.PI / 2, Math.PI * 1.5);
    ctx.closePath();
  }

  function update() {
    // lens: follow user, else wander on a lissajous path
    if (!lens.user || performance.now() - lens.lastMove > 4000) {
      lens.user = false;
      lens.tx = W * (0.62 + 0.22 * Math.sin(t * 0.0045));
      lens.ty = H * (0.5 + 0.28 * Math.sin(t * 0.0071 + 1));
    }
    lens.x += (lens.tx - lens.x) * 0.12;
    lens.y += (lens.ty - lens.y) * 0.12;

    var born = [];
    for (var i = cells.length - 1; i >= 0; i--) {
      var c = cells[i];
      // brownian drift
      c.vx += rand(-0.02, 0.02); c.vy += rand(-0.02, 0.02);
      c.vx *= 0.985; c.vy *= 0.985;
      c.x += c.vx; c.y += c.vy;
      c.a += c.va + Math.sin(t * 0.01 + c.phase) * 0.0015;
      // wrap
      var m = 40;
      if (c.x < -m) c.x = W + m; else if (c.x > W + m) c.x = -m;
      if (c.y < -m) c.y = H + m; else if (c.y > H + m) c.y = -m;
      // growth + binary fission
      c.len += c.grow;
      if (c.len >= c.maxLen) {
        if (cells.length + born.length < MAX_CELLS) {
          var half = c.len / 2 - 1;
          var dx = Math.cos(c.a) * (half / 2 + 1.5), dy = Math.sin(c.a) * (half / 2 + 1.5);
          var d1 = makeCell(c.x - dx, c.y - dy, c.sp, half);
          var d2 = makeCell(c.x + dx, c.y + dy, c.sp, half);
          d1.a = d2.a = c.a; d1.vx = c.vx - dx * 0.02; d2.vx = c.vx + dx * 0.02;
          d1.vy = c.vy - dy * 0.02; d2.vy = c.vy + dy * 0.02;
          born.push(d1, d2);
          cells.splice(i, 1);
        } else {
          c.len = c.maxLen * 0.5; // population capped: reset instead of dividing
        }
        continue;
      }
      // detection state
      var ddx = c.x - lens.x, ddy = c.y - lens.y;
      var inside = ddx * ddx + ddy * ddy < lens.r * lens.r;
      c.det += ((inside ? 1 : 0) - c.det) * 0.15;
    }
    if (born.length) cells.push.apply(cells, born);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // background wash
    var g = ctx.createRadialGradient(W * 0.7, H * 0.4, 0, W * 0.6, H * 0.5, Math.max(W, H) * 0.8);
    g.addColorStop(0, PAL.bg0);
    g.addColorStop(1, PAL.bg1);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // cells
    var count = 0;
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i], col = PAL[c.sp];
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.a);
      var alpha = PAL.base + c.det * (0.95 - PAL.base);
      ctx.shadowColor = "rgba(" + col + "," + (0.5 + c.det * 0.5) * PAL.glow + ")";
      ctx.shadowBlur = 8 + c.det * 14;
      ctx.fillStyle = "rgba(" + col + "," + alpha + ")";
      capsule(c.len, c.rad);
      ctx.fill();
      ctx.shadowBlur = 0;
      // septum hint when close to dividing
      if (c.len > c.maxLen * 0.85) {
        ctx.strokeStyle = "rgba(" + PAL.ink + "," + (0.6 * alpha) + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, -c.rad); ctx.lineTo(0, c.rad); ctx.stroke();
      }
      // flagella on salmonella
      if (c.sp === "salm") {
        ctx.strokeStyle = "rgba(" + col + "," + (alpha * 0.45) + ")";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        var hl = c.len / 2 + c.rad;
        ctx.moveTo(hl, 0);
        for (var k = 1; k <= 8; k++) ctx.lineTo(hl + k * 2.4, Math.sin(t * 0.15 + k + c.phase) * 2.2);
        ctx.stroke();
      }
      ctx.restore();

      if (c.det > 0.35) {
        count++;
        drawBox(c, col);
      }
    }

    drawLens();

    if (hud && count !== detectedCount) { detectedCount = count; hud.textContent = count; }
  }

  function drawBox(c, col) {
    var ca = Math.abs(Math.cos(c.a)), sa = Math.abs(Math.sin(c.a));
    var hl = c.len / 2 + c.rad;
    var bw = (hl * ca + c.rad * sa) * 2 + 8;
    var bh = (hl * sa + c.rad * ca) * 2 + 8;
    var a = Math.min(1, (c.det - 0.35) / 0.5);
    ctx.strokeStyle = "rgba(" + col + "," + a + ")";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(c.x - bw / 2, c.y - bh / 2, bw, bh);
    if (a > 0.5) {
      var label = SPECIES[c.sp].name + " " + c.conf;
      ctx.font = "600 10px 'JetBrains Mono', ui-monospace, monospace";
      var tw = ctx.measureText(label).width + 8;
      ctx.fillStyle = "rgba(" + col + "," + a + ")";
      ctx.fillRect(c.x - bw / 2, c.y - bh / 2 - 15, tw, 14);
      ctx.fillStyle = "rgba(" + PAL.labelInk + "," + a + ")";
      ctx.fillText(label, c.x - bw / 2 + 4, c.y - bh / 2 - 4.5);
    }
  }

  function drawLens() {
    var x = lens.x, y = lens.y, r = lens.r;
    ctx.save();
    ctx.strokeStyle = "rgba(" + PAL.lens + ",0.55)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 6]);
    ctx.lineDashOffset = -t * 0.4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    // corner ticks
    ctx.strokeStyle = "rgba(" + PAL.lens + ",0.9)";
    ctx.lineWidth = 2;
    for (var q = 0; q < 4; q++) {
      var ang = q * Math.PI / 2 + t * 0.002;
      ctx.beginPath(); ctx.arc(x, y, r + 6, ang - 0.18, ang + 0.18); ctx.stroke();
    }
    // crosshair
    ctx.strokeStyle = "rgba(" + PAL.lens + ",0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
    ctx.stroke();
    ctx.restore();
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

  // --- input ---
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
    setLensFromEvent(e);
    for (var i = 0; i < 4 && cells.length < MAX_CELLS + 10; i++) {
      cells.push(makeCell(lens.tx + rand(-20, 20), lens.ty + rand(-20, 20), Math.random() > 0.5 ? "ecoli" : "salm"));
    }
  });
  canvas.addEventListener("touchstart", setLensFromEvent, { passive: true });

  window.addEventListener("resize", function () { resize(); if (reduce) draw(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
  }

  resize();
  if (reduce) {
    // static frame for reduced-motion users
    for (var i = 0; i < 60; i++) update();
    draw();
  } else {
    loop();
  }
})();
