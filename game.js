// "Wall of Wins" mini game room on the thank-you page.
// Walk around (arrow keys / WASD, or tap where to go), get close to a past
// student and press E / tap "Watch" to see their video testimonial.
(function () {
  var box = document.getElementById("room");
  if (!box) return;
  var cv = box.querySelector("canvas"), ctx = cv.getContext("2d");
  var promptEl = box.querySelector(".room-prompt"), startEl = box.querySelector(".room-start");
  var hintEl = document.querySelector(".room-hint"), countEl = document.getElementById("room-count");

  var STUDENTS = [
    { name: "Nick", id: "1Z6J4BZFjaQ", line: "Scaled to over $100k in a single month", x: 205, y: 290, shirt: "#e8833a", skin: "#f1c27d", hair: "#3b2a1a" },
    { name: "Luke", id: "1AD1dkhRoA0", line: "Made over $200k in his first full year", x: 345, y: 205, shirt: "#2bb673", skin: "#e0ac69", hair: "#6b4423" },
    { name: "Jared", id: "tI9C-mhf1P4", line: "Hear Jared's story", x: 550, y: 265, shirt: "#9b5de5", skin: "#c68642", hair: "#1b1b1b" },
    { name: "Keon", id: "08neLxi2O70", line: "Mechanic to full-time flipper: $87k in 5 months", x: 760, y: 205, shirt: "#f15bb5", skin: "#8d5524", hair: "#111" },
    { name: "Korben", id: "WuWjqxkriXI", line: "Over $50k in his first year, still in high school", x: 895, y: 290, shirt: "#fee440", skin: "#f1c27d", hair: "#a0522d" },
    { name: "Charles", id: "2va_p0bHc2c", line: "“Dylan has helped MANY flippers take their business to new heights!”", x: 420, y: 375, shirt: "#00bbf9", skin: "#8d5524", hair: "#111" },
    { name: "Jacob", id: "J_PNlIKEieg", line: "From standstill to a record-breaking month", x: 680, y: 375, shirt: "#ff595e", skin: "#e0ac69", hair: "#4a3020" },
    { name: "Brian", id: "AursKf5fDu4", line: "Hear Brian's story", x: 205, y: 490, shirt: "#8ac926", skin: "#c68642", hair: "#2a1a0f" },
    { name: "Cody", id: "aJC1ueLAHWI", line: "Hear Cody's story", x: 895, y: 490, shirt: "#ffca3a", skin: "#f1c27d", hair: "#c68a3a" }
  ];

  var W = 1100, H = 700;        // world size
  var WALL = 96;                // top wall depth
  var couches = [
    { x: 120, y: 160, w: 170, h: 62, c: "#4a5a7a" },
    { x: 810, y: 160, w: 170, h: 62, c: "#2f6f6a" },
    { x: 470, y: 300, w: 160, h: 62, c: "#6b3a4a" },
    { x: 120, y: 560, w: 170, h: 62, c: "#2f6f6a" },
    { x: 810, y: 560, w: 170, h: 62, c: "#4a5a7a" }
  ];
  var tables = [{ x: 500, y: 388, w: 100, h: 34 }];
  var plants = [{ x: 46, y: 130 }, { x: 1054, y: 130 }, { x: 46, y: 660 }, { x: 1054, y: 660 }];
  var solids = couches.concat(tables).concat(plants.map(function (p) { return { x: p.x - 18, y: p.y - 18, w: 36, h: 36 }; }));

  var player = { x: 550, y: 640, r: 14, dir: 1, walk: 0, moving: false };
  var target = null, pendingOpen = null, near = null, active = false;
  var keys = {}, watched = {};
  var cam = { x: 0, y: 0 }, scale = 1, vw = 0, vh = 0, dpr = 1;
  var touch = matchMedia("(pointer: coarse)").matches;

  hintEl.textContent = touch ? "Tap anywhere to walk • Tap a person to hear their story" : "Arrow keys / WASD to walk • E to watch • or just click where to go";

  function resize() {
    var cssW = box.clientWidth;
    var cssH;
    if (cssW >= 600) { scale = cssW / W; cssH = Math.round(H * scale); }   // wide: whole room fits
    else { scale = 0.55; cssH = Math.round(Math.min(520, Math.max(380, cssW * 1.15))); } // phone: camera follows you
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.style.height = cssH + "px";
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    vw = cssW / scale; vh = cssH / scale;
  }

  // ---- collision ----
  function hits(x, y, r) {
    if (x - r < 14 || x + r > W - 14 || y - r < WALL || y + r > H - 14) return true;
    for (var i = 0; i < solids.length; i++) {
      var s = solids[i];
      var cx = Math.max(s.x, Math.min(x, s.x + s.w)), cy = Math.max(s.y, Math.min(y, s.y + s.h));
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r) return true;
    }
    for (var j = 0; j < STUDENTS.length; j++) {
      var n = STUDENTS[j], dx = x - n.x, dy = y - n.y;
      if (dx * dx + dy * dy < (r + 15) * (r + 15)) return true;
    }
    return false;
  }
  function move(dx, dy) {
    var moved = false;
    if (dx && !hits(player.x + dx, player.y, player.r)) { player.x += dx; moved = true; }
    if (dy && !hits(player.x, player.y + dy, player.r)) { player.y += dy; moved = true; }
    return moved;
  }

  // ---- input ----
  var KEYMAP = { ArrowUp: "u", KeyW: "u", ArrowDown: "d", KeyS: "d", ArrowLeft: "l", KeyA: "l", ArrowRight: "r", KeyD: "r" };
  window.addEventListener("keydown", function (e) {
    if (!active || modalOpen()) return;
    if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = true; target = null; pendingOpen = null; e.preventDefault(); }
    if ((e.code === "KeyE" || e.code === "Enter" || e.code === "Space") && near) { openVideo(near); e.preventDefault(); }
  });
  window.addEventListener("keyup", function (e) { if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false; });

  function toWorld(e) {
    var r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale + cam.x, y: (e.clientY - r.top) / scale + cam.y };
  }
  cv.addEventListener("pointerdown", function (e) {
    if (!active) return;
    var p = toWorld(e), hit = null;
    STUDENTS.forEach(function (n) {
      var dx = p.x - n.x, dy = p.y - (n.y - 14);
      if (dx * dx + dy * dy < 34 * 34) hit = n;
    });
    if (hit) {
      var ax = player.x - hit.x, ay = player.y - hit.y, d = Math.hypot(ax, ay) || 1;
      if (d < 70) { openVideo(hit); return; }
      target = { x: hit.x + ax / d * 40, y: hit.y + ay / d * 40 }; pendingOpen = hit;
    } else { target = p; pendingOpen = null; }
  });

  startEl.addEventListener("click", function () {
    active = true; startEl.hidden = true; cv.focus({ preventScroll: true });
  });

  // ---- video modal ----
  var modal = document.getElementById("vid-modal"), vidFrame = modal.querySelector(".vid-frame");
  function modalOpen() { return !modal.hidden; }
  function openVideo(n) {
    keys = {}; target = null; pendingOpen = null;
    vidFrame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + n.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="' + n.name + '\'s story"></iframe>';
    modal.querySelector(".vid-name").textContent = n.name;
    modal.querySelector(".vid-line").textContent = n.line;
    modal.hidden = false; document.body.style.overflow = "hidden";
    watched[n.name] = true; updateCount();
  }
  function closeVideo() {
    modal.hidden = true; vidFrame.innerHTML = ""; document.body.style.overflow = "";
    if (active) cv.focus({ preventScroll: true });
  }
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest(".vid-close")) closeVideo(); });
  window.addEventListener("keydown", function (e) { if (e.code === "Escape" && modalOpen()) closeVideo(); });
  promptEl.querySelector("button").addEventListener("click", function () { if (near) openVideo(near); });
  document.querySelectorAll("[data-student]").forEach(function (b) {
    b.addEventListener("click", function () {
      var n = STUDENTS.filter(function (s) { return s.name === b.getAttribute("data-student"); })[0];
      if (n) openVideo(n);
    });
  });
  function updateCount() {
    var c = Object.keys(watched).length;
    countEl.textContent = c + " / " + STUDENTS.length + " stories watched";
    document.querySelectorAll("[data-student]").forEach(function (b) { b.classList.toggle("seen", !!watched[b.getAttribute("data-student")]); });
  }

  // ---- drawing ----
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
  function drawFloor() {
    ctx.fillStyle = "#081636"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(80,160,255,.08)"; ctx.lineWidth = 1;
    for (var x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, WALL); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = WALL; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // rug
    rr(400, 270, 300, 180, 18); ctx.fillStyle = "rgba(31,139,255,.10)"; ctx.fill();
    ctx.strokeStyle = "rgba(95,212,255,.35)"; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
    // walls
    ctx.fillStyle = "#050d26"; ctx.fillRect(0, 0, W, WALL);
    ctx.fillStyle = "#0b1d4d"; ctx.fillRect(0, WALL - 10, W, 10);
    ctx.fillStyle = "#050d26"; ctx.fillRect(0, WALL, 12, H); ctx.fillRect(W - 12, WALL, 12, H); ctx.fillRect(0, H - 12, W, 12);
    // door gap at bottom
    ctx.fillStyle = "#1f8bff"; ctx.fillRect(505, H - 12, 90, 12);
    // neon sign
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "44px 'Bebas Neue', Impact, sans-serif";
    ctx.shadowColor = "#38b6ff"; ctx.shadowBlur = 18; ctx.fillStyle = "#bfe9ff";
    ctx.fillText("THE WALL OF WINS", W / 2, 40);
    ctx.shadowBlur = 0; ctx.font = "16px 'Barlow Condensed', sans-serif"; ctx.fillStyle = "#7fa6d9";
    ctx.fillText("COUCH FLIPPING ACADEMY • STUDENT LOUNGE", W / 2, 72);
    ctx.restore();
    // framed "photos" on wall
    [[110, 22], [230, 22], [810, 22], [930, 22]].forEach(function (p) {
      ctx.fillStyle = "#0e2a63"; ctx.fillRect(p[0], p[1], 60, 44);
      ctx.strokeStyle = "#38b6ff"; ctx.lineWidth = 2; ctx.strokeRect(p[0], p[1], 60, 44);
      ctx.fillStyle = "#38b6ff"; ctx.font = "20px 'Bebas Neue', sans-serif"; ctx.textAlign = "center"; ctx.fillText("$", p[0] + 30, p[1] + 30);
    });
  }
  function drawCouch(c) {
    ctx.fillStyle = "rgba(0,0,0,.35)"; rr(c.x + 4, c.y + 8, c.w, c.h, 10); ctx.fill();
    ctx.fillStyle = shade(c.c, -25); rr(c.x, c.y, c.w, 24, 10); ctx.fill();                  // back
    ctx.fillStyle = c.c; rr(c.x, c.y + 16, c.w, c.h - 16, 8); ctx.fill();                     // seat
    ctx.fillStyle = shade(c.c, -35); rr(c.x - 6, c.y + 10, 16, c.h - 8, 6); ctx.fill(); rr(c.x + c.w - 10, c.y + 10, 16, c.h - 8, 6); ctx.fill();
    ctx.strokeStyle = shade(c.c, -15); ctx.lineWidth = 2;
    var n = 3, cw = (c.w - 20) / n;
    for (var i = 1; i < n; i++) { ctx.beginPath(); ctx.moveTo(c.x + 10 + cw * i, c.y + 22); ctx.lineTo(c.x + 10 + cw * i, c.y + c.h - 6); ctx.stroke(); }
  }
  function drawTable(t) {
    ctx.fillStyle = "rgba(0,0,0,.35)"; rr(t.x + 3, t.y + 6, t.w, t.h, 6); ctx.fill();
    ctx.fillStyle = "#7a5233"; rr(t.x, t.y, t.w, t.h, 6); ctx.fill();
    ctx.fillStyle = "#1f8bff"; ctx.fillRect(t.x + 30, t.y + 9, 40, 14);                         // laptop
  }
  function drawPlant(p) {
    ctx.fillStyle = "#5a3b22"; rr(p.x - 14, p.y - 4, 28, 22, 4); ctx.fill();
    ctx.fillStyle = "#2bb673";
    [[-10, -10], [10, -10], [0, -20], [-14, -2], [14, -2]].forEach(function (o) { ctx.beginPath(); ctx.arc(p.x + o[0], p.y + o[1], 10, 0, 7); ctx.fill(); });
  }
  function drawPerson(x, y, o, t) {
    var bob = o.moving ? Math.sin(o.walk) * 4 : 0, idle = o.idle ? Math.sin(t / 500 + o.idle) * 1.5 : 0;
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x, y + 2, 15, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#1c2440";                                                                  // legs
    ctx.fillRect(x - 8, y - 14 + (bob > 0 ? -2 : 0), 6, 14); ctx.fillRect(x + 2, y - 14 + (bob < 0 ? -2 : 0), 6, 14);
    ctx.fillStyle = o.shirt; rr(x - 13, y - 38 + idle, 26, 27, 8); ctx.fill();                   // body
    ctx.fillStyle = o.skin; ctx.beginPath(); ctx.arc(x, y - 48 + idle, 11, 0, 7); ctx.fill();    // head
    ctx.fillStyle = o.hair; ctx.beginPath(); ctx.arc(x, y - 51 + idle, 11, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    ctx.fillStyle = "#111"; var fx = (o.dir || 0) * 3;                                          // eyes
    ctx.fillRect(x - 5 + fx, y - 49 + idle, 2.5, 3); ctx.fillRect(x + 3 + fx, y - 49 + idle, 2.5, 3);
  }
  function label(x, y, text, bg, fg) {
    ctx.font = "15px 'Bebas Neue', Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var w = ctx.measureText(text).width + 14;
    ctx.fillStyle = bg; rr(x - w / 2, y - 10, w, 20, 10); ctx.fill();
    ctx.fillStyle = fg; ctx.fillText(text, x, y + 1);
  }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // ---- loop ----
  var last = performance.now();
  function frame(t) {
    var dt = Math.min(0.05, (t - last) / 1000); last = t;
    var sp = 200 * dt, dx = 0, dy = 0;
    if (active && !modalOpen()) {
      if (keys.l) dx -= 1; if (keys.r) dx += 1; if (keys.u) dy -= 1; if (keys.d) dy += 1;
      if (!dx && !dy && target) {
        var tx = target.x - player.x, ty = target.y - player.y, d = Math.hypot(tx, ty);
        if (d < 4) { target = null; if (pendingOpen) { var n = pendingOpen; pendingOpen = null; openVideo(n); } }
        else { dx = tx / d; dy = ty / d; }
      }
    }
    if (dx || dy) {
      var len = Math.hypot(dx, dy); dx = dx / len * sp; dy = dy / len * sp;
      player.moving = move(dx, dy);
      if (!player.moving && target) { target = null; if (pendingOpen) { var p2 = pendingOpen; pendingOpen = null; if (Math.hypot(player.x - p2.x, player.y - p2.y) < 90) openVideo(p2); } }
      if (dx) player.dir = dx > 0 ? 1 : -1;
      player.walk += dt * 14;
    } else player.moving = false;

    // nearest student
    near = null; var best = 75;
    STUDENTS.forEach(function (n) { var d = Math.hypot(player.x - n.x, player.y - n.y); if (d < best) { best = d; near = n; } });
    if (near && active) {
      promptEl.hidden = false;
      promptEl.querySelector(".rp-name").textContent = near.name;
      promptEl.querySelector(".rp-line").textContent = near.line;
      promptEl.querySelector("button").textContent = touch ? "▶ Watch" : "▶ Watch (E)";
    } else promptEl.hidden = true;

    // camera
    cam.x = Math.max(0, Math.min(W - vw, player.x - vw / 2)); if (vw >= W) cam.x = (W - vw) / 2;
    cam.y = Math.max(0, Math.min(H - vh, player.y - vh / 2)); if (vh >= H) cam.y = (H - vh) / 2;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#040a1f"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, -cam.x * dpr * scale, -cam.y * dpr * scale);
    drawFloor();
    couches.forEach(drawCouch); tables.forEach(drawTable); plants.forEach(drawPlant);

    // depth-sort people
    var people = STUDENTS.map(function (n, i) { return { o: n, y: n.y, npc: true, i: i }; });
    people.push({ o: player, y: player.y, npc: false });
    people.sort(function (a, b) { return a.y - b.y; });
    people.forEach(function (p) {
      if (p.npc) {
        var n = p.o; n.idle = n.idle || (p.i + 1) * 1.7; n.dir = player.x > n.x ? 1 : -1;
        if (n === near) { ctx.fillStyle = "rgba(56,182,255,.25)"; ctx.beginPath(); ctx.ellipse(n.x, n.y + 2, 26, 11, 0, 0, 7); ctx.fill(); }
        drawPerson(n.x, n.y, n, t);
        label(n.x, n.y - 72, n.name, watched[n.name] ? "#1d7a4a" : "rgba(5,13,38,.85)", "#fff");
        var by = n.y - 96 + Math.sin(t / 300 + p.i) * 3;                                          // bubble
        ctx.fillStyle = watched[n.name] ? "#2bb673" : "#1f8bff";
        ctx.beginPath(); ctx.arc(n.x, by, 10, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "12px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(watched[n.name] ? "✓" : "▶", n.x + (watched[n.name] ? 0 : 1), by + 1);
      } else {
        ctx.strokeStyle = "rgba(95,212,255,.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(player.x, player.y + 2, 18, 7, 0, 0, 7); ctx.stroke();
        drawPerson(player.x, player.y, { shirt: "#1f8bff", skin: "#e0ac69", hair: "#2a1a0f", moving: player.moving, walk: player.walk, dir: player.dir }, t);
        label(player.x, player.y - 72, "YOU", "#1f8bff", "#fff");
      }
    });
    if (target) { ctx.strokeStyle = "rgba(95,212,255,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(target.x, target.y, 8 + Math.sin(t / 120) * 2, 0, 7); ctx.stroke(); }
    requestAnimationFrame(frame);
  }

  resize(); window.addEventListener("resize", resize); updateCount();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { requestAnimationFrame(frame); });
})();
