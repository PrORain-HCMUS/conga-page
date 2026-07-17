/* Reference popups: hover (desktop) / tap (mobile) on paper names shows a citation card. */
(function () {
  "use strict";

  var REFS = {
    "RoPE": {
      title: "RoFormer: Enhanced Transformer with Rotary Position Embedding",
      authors: "Su, Lu, Pan, Murtadha, Wen, Liu",
      venue: "arXiv 2021",
      url: "https://arxiv.org/abs/2104.09864",
      desc: "Encodes position by rotating query/key vectors, so attention depends only on relative offsets and stays norm-preserving at any sequence length."
    },
    "SwiGLU": {
      title: "GLU Variants Improve Transformer",
      authors: "Noam Shazeer",
      venue: "arXiv 2020",
      url: "https://arxiv.org/abs/2002.05202",
      desc: "Gated feed-forward variant (Swish × linear gate) that consistently outperforms ReLU/GELU FFNs in transformers."
    },
    "KromHC": {
      title: "KromHC: Manifold-Constrained Hyper-Connections with Kronecker-Product Residual Matrices",
      authors: "Zhou, Gu, Iacovides, Mandic",
      venue: "arXiv 2026",
      url: "https://arxiv.org/abs/2601.21579",
      desc: "Builds an exactly doubly-stochastic multi-stream mixing matrix from a Kronecker product of 2×2 blocks — O(1) parameters, no Sinkhorn iterations."
    },
    "mHC": {
      title: "mHC: Manifold-Constrained Hyper-Connections",
      authors: "Xie et al.",
      venue: "arXiv 2025",
      url: "https://arxiv.org/abs/2512.24880",
      desc: "Multi-stream residual connections with doubly-stochastic mixing approximated by iterative Sinkhorn-Knopp normalization."
    },
    "TITANS": {
      title: "Titans: Learning to Memorize at Test Time",
      authors: "Behrouz, Zhong, Mirrokni",
      venue: "arXiv 2025",
      url: "https://arxiv.org/abs/2501.00663",
      desc: "Neural associative memory updated by online gradient steps on a fixed d×d matrix — O(1) retrieval over arbitrarily long histories."
    },
    "SASRec": {
      title: "Self-Attentive Sequential Recommendation",
      authors: "Kang & McAuley",
      venue: "ICDM 2018",
      url: "https://arxiv.org/abs/1808.09781",
      desc: "Established causal transformer self-attention with absolute positional embeddings as the standard sequential-recommendation architecture."
    },
    "BERT4Rec": {
      title: "BERT4Rec: Sequential Recommendation with Bidirectional Encoder Representations from Transformer",
      authors: "Sun et al.",
      venue: "CIKM 2019",
      url: "https://arxiv.org/abs/1904.06690",
      desc: "Bidirectional transformer trained with a Cloze-style masked-item objective."
    },
    "GRU4Rec": {
      title: "Session-Based Recommendations with Recurrent Neural Networks",
      authors: "Hidasi et al.",
      venue: "ICLR 2016",
      url: "https://arxiv.org/abs/1511.06939",
      desc: "First widely-adopted RNN (GRU) model for session-based sequential recommendation."
    },
    "Caser": {
      title: "Personalized Top-N Sequential Recommendation via Convolutional Sequence Embedding",
      authors: "Tang & Wang",
      venue: "WSDM 2018",
      url: "https://arxiv.org/abs/1809.07426",
      desc: "Treats the item-embedding sequence as an image and applies horizontal/vertical convolutions to capture union-level patterns."
    },
    "FMLPRec": {
      title: "Filter-Enhanced MLP is All You Need for Sequential Recommendation",
      authors: "Zhou, Yu, Zhao, Wen",
      venue: "WWW 2022",
      url: "https://arxiv.org/abs/2202.13556",
      desc: "Replaces self-attention with learnable frequency-domain filters (FFT → filter → iFFT) for denoised sequence modeling."
    },
    "DuoRec": {
      title: "Contrastive Learning for Representation Degeneration Problem in Sequential Recommendation",
      authors: "Qiu, Huang, Li, Yin",
      venue: "WSDM 2022",
      url: "https://arxiv.org/abs/2110.05730",
      desc: "Model-level dropout-based contrastive regularization that combats embedding degeneration in sequential recommenders."
    },
    "FEARec": {
      title: "Frequency Enhanced Hybrid Attention Network for Sequential Recommendation",
      authors: "Du et al.",
      venue: "SIGIR 2023",
      url: "https://arxiv.org/abs/2304.09184",
      desc: "Hybrid time-domain + frequency-domain attention with contrastive and frequency-domain regularization."
    },
    "BSARec": {
      title: "An Attentive Inductive Bias for Sequential Recommendation beyond the Self-Attention",
      authors: "Shin, Choi, Wi, Park",
      venue: "AAAI 2024",
      url: "https://arxiv.org/abs/2312.10325",
      desc: "Blends self-attention with a Fourier low/high-pass inductive bias to recover fine-grained sequential patterns."
    },
    "WEARec": {
      title: "Wavelet-Enhanced Adaptive Frequency Filter for Sequential Recommendation",
      authors: "Xu et al.",
      venue: "arXiv 2025",
      url: null,
      desc: "Wavelet-based adaptive frequency filtering for sequential recommendation; the strongest baseline on ML-1M and Yelp in our comparison."
    },
    "Krichene & Rendle": {
      title: "On Sampled Metrics for Item Recommendation",
      authors: "Krichene & Rendle",
      venue: "KDD 2020",
      url: "https://dl.acm.org/doi/10.1145/3394486.3403226",
      desc: "Shows sampled ranking metrics can contradict full-catalog metrics — the basis for our full-ranking evaluation protocol."
    }
  };

  var names = Object.keys(REFS).sort(function (a, b) { return b.length - a.length; });
  var PATTERN = new RegExp("\\b(" + names.map(function (n) {
    return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("|") + ")\\b");

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, PRE: 1, CODE: 1, A: 1, BUTTON: 1, H1: 1, TITLE: 1 };

  function annotate(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !PATTERN.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        for (var el = node.parentElement; el; el = el.parentElement) {
          if (SKIP_TAGS[el.tagName] || el.id === "ref-popup" ||
              (el.classList && el.classList.contains("ref-term"))) {
            return NodeFilter.FILTER_REJECT;
          }
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    var splitter = new RegExp(PATTERN.source, "g");
    nodes.forEach(function (node) {
      var parts = node.nodeValue.split(splitter);
      if (parts.length < 2) return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (part, i) {
        if (i % 2 === 1 && REFS[part]) {
          var span = document.createElement("span");
          span.className = "ref-term";
          span.setAttribute("data-ref", part);
          span.setAttribute("tabindex", "0");
          span.setAttribute("role", "button");
          span.setAttribute("aria-label", "Show reference: " + REFS[part].title);
          span.textContent = part;
          frag.appendChild(span);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  /* ---- popup singleton ---- */
  var pop = document.createElement("div");
  pop.id = "ref-popup";
  pop.setAttribute("role", "tooltip");
  document.body.appendChild(pop);

  var hideTimer = null;
  var currentTerm = null;
  var lastShownAt = 0;

  function fill(key) {
    var r = REFS[key];
    var html = '<div class="rp-head"><span class="rp-venue">' + r.venue + "</span></div>" +
      '<div class="rp-title">' + r.title + "</div>" +
      '<div class="rp-authors">' + r.authors + "</div>" +
      '<div class="rp-desc">' + r.desc + "</div>";
    if (r.url) {
      html += '<a class="rp-link" href="' + r.url + '" target="_blank" rel="noopener">View paper →</a>';
    }
    pop.innerHTML = html;
  }

  function place(el) {
    var rect = el.getBoundingClientRect();
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var top = rect.bottom + 10;
    if (top + ph > window.innerHeight - 8) top = rect.top - ph - 10;
    if (top < 8) top = 8;
    var left = rect.left + rect.width / 2 - pw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
    pop.style.top = top + "px";
    pop.style.left = left + "px";
  }

  function showFor(el) {
    clearTimeout(hideTimer);
    fill(el.getAttribute("data-ref"));
    pop.style.display = "block";
    place(el);
    currentTerm = el;
    lastShownAt = Date.now();
  }

  function hide() {
    pop.style.display = "none";
    currentTerm = null;
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 250);
  }

  document.addEventListener("mouseover", function (e) {
    var t = e.target.closest ? e.target.closest(".ref-term") : null;
    if (t) showFor(t);
  });
  document.addEventListener("mouseout", function (e) {
    var t = e.target.closest ? e.target.closest(".ref-term") : null;
    if (!t) return;
    var to = e.relatedTarget;
    if (to && (to.closest("#ref-popup") || to.closest(".ref-term") === t)) return;
    scheduleHide();
  });
  pop.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
  pop.addEventListener("mouseleave", scheduleHide);

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".ref-term") : null;
    if (t) {
      e.preventDefault();
      // On touch devices a synthetic mouseover fires just before this click and
      // already opened the popup; treat show+click within 400ms as one gesture.
      if (currentTerm === t && pop.style.display === "block" &&
          Date.now() - lastShownAt > 400) {
        hide();
      } else {
        showFor(t);
      }
    } else if (!e.target.closest || !e.target.closest("#ref-popup")) {
      hide();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hide();
    if ((e.key === "Enter" || e.key === " ") && document.activeElement &&
        document.activeElement.classList &&
        document.activeElement.classList.contains("ref-term")) {
      e.preventDefault();
      showFor(document.activeElement);
    }
  });

  window.addEventListener("scroll", function () {
    if (currentTerm) place(currentTerm);
  }, { passive: true });
  window.addEventListener("resize", hide);

  function init() {
    var main = document.getElementById("main-content");
    if (main) annotate(main);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
