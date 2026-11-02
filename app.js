(function () {
  var C = window.CFA_CONFIG || {};

  var TZ = "America/New_York";
  var parts = function (d, opts) {
    var p = {};
    new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: TZ }, opts))
      .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return p;
  };
  var NUM = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" };

  // Eastern wall-clock time -> real Date (handles EST/EDT)
  var eastern = function (y, m, d, hh, mm) {
    for (var off = 4; off <= 5; off++) {
      var t = new Date(Date.UTC(y, m - 1, d, hh + off, mm));
      var p = parts(t, NUM);
      if (+p.day === d && +p.hour === hh && +p.minute === mm) return t;
    }
    return new Date(Date.UTC(y, m - 1, d, hh + 5, mm));
  };

  // Build the list of sessions: the weekly schedule plus any one-offs
  var lenMs = (C.workshopLengthHours || 2) * 3600000;
  var sessions = [];
  var S = C.schedule;
  if (S && S.weekday && S.time) {
    var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var wd = days.indexOf(String(S.weekday).toLowerCase());
    var hm = S.time.split(":");
    var today = parts(new Date(), NUM);
    for (var i = 0; i < 70; i++) {
      var day = new Date(Date.UTC(+today.year, +today.month - 1, +today.day + i));
      if (day.getUTCDay() !== wd) continue;
      var ymd = day.toISOString().slice(0, 10);
      if ((S.skip || []).indexOf(ymd) > -1) continue;
      sessions.push({ date: eastern(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), +hm[0], +hm[1] || 0), zoom: S.zoom });
    }
  }
  (C.workshops || []).forEach(function (w) {
    sessions.push({ date: new Date(w.start), zoom: w.zoom || (S && S.zoom), label: w.label });
  });
  sessions.sort(function (a, b) { return a.date - b.date; });

  // Next session that hasn't ended yet
  var W = null;
  sessions.forEach(function (s) { if (!W && s.date.getTime() + lenMs > Date.now()) W = s; });

  // "Saturday, Nov 7 @ 8:00 PM EST"
  var label = function (d) {
    var p = parts(d, { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
    return p.weekday + ", " + p.month + " " + p.day + " @ " + p.hour + ":" + p.minute + " " + p.dayPeriod + " " + p.timeZoneName;
  };
  // "MM-DD-YYYY HH:MM" in Eastern time, the format GHL date fields accept
  var ghlDate = function (d) {
    var p = parts(d, NUM);
    return p.month + "-" + p.day + "-" + p.year + " " + p.hour + ":" + p.minute;
  };
  if (W) { W.label = W.label || label(W.date); C.workshopStart = W.date.toISOString(); C.workshopLabel = W.label; }

  document.querySelectorAll("[data-when]").forEach(function (el) {
    el.textContent = C.workshopLabel || "Date & time announced soon";
  });

  // Countdowns: every [data-cd] element (top bar, under video, form)
  var start = C.workshopStart ? new Date(C.workshopStart) : null;
  var cds = document.querySelectorAll("[data-cd]");
  if (cds.length && start && !isNaN(start)) {
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var tick = function () {
      var s = Math.max(0, Math.floor((start - new Date()) / 1000));
      var p = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
      cds.forEach(function (el) {
        var box = el.classList.contains("countdown") ? el : el.querySelector(".countdown");
        if (box) box.querySelectorAll("b").forEach(function (b, i) { b.textContent = pad(p[i]); });
        var t = el.querySelector(".cdt");
        if (t) t.textContent = s > 0 ? pad(p[0]) + "d : " + pad(p[1]) + "h : " + pad(p[2]) + "m : " + pad(p[3]) + "s" : "LIVE NOW";
      });
    };
    cds.forEach(function (el) { el.hidden = false; });
    tick(); setInterval(tick, 1000);
  }

  // Registration form -> GoHighLevel inbound webhook
  var form = document.getElementById("register");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = form.querySelector(".form-msg");
    var btn = form.querySelector("button");
    var full = form.full_name.value.trim().replace(/\s+/g, " ");
    var sp = full.indexOf(" ");
    var data = {
      full_name: full,
      first_name: sp > 0 ? full.slice(0, sp) : full,
      last_name: sp > 0 ? full.slice(sp + 1) : "",
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      source: "cfa-workshop-landing",
      page: location.href,
      webinar_datetime: W ? ghlDate(W.date) : "",
      webinar_iso: W ? W.date.toISOString() : "",
      webinar_label: W ? W.label : "",
      webinar_link: W ? W.zoom : ""
    };
    if (!data.first_name || !/^\S+@\S+\.\S+$/.test(data.email)) {
      msg.textContent = "Please add your name and a valid email.";
      return;
    }
    msg.textContent = "";
    btn.disabled = true; btn.textContent = "Saving your seat…";

    var go = function () {
      location.href = (C.thankYouPage || "thank-you.html") + "?name=" + encodeURIComponent(data.first_name);
    };
    if (!C.ghlWebhookUrl) { console.warn("CFA: ghlWebhookUrl not set in config.js — lead not sent."); return go(); }

    fetch(C.ghlWebhookUrl, {
      method: "POST", mode: "no-cors",
      body: new URLSearchParams(data) // form-encoded: works cross-origin without CORS preflight
    }).then(go, go);
  });
})();

// YouTube click-to-play (loads the player only when tapped)
document.querySelectorAll(".yt[data-id]").forEach(function (b) {
  var id = b.getAttribute("data-id");
  b.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
  b.addEventListener("click", function () {
    if (b.querySelector("iframe")) return;
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    f.title = b.getAttribute("aria-label") || "Video";
    // swap the button for a plain box so taps reach YouTube's own controls
    var box = document.createElement("div");
    box.className = b.className + " on";
    box.appendChild(f);
    b.replaceWith(box);
  });
});
