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
    { name: "Jared", id: "tI9C-mhf1P4", line: "Lost his high-paying government job, now making big money with couches", x: 550, y: 265, shirt: "#9b5de5", skin: "#c68642", hair: "#1b1b1b" },
    { name: "Keon", id: "08neLxi2O70", line: "Mechanic to full-time flipper: $87k in 5 months", x: 760, y: 205, shirt: "#f15bb5", skin: "#8d5524", hair: "#111" },
    { name: "Korben", id: "WuWjqxkriXI", line: "Over $50k in his first year, still in high school", x: 895, y: 290, shirt: "#fee440", skin: "#f1c27d", hair: "#a0522d" },
    { name: "Charles", id: "2va_p0bHc2c", line: "“Dylan has helped MANY flippers take their business to new heights!”", x: 420, y: 375, shirt: "#00bbf9", skin: "#8d5524", hair: "#111" },
    { name: "Jacob", id: "J_PNlIKEieg", line: "From standstill to a record-breaking month", x: 680, y: 375, shirt: "#ff595e", skin: "#e0ac69", hair: "#4a3020" },
    { name: "Brian", id: "AursKf5fDu4", line: "Was a teacher, now makes $3,000–$5,000 per week selling couches", x: 205, y: 490, shirt: "#8ac926", skin: "#c68642", hair: "#2a1a0f" },
    { name: "Cody", id: "aJC1ueLAHWI", line: "\u201cDylan made the process super simple and easy to understand\u201d", x: 895, y: 490, shirt: "#ffca3a", skin: "#f1c27d", hair: "#c68a3a" }
  ];

  var W = 1100, H = 700;        // world size
  var WALL = 96;                // top wall depth
  // furniture-store showroom: display couches with price tags
  var couches = [
    // back wall
    { x: 40, y: 108, w: 150, h: 56, c: "#7a6a58", tag: "$650" },
    { x: 290, y: 108, w: 120, h: 56, c: "#3f5f8a", n: 2, tag: "SOLD", tagL: true },
    { x: 480, y: 108, w: 140, h: 56, c: "#8a4a3a", tag: "$480" },
    { x: 690, y: 108, w: 120, h: 56, c: "#4f7a5a", n: 2, tag: "SOLD", tagL: true },
    { x: 910, y: 108, w: 150, h: 56, c: "#5a5a66", tag: "$720" },
    // floor displays
    // L-shaped sectionals
    { c: "#4a5a7a", tag: "$850", rug: "#3a2f4a", parts: [{ x: 120, y: 175, w: 170, h: 56, back: "t" }, { x: 120, y: 175, w: 56, h: 98, back: "l" }] },
    { c: "#2f6f6a", tag: "SOLD", rug: "#2a3a3a", parts: [{ x: 810, y: 175, w: 170, h: 56, back: "t" }, { x: 924, y: 175, w: 56, h: 98, back: "r" }] },
    // U-shaped sectional around the coffee table
    { c: "#6b3a4a", tag: "$1,200", rug: "#1f3a6a", parts: [{ x: 456, y: 300, w: 188, h: 50, back: "t" }, { x: 456, y: 300, w: 44, h: 130, back: "l" }, { x: 600, y: 300, w: 44, h: 130, back: "r" }] },
    { x: 40, y: 330, w: 62, h: 56, c: "#a07a3a", n: 1, tag: "$180" },
    { x: 998, y: 330, w: 62, h: 56, c: "#7a3a5a", n: 1, tag: "SOLD" },
    { x: 290, y: 430, w: 110, h: 52, c: "#5a6a3a", n: 2, tag: "$320" },
    { x: 700, y: 430, w: 110, h: 52, c: "#3a4a6a", n: 2, tag: "$350" },
    { c: "#2f6f6a", tag: "SOLD", rug: "#2a2f45", parts: [{ x: 110, y: 610, w: 190, h: 50, back: "b" }, { x: 110, y: 545, w: 50, h: 115, back: "l" }, { x: 250, y: 545, w: 50, h: 115, back: "r" }] },
    { c: "#4a5a7a", tag: "$950", rug: "#3a2f2a", parts: [{ x: 800, y: 606, w: 180, h: 50, back: "b" }, { x: 930, y: 545, w: 50, h: 111, back: "r" }] },
    { x: 350, y: 600, w: 62, h: 56, c: "#8a5a3a", n: 1, tag: "$150" }
  ];
  var tables = [{ x: 500, y: 388, w: 100, h: 34 }];
  var counter = { x: 650, y: 610, w: 130, h: 44 };
  var plants = [{ x: 230, y: 130 }, { x: 870, y: 130 }, { x: 46, y: 660 }, { x: 1054, y: 660 }];
  var lamps = [{ x: 440, y: 130 }, { x: 650, y: 130 }, { x: 70, y: 450 }, { x: 1030, y: 450 }];
  couches.forEach(function (c) {                     // bounding box for sectionals
    if (!c.parts) return;
    var x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0;
    c.parts.forEach(function (p) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x + p.w); y1 = Math.max(y1, p.y + p.h); });
    c.x = x0; c.y = y0; c.w = x1 - x0; c.h = y1 - y0;
  });
  var solids = [].concat.apply([], couches.map(function (c) { return c.parts || [c]; })).concat(tables).concat([counter])
    .concat(plants.map(function (p) { return { x: p.x - 18, y: p.y - 18, w: 36, h: 36 }; }))
    .concat(lamps.map(function (p) { return { x: p.x - 10, y: p.y - 10, w: 20, h: 20 }; }));

  var player = { x: 550, y: 640, r: 14, dir: 1, walk: 0, moving: false };
  var target = null, pendingOpen = null, near = null, active = false;
  var keys = {}, watched = {};
  var cam = { x: 0, y: 0 }, scale = 1, vw = 0, vh = 0, dpr = 1;
  var touch = matchMedia("(pointer: coarse)").matches;

  hintEl.textContent = touch ? "Use the joystick or tap anywhere to walk • Tap a person to hear their story" : "Joystick, arrow keys / WASD, or click to walk • E to watch";

  function resize() {
    var pw = box.parentElement.clientWidth, cssW = pw, cssH;
    // room for the game = what's left of the first screen below the header (+ the hint line under it)
    var avail = window.innerHeight - (box.getBoundingClientRect().top + window.scrollY) - 34;
    if (cssW >= 600) {                                       // wide: whole room fits on screen
      cssH = Math.round(Math.max(360, Math.min(H * pw / W, avail)));
      cssW = Math.min(pw, Math.round(cssH * W / H));          // shrink the box to the room, no empty bands
      scale = cssW / W; cssH = Math.round(H * scale);
      box.style.width = cssW + "px";
    } else {
      box.style.width = "";                                                 // phone: camera follows you
      scale = 0.55; cssH = Math.round(Math.max(330, Math.min(520, cssW * 1.15, avail)));
    }
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
    active = true; startEl.hidden = true; box.classList.add("on"); cv.focus({ preventScroll: true });
  });

  // ---- joystick ----
  var joyEl = box.querySelector(".joy"), knob = joyEl.querySelector(".joy-knob"), joy = { x: 0, y: 0 }, joyId = null;
  function joyMove(e) {
    var r = joyEl.getBoundingClientRect(), R = r.width / 2;
    var x = e.clientX - (r.left + R), y = e.clientY - (r.top + R), d = Math.hypot(x, y), max = R - 14;
    if (d > max) { x = x / d * max; y = y / d * max; }
    knob.style.transform = "translate(" + x + "px," + y + "px)";
    joy.x = x / max; joy.y = y / max;
  }
  function joyEnd() { joyId = null; joy.x = joy.y = 0; knob.style.transform = ""; }
  joyEl.addEventListener("pointerdown", function (e) {
    e.stopPropagation(); e.preventDefault(); joyId = e.pointerId; target = null; pendingOpen = null;
    try { joyEl.setPointerCapture(e.pointerId); } catch (err) {}
    joyMove(e);
  });
  joyEl.addEventListener("pointermove", function (e) { if (e.pointerId === joyId) joyMove(e); });
  joyEl.addEventListener("pointerup", joyEnd); joyEl.addEventListener("pointercancel", joyEnd);

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
    // wood showroom floor
    ctx.fillStyle = "#2a1f18"; ctx.fillRect(0, 0, W, H);
    for (var y = WALL, row = 0; y < H; y += 28, row++) {
      ctx.fillStyle = row % 2 ? "#2e2219" : "#33261c"; ctx.fillRect(0, y, W, 28);
      ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.fillRect(0, y, W, 1);
      for (var x = (row % 3) * 70; x < W; x += 210) ctx.fillRect(x, y, 1, 28);
    }
    // rugs under the floor displays
    couches.forEach(function (c) {
      if (!c.rug) return;
      rr(c.x - 22, c.y - 14, c.w + 44, c.h + 46, 8); ctx.fillStyle = c.rug; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 2; rr(c.x - 16, c.y - 8, c.w + 32, c.h + 34, 6); ctx.stroke();
    });
    rr(400, 270, 300, 180, 18); ctx.fillStyle = "rgba(31,139,255,.16)"; ctx.fill();
    ctx.strokeStyle = "rgba(95,212,255,.35)"; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
    // walls
    ctx.fillStyle = "#0a1a44"; ctx.fillRect(0, 0, W, WALL);
    ctx.fillStyle = "#e8e1d4"; ctx.fillRect(0, WALL - 10, W, 10);                                // baseboard
    ctx.fillStyle = "#0a1a44"; ctx.fillRect(0, WALL, 12, H); ctx.fillRect(W - 12, WALL, 12, H); ctx.fillRect(0, H - 12, W, 12);
    ctx.fillStyle = "#1f8bff"; ctx.fillRect(505, H - 12, 90, 12);                               // front door
    // store sign
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "40px 'Bebas Neue', Impact, sans-serif";
    ctx.shadowColor = "#38b6ff"; ctx.shadowBlur = 18; ctx.fillStyle = "#bfe9ff";
    ctx.fillText("COUCH FLIPPING ACADEMY FURNITURE", W / 2, 38, 600);
    ctx.shadowBlur = 0; ctx.font = "16px 'Barlow Condensed', sans-serif"; ctx.fillStyle = "#7fa6d9";
    ctx.fillText("SHOWROOM • MEET OUR STUDENTS • WALL OF WINS", W / 2, 70);
    ctx.restore();
    // wall banners
    [[40, "SALE"], [130, "NEW"], [906, "SOLD!"], [996, "OPEN"]].forEach(function (b) {
      ctx.fillStyle = b[1] === "SALE" || b[1] === "SOLD!" ? "#d63a3a" : "#1f8bff"; ctx.fillRect(b[0], 18, 64, 40);
      ctx.fillStyle = "#fff"; ctx.font = "20px 'Bebas Neue', Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(b[1], b[0] + 32, 39, 56);
    });
  }
  function drawSectional(c) {
    c.parts.forEach(function (p) { ctx.fillStyle = "rgba(0,0,0,.35)"; rr(p.x + 4, p.y + 8, p.w, p.h, 10); ctx.fill(); });
    c.parts.forEach(function (p) { ctx.fillStyle = c.c; rr(p.x, p.y, p.w, p.h, 8); ctx.fill(); });
    ctx.fillStyle = shade(c.c, -25);
    c.parts.forEach(function (p) {
      var b = 20;
      if (p.back === "t") rr(p.x, p.y, p.w, b, 8); else if (p.back === "b") rr(p.x, p.y + p.h - b, p.w, b, 8);
      else if (p.back === "l") rr(p.x, p.y, b, p.h, 8); else rr(p.x + p.w - b, p.y, b, p.h, 8);
      ctx.fill();
    });
    ctx.strokeStyle = shade(c.c, -15); ctx.lineWidth = 2;               // cushion seams
    c.parts.forEach(function (p) {
      var horiz = p.back === "t" || p.back === "b", len = horiz ? p.w : p.h, n = Math.max(1, Math.round(len / 60)), st = len / n;
      for (var i = 1; i < n; i++) {
        ctx.beginPath();
        if (horiz) { ctx.moveTo(p.x + st * i, p.y + (p.back === "t" ? 22 : 4)); ctx.lineTo(p.x + st * i, p.y + p.h - (p.back === "t" ? 4 : 22)); }
        else { ctx.moveTo(p.x + (p.back === "l" ? 22 : 4), p.y + st * i); ctx.lineTo(p.x + p.w - (p.back === "l" ? 4 : 22), p.y + st * i); }
        ctx.stroke();
      }
    });
    ctx.fillStyle = shade(c.c, 30);                                       // throw pillows
    c.parts.forEach(function (p) {
      if (p.back === "t") { rr(p.x + p.w - 34, p.y + 6, 18, 14, 4); ctx.fill(); }
      else if (p.back === "b") { rr(p.x + p.w / 2 - 9, p.y + p.h - 20, 18, 14, 4); ctx.fill(); }
      else if (p.back === "l") { rr(p.x + 4, p.y + p.h - 30, 14, 18, 4); ctx.fill(); }
      else { rr(p.x + p.w - 18, p.y + p.h - 30, 14, 18, 4); ctx.fill(); }
    });
    drawTag(c);
  }
  function drawTag(c) {
    if (!c.tag) return;
    var sold = c.tag === "SOLD", ty = c.y - 6;
    ctx.font = "13px 'Bebas Neue', Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var tw = ctx.measureText(c.tag).width + 12, tx = c.tagL ? c.x + tw / 2 + 2 : c.x + c.w - tw / 2 - 2;
    ctx.fillStyle = sold ? "#d63a3a" : "#fff8e6"; rr(tx - tw / 2, ty, tw, 16, 3); ctx.fill();
    ctx.fillStyle = sold ? "#fff" : "#1c2440"; ctx.fillText(c.tag, tx, ty + 9);
  }
  function drawCouch(c) {
    if (c.parts) return drawSectional(c);
    var n = c.n || 3;
    ctx.fillStyle = "rgba(0,0,0,.35)"; rr(c.x + 4, c.y + 8, c.w, c.h, 10); ctx.fill();
    ctx.fillStyle = shade(c.c, -25); rr(c.x, c.y, c.w, 24, 10); ctx.fill();                  // back
    ctx.fillStyle = c.c; rr(c.x, c.y + 16, c.w, c.h - 16, 8); ctx.fill();                     // seat
    ctx.fillStyle = shade(c.c, -35); rr(c.x - 6, c.y + 10, 16, c.h - 8, 6); ctx.fill(); rr(c.x + c.w - 10, c.y + 10, 16, c.h - 8, 6); ctx.fill();
    ctx.strokeStyle = shade(c.c, -15); ctx.lineWidth = 2;
    var cw = (c.w - 20) / n;
    for (var i = 1; i < n; i++) { ctx.beginPath(); ctx.moveTo(c.x + 10 + cw * i, c.y + 22); ctx.lineTo(c.x + 10 + cw * i, c.y + c.h - 6); ctx.stroke(); }
    if (n > 1) { ctx.fillStyle = shade(c.c, 30); rr(c.x + 14, c.y + 6, 18, 14, 4); ctx.fill(); rr(c.x + c.w - 32, c.y + 6, 18, 14, 4); ctx.fill(); } // pillows
    drawTag(c);
  }
  function drawTable(t) {
    ctx.fillStyle = "rgba(0,0,0,.35)"; rr(t.x + 3, t.y + 6, t.w, t.h, 6); ctx.fill();
    ctx.fillStyle = "#7a5233"; rr(t.x, t.y, t.w, t.h, 6); ctx.fill();
    ctx.fillStyle = "#1f8bff"; ctx.fillRect(t.x + 30, t.y + 9, 40, 14);                         // laptop
  }
  function drawCounter(k) {
    ctx.fillStyle = "rgba(0,0,0,.35)"; rr(k.x + 4, k.y + 6, k.w, k.h, 6); ctx.fill();
    ctx.fillStyle = "#e8e1d4"; rr(k.x, k.y, k.w, k.h, 6); ctx.fill();
    ctx.fillStyle = "#1f8bff"; ctx.fillRect(k.x, k.y + k.h - 10, k.w, 10);
    ctx.fillStyle = "#1c2440"; rr(k.x + 14, k.y + 6, 34, 22, 3); ctx.fill();                      // register
    ctx.fillStyle = "#2bb673"; ctx.fillRect(k.x + 18, k.y + 10, 26, 8);
    ctx.fillStyle = "#1c2440"; ctx.font = "14px 'Bebas Neue', Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("CHECKOUT", k.x + 88, k.y + 18);
  }
  function drawLamp(p) {
    ctx.fillStyle = "rgba(255,214,120,.10)"; ctx.beginPath(); ctx.arc(p.x, p.y, 34, 0, 7); ctx.fill();
    ctx.fillStyle = "#1c2440"; ctx.fillRect(p.x - 2, p.y - 22, 4, 26); ctx.fillRect(p.x - 8, p.y + 2, 16, 4);
    ctx.fillStyle = "#ffd678"; ctx.beginPath(); ctx.moveTo(p.x - 12, p.y - 18); ctx.lineTo(p.x + 12, p.y - 18); ctx.lineTo(p.x + 7, p.y - 32); ctx.lineTo(p.x - 7, p.y - 32); ctx.closePath(); ctx.fill();
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
    var sp = 200 * dt, dx = 0, dy = 0, jm = 0;
    if (active && !modalOpen()) {
      if (keys.l) dx -= 1; if (keys.r) dx += 1; if (keys.u) dy -= 1; if (keys.d) dy += 1;
      jm = Math.hypot(joy.x, joy.y);
      if (!dx && !dy && jm > 0.15) { dx = joy.x; dy = joy.y; target = null; pendingOpen = null; }
      if (!dx && !dy && target) {
        var tx = target.x - player.x, ty = target.y - player.y, d = Math.hypot(tx, ty);
        if (d < 4) { target = null; if (pendingOpen) { var n = pendingOpen; pendingOpen = null; openVideo(n); } }
        else { dx = tx / d; dy = ty / d; }
      }
    }
    if (dx || dy) {
      var len = Math.hypot(dx, dy), k = (jm > 0.15 && !keys.l && !keys.r && !keys.u && !keys.d) ? Math.min(1, jm) : 1;
      dx = dx / len * sp * k; dy = dy / len * sp * k;
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
    couches.forEach(drawCouch); tables.forEach(drawTable); drawCounter(counter); lamps.forEach(drawLamp); plants.forEach(drawPlant);

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
