/* =========================================================================
   Fri-Consult — Formulaires : assistant de demande d'offre + contact
   Envoi via FormSubmit.co (sans compte). Repli : ouverture e-mail (mailto).
   ========================================================================= */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var C = CFG.contact || {};
  var I = window.ICONS || {};
  var SERVICES = window.SERVICES || [];

  function esc(s) { return String(s == null ? "" : s).replace(/[<>&"]/g, function (c) { return ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]; }); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var CANTONS = ["Fribourg", "Vaud", "Genève", "Valais", "Neuchâtel", "Berne", "Jura", "Zurich", "Autre canton"];

  async function sendPayload(payload) {
    // 1) Tentative FormSubmit (AJAX JSON)
    try {
      var res = await fetch(CFG.formEndpoint + encodeURIComponent(C.email), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        var data = await res.json().catch(function () { return {}; });
        if (data.success === "true" || data.success === true || res.status === 200) return { ok: true };
      }
      throw new Error("HTTP " + res.status);
    } catch (e) {
      return { ok: false, error: e };
    }
  }

  function mailtoFallback(subject, bodyText) {
    var href = "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyText);
    window.location.href = href;
  }

  /* ================= Assistant de demande d'offre ================= */
  function initWizard() {
    var root = qs("#quote-wizard");
    if (!root) return;

    // Rendu des chips de choix
    var choiceGrid = qs("#choice-grid", root);
    choiceGrid.innerHTML = SERVICES.map(function (s) {
      return '<label class="choice">' +
        '<input type="checkbox" name="assurances" value="' + esc(s.title) + '" data-id="' + s.id + '">' +
        '<span class="c-ico">' + (I[s.icon] || I.shield) + '</span>' +
        '<span class="c-txt"><b>' + esc(s.title) + '</b><span>' + esc(s.tag) + '</span></span>' +
        '<span class="tick">' + I.check + '</span>' +
        '</label>';
    }).join("");

    // Préselection via ?type=
    var params = new URLSearchParams(location.search);
    var pre = params.get("type");
    if (pre) {
      var box = qs('input[data-id="' + pre + '"]', choiceGrid);
      if (box) box.checked = true;
    }

    // Remplir les cantons
    var cantonSel = qs('#f-canton', root);
    if (cantonSel) cantonSel.innerHTML = '<option value="" disabled selected>Choisir…</option>' +
      CANTONS.map(function (c) { return '<option>' + c + '</option>'; }).join("");

    var fieldsets = qsa(".fieldset", root);
    var dots = qsa(".wizard-progress .dot", root);
    var current = 0;

    function showStep(n) {
      current = Math.max(0, Math.min(n, fieldsets.length - 1));
      fieldsets.forEach(function (f, i) { f.classList.toggle("active", i === current); });
      dots.forEach(function (d, i) { d.classList.toggle("done", i < current); d.classList.toggle("current", i === current); });
      if (current === fieldsets.length - 1) buildReview();
      var top = root.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: top, behavior: "smooth" });
    }

    function validateStep(n) {
      var fs = fieldsets[n];
      var ok = true;

      // Étape 1 : au moins un type coché
      if (n === 0) {
        var checked = qsa('input[name="assurances"]:checked', root);
        var warn = qs("#choice-warning", root);
        if (!checked.length) { warn.style.display = "block"; ok = false; }
        else warn.style.display = "none";
        return ok;
      }

      // Champs requis
      qsa("[required]", fs).forEach(function (input) {
        var field = input.closest(".field");
        var valid = input.type === "checkbox" ? input.checked : String(input.value).trim() !== "";
        if (valid && input.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        if (field) field.classList.toggle("error", !valid);
        if (!valid) ok = false;
      });
      return ok;
    }

    function buildReview() {
      var list = qs("#review-list", root);
      if (!list) return;
      var types = qsa('input[name="assurances"]:checked', root).map(function (i) { return i.value; });
      var get = function (id) { var el = qs("#" + id, root); return el ? el.value : ""; };
      var rows = [
        ["Assurance(s)", types.join(", ") || "—"],
        ["Statut", get("f-statut")],
        ["Canton", get("f-canton")],
        ["Nom", (get("f-prenom") + " " + get("f-nom")).trim()],
        ["E-mail", get("f-email")],
        ["Téléphone", get("f-phone") || "—"],
      ];
      list.innerHTML = rows.map(function (r) {
        return '<div class="r"><b>' + esc(r[0]) + '</b><span>' + esc(r[1] || "—") + "</span></div>";
      }).join("");
    }

    // Navigation
    qsa("[data-next]", root).forEach(function (b) {
      b.addEventListener("click", function () { if (validateStep(current)) showStep(current + 1); });
    });
    qsa("[data-back]", root).forEach(function (b) {
      b.addEventListener("click", function () { showStep(current - 1); });
    });

    // Effacer l'erreur en tapant
    root.addEventListener("input", function (e) {
      var f = e.target.closest(".field.error");
      if (f) f.classList.remove("error");
    });

    // Soumission
    var form = qs("#quote-form", root);
    var statusEl = qs("#quote-status", root);
    var submitBtn = qs("#quote-submit", root);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!validateStep(current)) return;
      var consent = qs("#f-consent", root);
      if (consent && !consent.checked) {
        consent.closest(".field, .consent-wrap").classList.add("error");
        statusEl.className = "form-status err";
        statusEl.textContent = "Merci d'accepter la politique de confidentialité.";
        return;
      }

      var get = function (id) { var el = qs("#" + id, root); return el ? el.value : ""; };
      var types = qsa('input[name="assurances"]:checked', root).map(function (i) { return i.value; });

      var payload = {
        _subject: "Nouvelle demande d'offre — " + (types.join(", ") || "Assurance"),
        "Assurances demandées": types.join(", "),
        "Statut": get("f-statut"),
        "Canton": get("f-canton"),
        "Prénom": get("f-prenom"),
        "Nom": get("f-nom"),
        "E-mail": get("f-email"),
        "Téléphone": get("f-phone"),
        "Date de naissance": get("f-naissance"),
        "Message": get("f-message"),
        "Rappel souhaité": get("f-rappel"),
        _template: "table",
      };

      submitBtn.disabled = true;
      var oldLabel = submitBtn.innerHTML;
      submitBtn.innerHTML = "Envoi en cours…";
      statusEl.className = "form-status";
      statusEl.textContent = "";

      var result = await sendPayload(payload);

      if (result.ok) {
        qs("#quote-form-inner", root).style.display = "none";
        qs(".wizard-progress", root).style.display = "none";
        qs("#quote-success", root).classList.add("show");
        window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = oldLabel;
        statusEl.className = "form-status err";
        statusEl.innerHTML = "L'envoi automatique a échoué. <a href='#' id='mailto-link' style='text-decoration:underline'>Cliquez ici pour envoyer par votre messagerie</a>.";
        var body = Object.keys(payload).filter(function (k) { return k[0] !== "_"; })
          .map(function (k) { return k + " : " + payload[k]; }).join("\n");
        qs("#mailto-link", statusEl).addEventListener("click", function (ev) {
          ev.preventDefault();
          mailtoFallback(payload._subject, body);
        });
      }
    });

    showStep(0);
  }

  /* ================= Formulaire de contact simple ================= */
  function initContactForm() {
    var form = qs("#contact-form");
    if (!form) return;
    var statusEl = qs("#contact-status", form);
    var btn = qs('button[type="submit"]', form);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var ok = true;
      qsa("[required]", form).forEach(function (input) {
        var field = input.closest(".field");
        var valid = input.type === "checkbox" ? input.checked : String(input.value).trim() !== "";
        if (valid && input.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        if (field) field.classList.toggle("error", !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;

      var val = function (name) { var el = form.elements[name]; return el ? el.value : ""; };
      var payload = {
        _subject: "Message via le site — " + (val("nom") || "Contact"),
        "Nom": val("nom"),
        "E-mail": val("email"),
        "Téléphone": val("phone"),
        "Sujet": val("sujet"),
        "Message": val("message"),
        _template: "table",
      };

      btn.disabled = true;
      var old = btn.innerHTML; btn.innerHTML = "Envoi…";
      statusEl.className = "form-status"; statusEl.textContent = "";

      var result = await sendPayload(payload);
      if (result.ok) {
        form.reset();
        statusEl.className = "form-status";
        statusEl.style.color = "var(--ok)";
        statusEl.textContent = "✓ Merci ! Votre message a bien été envoyé, nous vous répondons rapidement.";
        btn.disabled = false; btn.innerHTML = old;
      } else {
        btn.disabled = false; btn.innerHTML = old;
        statusEl.className = "form-status err";
        var body = Object.keys(payload).filter(function (k) { return k[0] !== "_"; })
          .map(function (k) { return k + " : " + payload[k]; }).join("\n");
        statusEl.innerHTML = "Échec de l'envoi. <a href='#' id='c-mailto' style='text-decoration:underline'>Envoyer par messagerie</a>.";
        qs("#c-mailto", statusEl).addEventListener("click", function (ev) { ev.preventDefault(); mailtoFallback(payload._subject, body); });
      }
    });

    form.addEventListener("input", function (e) {
      var f = e.target.closest(".field.error"); if (f) f.classList.remove("error");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initWizard();
    initContactForm();
  });
})();
