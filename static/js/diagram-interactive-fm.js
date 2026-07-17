/* Makes the inline "two failure modes" SVG (Motivation section) clickable/hoverable per block. */
(function () {
  "use strict";

  var BLOCKS = {
    "grp1": {
      title: "Trained region (t ≤ L_train)",
      body: "SASRec learns an absolute position embedding pₜ independently for each index up to the training window L_train. These positions have a valid, trained embedding."
    },
    "grp2": {
      title: "Out-of-distribution region (t > L_train)",
      body: "Any position beyond L_train was never seen during training — its embedding is out-of-distribution. On ML-1M, where histories reach 300–600 interactions, this hits the majority of users."
    },
    "op1": {
      title: "Absolute Positional Embedding",
      body: "A learned vector pₜ added per index t. Because it's tied to the absolute index rather than relative distance, it cannot generalize past L_train."
    },
    "op2": {
      title: "SASRec Encoder",
      body: "The standard causal self-attention encoder. It consumes token + positional embeddings, so any OOD positional signal propagates straight into its representations."
    },
    "op3": {
      title: "Representation Degradation",
      body: "The failure outcome: representations for long-history users are corrupted by OOD positional embeddings — exactly the problem RoPE's norm-preserving rotation is designed to eliminate."
    },
    "grp3": {
      title: "Discarded (outside context window)",
      body: "Items older than the attention window L are simply never seen by self-attention — there is no mechanism to recall them, regardless of how relevant they are."
    },
    "grp4": {
      title: "Context window (kept)",
      body: "Only the most recent L≈200–300 items are visible to attention. This is the hard capacity ceiling that TITANS' memory module is designed to extend."
    },
    "op4": {
      title: "Self-Attention",
      body: "Standard attention costs O(L²) in sequence length, which is why the context window is capped at 200–300 items in practice — going wider becomes computationally prohibitive."
    },
    "op5": {
      title: "Long-Range Information Loss",
      body: "The failure outcome: any preference signal from before the context window is permanently unavailable to the model at inference time."
    }
  };

  var pop = document.createElement("div");
  pop.id = "fm-diagram-popup";
  pop.className = "diagram-popup-shared";
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
    var mount = document.getElementById("fm-diagram-mount");
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
      if (to && to.closest && (to.closest("#fm-diagram-popup") || to.closest(".diagram-block") === g)) return;
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
      if (!e.target.closest || (!e.target.closest("#fm-diagram-popup") && !e.target.closest(".diagram-block"))) {
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
