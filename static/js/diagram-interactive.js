/* Makes the inline CONGA pipeline SVG clickable/hoverable per block. */
(function () {
  "use strict";

  var BLOCKS = {
    "RtOVfWdjJctBaVSm0xQz-77": {
      title: "User interaction history",
      body: "The model reads a user's chronological item sequence i₁ … i_T (up to L=300 items) as the Phase 1 input to the attention encoder."
    },
    "RtOVfWdjJctBaVSm0xQz-84": {
      title: "Modernized Encoder — Phase 1",
      body: "RoPE (norm-preserving positional rotation) + KromHC (multi-stream doubly-stochastic fusion) + SwiGLU FFN. Trained end-to-end in Phase 1 on the L=300 window."
    },
    "RtOVfWdjJctBaVSm0xQz-89": {
      title: "Next-Item Prediction",
      body: "Full-ranking scoring head: every item in the catalog is scored (no negative sampling), following the Krichene & Rendle protocol."
    },
    "RtOVfWdjJctBaVSm0xQz-91": {
      title: "Top-K recommendations",
      body: "The final ranked list returned to the user, ordered by predicted score."
    },
    "RtOVfWdjJctBaVSm0xQz-97": {
      title: "Extended interaction history",
      body: "In Phase 2 the same user history is read further back — up to L′=600 items — to give TITANS a longer window than the attention encoder ever sees."
    },
    "RtOVfWdjJctBaVSm0xQz-105": {
      title: "Modernized Encoder — frozen (Phase 2)",
      body: "❄️ All encoder parameters are frozen in Phase 2. This is a structural guarantee, not a soft one: h[L] is provably identical to its Phase-1 value, so the memory term can only add information, never overwrite short-sequence quality."
    },
    "RtOVfWdjJctBaVSm0xQz-108": {
      title: "TITANS Neural Memory",
      body: "🔥 An associative memory Mₜ ∈ ℝ^(d×d), updated online via gradient steps on the prediction error — O(d²) cost independent of sequence length. Trained only in Phase 2."
    },
    "RtOVfWdjJctBaVSm0xQz-118": {
      title: "Next-Item Prediction",
      body: "h_final = h_attn[L] + β·y_mem[L′] — the frozen encoder's output and the memory readout are fused by a single learned scalar β before full-ranking scoring."
    },
    "RtOVfWdjJctBaVSm0xQz-120": {
      title: "Top-K recommendations",
      body: "Final ranked list after memory fusion — this is what benefits most on long-history users (+0.72% NDCG@10 for >150-item histories)."
    }
  };

  var pop = document.createElement("div");
  pop.id = "diagram-popup";
  pop.setAttribute("role", "tooltip");
  document.body.appendChild(pop);

  var hideTimer = null;
  var current = null;
  var lastShownAt = 0;

  function fill(info) {
    pop.innerHTML = '<div class="dp-title">' + info.title + '</div>' +
      '<div class="dp-body">' + info.body + '</div>';
  }

  function place(el) {
    // The wrapping <g data-cell-id> from draw.io's export has no geometry of
    // its own; getBoundingClientRect() on it incorrectly returns the whole
    // SVG's box in some browsers. Measure the actual shape child instead.
    var shape = el.querySelector("rect, ellipse, path") || el;
    var rect = shape.getBoundingClientRect();
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var top = rect.bottom + 12;
    if (top + ph > window.innerHeight - 8) top = rect.top - ph - 12;
    if (top < 8) top = 8;
    var left = rect.left + rect.width / 2 - pw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    pop.style.top = top + "px";
    pop.style.left = left + "px";
  }

  function showFor(g) {
    var info = BLOCKS[g.getAttribute("data-cell-id")];
    if (!info) return;
    clearTimeout(hideTimer);
    fill(info);
    pop.style.display = "block";
    place(g);
    current = g;
    lastShownAt = Date.now();
  }

  function hide() {
    pop.style.display = "none";
    if (current) current.classList.remove("is-active");
    current = null;
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 250);
  }

  function init() {
    var mount = document.getElementById("conga-diagram-mount");
    if (!mount) return;
    var svg = mount.querySelector("svg");
    if (!svg) return;

    Object.keys(BLOCKS).forEach(function (id) {
      var g = svg.querySelector('[data-cell-id="' + id + '"]');
      if (g) g.classList.add("diagram-block");
    });

    mount.addEventListener("mouseover", function (e) {
      var g = e.target.closest ? e.target.closest(".diagram-block") : null;
      if (g) showFor(g);
    });
    mount.addEventListener("mouseout", function (e) {
      var g = e.target.closest ? e.target.closest(".diagram-block") : null;
      if (!g) return;
      var to = e.relatedTarget;
      if (to && to.closest && (to.closest("#diagram-popup") || to.closest(".diagram-block") === g)) return;
      scheduleHide();
    });
    pop.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    pop.addEventListener("mouseleave", scheduleHide);

    mount.addEventListener("click", function (e) {
      var g = e.target.closest ? e.target.closest(".diagram-block") : null;
      if (!g) return;
      e.preventDefault();
      if (current === g && pop.style.display === "block" && Date.now() - lastShownAt > 400) {
        hide();
      } else {
        if (current) current.classList.remove("is-active");
        g.classList.add("is-active");
        showFor(g);
      }
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest || (!e.target.closest("#diagram-popup") && !e.target.closest(".diagram-block"))) {
        hide();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hide();
    });
    window.addEventListener("scroll", function () { if (current) place(current); }, { passive: true });
    window.addEventListener("resize", hide);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
