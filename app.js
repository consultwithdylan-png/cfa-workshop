(function () {
  var C = window.CFA_CONFIG || {};

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
    var data = {
      first_name: form.first_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      source: "cfa-workshop-landing",
      page: location.href
    };
    if (!data.first_name || !/^\S+@\S+\.\S+$/.test(data.email)) {
      msg.textContent = "Please add your first name and a valid email.";
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
