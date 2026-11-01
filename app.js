(function () {
  var C = window.CFA_CONFIG || {};

  document.querySelectorAll("[data-when]").forEach(function (el) {
    el.textContent = C.workshopLabel || "Date & time announced soon";
  });

  // Countdown
  var cd = document.getElementById("countdown");
  var start = C.workshopStart ? new Date(C.workshopStart) : null;
  if (cd && start && !isNaN(start)) {
    var tick = function () {
      var s = Math.max(0, Math.floor((start - new Date()) / 1000));
      var parts = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
      cd.querySelectorAll("b").forEach(function (b, i) { b.textContent = String(parts[i]).padStart(2, "0"); });
    };
    cd.hidden = false; tick(); setInterval(tick, 1000);
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
