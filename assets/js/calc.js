/* =========================================================================
   Fri-Consult — Calculateur d'économies interactif
   Estimation indicative et transparente (pas une offre contractuelle).
   ========================================================================= */
(function () {
  "use strict";
  var I = window.ICONS || {};

  var DOMAINS = [
    { id: "maladie",   icon: "heart", label: "Assurance maladie", unit: "/ mois / pers.", min: 200, max: 750, def: 380, rate: [0.06, 0.14], perPerson: true },
    { id: "auto",      icon: "car",   label: "Véhicule (auto/moto)", unit: "/ an", min: 300, max: 2600, def: 950, rate: [0.12, 0.25] },
    { id: "menage",    icon: "home",  label: "Ménage & RC privée", unit: "/ an", min: 100, max: 900, def: 320, rate: [0.10, 0.20] },
    { id: "juridique", icon: "scale", label: "Protection juridique", unit: "/ an", min: 120, max: 700, def: 320, rate: [0.10, 0.22] },
  ];

  function fmt(n) { return Math.round(n).toLocaleString("fr-CH").replace(/ | /g, "'"); }

  function initCalc() {
    var app = document.getElementById("calc-app");
    if (!app) return;

    var state = {};
    DOMAINS.forEach(function (d) { state[d.id] = { on: d.id === "maladie" || d.id === "auto", val: d.def, people: 2 }; });

    var controls = document.getElementById("calc-controls");
    controls.innerHTML = DOMAINS.map(function (d) {
      var s = state[d.id];
      return '<div class="calc-row" data-id="' + d.id + '">' +
        '<label class="calc-toggle">' +
          '<input type="checkbox" ' + (s.on ? "checked" : "") + ' data-role="on">' +
          '<span class="calc-check">' + I.check + '</span>' +
          '<span class="calc-ic">' + (I[d.icon] || I.shield) + '</span>' +
          '<span class="calc-name">' + d.label + '</span>' +
        '</label>' +
        '<div class="calc-slider" ' + (s.on ? "" : 'style="opacity:.4;pointer-events:none"') + ' data-role="sliderwrap">' +
          (d.perPerson ? '<div class="calc-people"><span>Personnes couvertes</span><div class="stepper" data-role="people"><button type="button" data-step="-1" aria-label="Moins">–</button><b data-role="peopleval">' + s.people + '</b><button type="button" data-step="1" aria-label="Plus">+</button></div></div>' : "") +
          '<div class="calc-primeline"><span>Prime actuelle</span><b><span data-role="valout">' + fmt(s.val) + '</span> CHF <small>' + d.unit + '</small></b></div>' +
          '<input type="range" class="range" min="' + d.min + '" max="' + d.max + '" step="10" value="' + s.val + '" data-role="range">' +
        '</div>' +
      '</div>';
    }).join("");

    var out = {
      total: document.getElementById("calc-total"),
      range: document.getElementById("calc-range"),
      bars: document.getElementById("calc-bars"),
      cta: document.getElementById("calc-cta"),
      empty: document.getElementById("calc-empty"),
    };

    var animRAF = null;
    function animateTo(el, target) {
      if (animRAF) cancelAnimationFrame(animRAF);
      var start = null, from = parseFloat(el.getAttribute("data-cur") || "0"), dur = 600;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var v = from + (target - from) * eased;
        el.textContent = fmt(v);
        if (p < 1) animRAF = requestAnimationFrame(step);
        else { el.textContent = fmt(target); el.setAttribute("data-cur", target); }
      }
      animRAF = requestAnimationFrame(step);
    }

    function compute() {
      var minTot = 0, maxTot = 0, items = [];
      DOMAINS.forEach(function (d) {
        var s = state[d.id];
        if (!s.on) return;
        var yearly = d.perPerson ? s.val * 12 * s.people : s.val;
        var sMin = yearly * d.rate[0], sMax = yearly * d.rate[1];
        minTot += sMin; maxTot += sMax;
        items.push({ label: d.label, mid: (sMin + sMax) / 2, icon: d.icon });
      });
      var mid = (minTot + maxTot) / 2;

      if (!items.length) {
        out.empty.style.display = "block";
        out.bars.innerHTML = "";
        out.range.textContent = "";
        animateTo(out.total, 0);
        out.cta.style.pointerEvents = "none"; out.cta.style.opacity = ".5";
        return;
      }
      out.empty.style.display = "none";
      out.cta.style.pointerEvents = ""; out.cta.style.opacity = "";
      animateTo(out.total, mid);
      out.range.textContent = "Fourchette estimée : " + fmt(minTot) + " – " + fmt(maxTot) + " CHF / an";

      var maxMid = Math.max.apply(null, items.map(function (i) { return i.mid; })) || 1;
      out.bars.innerHTML = items.map(function (it) {
        var w = Math.max(6, (it.mid / maxMid) * 100);
        return '<div class="calc-bar"><span class="cb-ic">' + (I[it.icon] || I.shield) + '</span>' +
          '<span class="cb-label">' + it.label + '</span>' +
          '<span class="cb-track"><i style="width:' + w.toFixed(1) + '%"></i></span>' +
          '<span class="cb-val">' + fmt(it.mid) + ' CHF</span></div>';
      }).join("");

      // Met à jour le lien vers la demande d'offre avec les types cochés
      var checked = DOMAINS.filter(function (d) { return state[d.id].on; }).map(function (d) { return d.id; });
      out.cta.href = "demande-offre.html?type=" + (checked[0] || "");
    }

    // Événements
    controls.addEventListener("input", function (e) {
      var row = e.target.closest(".calc-row"); if (!row) return;
      var id = row.getAttribute("data-id");
      if (e.target.getAttribute("data-role") === "range") {
        state[id].val = parseInt(e.target.value, 10);
        row.querySelector('[data-role="valout"]').textContent = fmt(state[id].val);
        compute();
      }
    });
    controls.addEventListener("change", function (e) {
      if (e.target.getAttribute("data-role") === "on") {
        var row = e.target.closest(".calc-row");
        var id = row.getAttribute("data-id");
        state[id].on = e.target.checked;
        var sw = row.querySelector('[data-role="sliderwrap"]');
        sw.style.opacity = e.target.checked ? "" : ".4";
        sw.style.pointerEvents = e.target.checked ? "" : "none";
        compute();
      }
    });
    controls.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-step]"); if (!btn) return;
      var row = e.target.closest(".calc-row"); var id = row.getAttribute("data-id");
      var next = state[id].people + parseInt(btn.getAttribute("data-step"), 10);
      state[id].people = Math.max(1, Math.min(8, next));
      row.querySelector('[data-role="peopleval"]').textContent = state[id].people;
      compute();
    });

    compute();
  }

  document.addEventListener("DOMContentLoaded", initCalc);
})();
