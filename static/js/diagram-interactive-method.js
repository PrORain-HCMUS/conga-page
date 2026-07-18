/* Method section diagrams: full architecture, KromHC internals, TITANS memory. */
(function () {
  "use strict";

  initInteractiveDiagram({
    mountId: "method-arch-mount",
    popupId: "method-arch-popup",
    blocks: {
      /* left encoder pipeline */
      "Gslj4vlfV2A1A853D2Aq-24": { title: "Tokenized input", body: "The raw item-index sequence i₁ … i_T, truncated to the model's input length before embedding." },
      "Gslj4vlfV2A1A853D2Aq-20": { title: "Token embeddings", body: "Learned per-item embedding table mapping each item index to a d-dimensional vector." },
      "jp7LGeR1z-Mpjd4nHrpI-9": { title: "Input LayerNorm", body: "Normalizes the embedded sequence once, before it enters the first of the L stacked CONGA blocks." },
      "Gslj4vlfV2A1A853D2Aq-8": { title: "Pre-Norm", body: "Pre-LayerNorm applied before attention in every block — stabilizes training in deep stacks." },
      "Gslj4vlfV2A1A853D2Aq-10": { title: "Attention + RoPE", body: "Causal self-attention with Rotary Positional Embeddings: q/k are rotated by an angle proportional to position, giving a norm-preserving representation at any sequence length." },
      "Gslj4vlfV2A1A853D2Aq-12": { title: "KromHC fusion", body: "Multi-stream fusion via an exact doubly-stochastic Kronecker-product mixing matrix — see the KromHC panel on the right." },
      "Gslj4vlfV2A1A853D2Aq-14": { title: "Pre-Norm", body: "Pre-LayerNorm before the feed-forward sublayer." },
      "Gslj4vlfV2A1A853D2Aq-16": { title: "SwiGLU FFN", body: "Gated feed-forward sublayer (Swish × linear gate) — consistently outperforms ReLU/GELU FFNs at the same parameter count." },
      "Gslj4vlfV2A1A853D2Aq-18": { title: "Residual + output", body: "Output of one CONGA block after both residual additions. This whole stack repeats L times." },
      "Gslj4vlfV2A1A853D2Aq-5": { title: "Final LayerNorm", body: "Normalizes the last block's output before memory fusion and the output projection." },
      "Gslj4vlfV2A1A853D2Aq-22": { title: "TITANS memory — Phase 2 (frozen base)", body: "In Phase 2 every encoder parameter above is frozen; only this memory module is trained, and its readout is added on top of the frozen output — short-sequence predictions are provably unchanged." },
      "Gslj4vlfV2A1A853D2Aq-3": { title: "Linear output", body: "Projects the fused representation to per-item logits, scored against the full catalog (no negative sampling)." },

      /* zoomed "One CONGA block" panel */
      "Gslj4vlfV2A1A853D2Aq-28": { title: "Pre-Norm", body: "Zoomed view: Pre-LayerNorm before the attention sublayer." },
      "Gslj4vlfV2A1A853D2Aq-30": { title: "Multi-head attention with RoPE (causal)", body: "Causal multi-head self-attention where every query/key pair is rotated by RoPE first, so attention scores depend only on relative offset (t − s)." },
      "Gslj4vlfV2A1A853D2Aq-32": { title: "KromHC fusion", body: "Zoomed view: the block's residual stream is expanded into M parallel streams here, then remixed by the Kronecker-product mixing matrix (right panel)." },
      "Gslj4vlfV2A1A853D2Aq-34": { title: "Pre-Norm", body: "Zoomed view: Pre-LayerNorm before the SwiGLU sublayer." },
      "Gslj4vlfV2A1A853D2Aq-36": { title: "SwiGLU FFN", body: "Zoomed view: Swish-gated feed-forward network, applied per-stream before the second KromHC-fused residual add." },
      "Gslj4vlfV2A1A853D2Aq-38": { title: "Residual + output", body: "Zoomed view: final output of this block, fed to the next of the L stacked blocks." },

      /* KromHC zoom panel */
      "Gslj4vlfV2A1A853D2Aq-42": { title: "KromHC", body: "Multi-stream fusion module: M parallel residual streams are mixed by an exactly doubly-stochastic matrix built from a Kronecker product of 2×2 blocks — never a degenerate projection, and needs no iterative Sinkhorn normalization." },
      "Gslj4vlfV2A1A853D2Aq-43": { title: "Stream 1", body: "One of M parallel residual streams, free to specialize (e.g. short-term recency)." },
      "Gslj4vlfV2A1A853D2Aq-44": { title: "Stream 2", body: "One of M parallel residual streams. Stream count M is set by a data-adaptive rule (M=4 for dense/long-history corpora, M=2 for sparse ones)." },
      "Gslj4vlfV2A1A853D2Aq-45": { title: "Stream 3", body: "One of M parallel residual streams, free to specialize (e.g. long-term preference)." },
      "Gslj4vlfV2A1A853D2Aq-46": { title: "Stream 4", body: "The 4th stream, only active when the data-adaptive rule selects M=4 (dense/long-history corpora)." },
      "Gslj4vlfV2A1A853D2Aq-51": { title: "Kronecker-product mixing", body: "H_res = M₁(a) ⊗ M₂(b) — exactly doubly-stochastic from just 2 learned scalars (a, b), no iterative normalization." },
      "Gslj4vlfV2A1A853D2Aq-53": { title: "Fusion equation", body: "Fusion: α_pre⊙h + α_post⊙y + α_res⊙x — per-channel gates blend the pre-mixing input, the mixed output, and the raw residual." },

      /* TITANS zoom panel */
      "Gslj4vlfV2A1A853D2Aq-55": { title: "TITANS memory update", body: "Neural associative memory Mₜ ∈ ℝ^(d×d), updated online by a gradient step on the prediction error — O(d²) cost, independent of sequence length." },
      "Gslj4vlfV2A1A853D2Aq-56": { title: "Mₜ₋₁ (d × d matrix)", body: "The memory state carried over from the previous step — a fixed-size associative matrix, however long the history." },
      "Gslj4vlfV2A1A853D2Aq-57": { title: "kₜ, vₜ, qₜ", body: "Key, value, and query projections of the current input, used to read from and write to the memory matrix." },
      "Gslj4vlfV2A1A853D2Aq-60": { title: "Associative error", body: "eₜ = Mₜ₋₁kₜ − vₜ — how much the current memory mispredicts vₜ from kₜ. Drives the online update." },
      "Gslj4vlfV2A1A853D2Aq-62": { title: "Momentum update", body: "Mₜ = (1 − αₜ)Mₜ₋₁ + Sₜ — a decayed carry-over of the old memory plus a momentum-smoothed gradient step." },
      "Gslj4vlfV2A1A853D2Aq-64": { title: "yₜ = Mₜqₜ", body: "Associative recall: the memory is queried with qₜ to retrieve whatever long-range signal it holds." },
      "Gslj4vlfV2A1A853D2Aq-71": { title: "Late fusion", body: "h_attn[L] + β·y_mem[L] — the frozen encoder's output and the memory's readout are combined by one learned scalar β, initialized to 0." }
    }
  });

  initInteractiveDiagram({
    mountId: "method-kromhc-mount",
    popupId: "method-kromhc-popup",
    blocks: {
      "FjpmBoQl4VQYrZjRNEIK-17": { title: "One CONGA block", body: "A single transformer block in the CONGA stack: attention and feed-forward sublayers, each wrapped by a KromHC-fused residual connection." },
      "FjpmBoQl4VQYrZjRNEIK-18": { title: "Pre-Norm", body: "Pre-LayerNorm before the attention sublayer." },
      "FjpmBoQl4VQYrZjRNEIK-20": { title: "Multi-head attention with RoPE (causal)", body: "Causal self-attention with rotary positional embeddings applied to q/k before the dot product." },
      "FjpmBoQl4VQYrZjRNEIK-22": { title: "KromHC fusion", body: "The block's single residual stream is expanded into M parallel streams, processed, then remixed by the Kronecker-product mixing matrix on the right." },
      "FjpmBoQl4VQYrZjRNEIK-23": { title: "Pre-Norm", body: "Pre-LayerNorm before the feed-forward sublayer." },
      "FjpmBoQl4VQYrZjRNEIK-25": { title: "SwiGLU FFN", body: "Gated feed-forward sublayer (Swish × linear gate)." },
      "FjpmBoQl4VQYrZjRNEIK-26": { title: "Residual + output", body: "Output of this block, passed to the next of the L stacked blocks." },
      "FjpmBoQl4VQYrZjRNEIK-3": { title: "KromHC", body: "Multi-stream fusion module: parallel residual streams mixed by an exactly doubly-stochastic matrix — no degenerate projection possible, no Sinkhorn iterations needed." },
      "FjpmBoQl4VQYrZjRNEIK-5": { title: "Stream 1", body: "One of M parallel residual streams, free to specialize." },
      "FjpmBoQl4VQYrZjRNEIK-7": { title: "Stream 2", body: "One of M parallel residual streams. Stream count M follows a data-adaptive rule keyed to corpus density." },
      "FjpmBoQl4VQYrZjRNEIK-9": { title: "Stream 3", body: "One of M parallel residual streams, free to specialize." },
      "FjpmBoQl4VQYrZjRNEIK-11": { title: "Stream 4", body: "The 4th stream — active only when the data-adaptive rule selects M=4 for dense/long-history corpora." },
      "FjpmBoQl4VQYrZjRNEIK-13": { title: "Kronecker-product mixing", body: "H_res = M₁(a) ⊗ M₂(b) — a doubly-stochastic mixing matrix built from just 2 learned scalars, exact by construction." },
      "FjpmBoQl4VQYrZjRNEIK-12": { title: "Fusion equation", body: "Fusion: α_pre⊙h + α_post⊙y + α_res⊙x — per-channel gates blend the pre-mixing input, mixed output, and raw residual." }
    }
  });

  initInteractiveDiagram({
    mountId: "method-titans-mount",
    popupId: "method-titans-popup",
    blocks: {
      "QapdFMeTDVtv2vCsP-m9-66": { title: "xₜ", body: "The current-step input to the memory module — the same hidden state the frozen encoder produces at position t." },
      "QapdFMeTDVtv2vCsP-m9-67": { title: "Wₖ, W_V, W_Q", body: "Learned linear projections producing the key, value, and query used to read from and write to the memory." },
      "QapdFMeTDVtv2vCsP-m9-72": { title: "Mₜ₋₁", body: "The memory state carried over from the previous step — a fixed d×d associative matrix, regardless of how long the history is." },
      "QapdFMeTDVtv2vCsP-m9-78": { title: "Associative error", body: "eₜ = Mₜ₋₁kₜ − vₜ — how far the current memory's prediction is from vₜ. This error drives the online update, with no backprop through time needed." },
      "QapdFMeTDVtv2vCsP-m9-80": { title: "αₜ — forget gate", body: "Controls how much of the previous memory state Mₜ₋₁ is retained vs. decayed at this step." },
      "QapdFMeTDVtv2vCsP-m9-81": { title: "θₜ — learn gate", body: "Controls how strongly the associative error eₜ is written into the memory update." },
      "QapdFMeTDVtv2vCsP-m9-83": { title: "ηₜ — momentum gate", body: "Controls how much of the previous update direction (momentum) carries into the current step's write." },
      "QapdFMeTDVtv2vCsP-m9-91": { title: "Momentum buffer Sₜ", body: "The momentum term accumulated from past gradient steps, gated by ηₜ, before it's folded into the memory update." },
      "QapdFMeTDVtv2vCsP-m9-92": { title: "Momentum buffer Sₜ", body: "The momentum term accumulated from past gradient steps, gated by ηₜ, before it's folded into the memory update." },
      "QapdFMeTDVtv2vCsP-m9-115": { title: "Memory state Mₜ", body: "Mₜ ∈ ℝ^(d×d) — the updated memory after this step's forget/learn/momentum-gated write. Feeds back into the next step (recurrence)." },
      "QapdFMeTDVtv2vCsP-m9-118": { title: "Associative recall yₜ", body: "The memory queried with the current qₜ to retrieve whatever long-range signal it holds — independent of how far back that signal originally occurred." },
      "QapdFMeTDVtv2vCsP-m9-117": { title: "Final representation", body: "The representation after combining the memory's recall with the encoder's own output — what actually reaches the prediction head." },
      "QapdFMeTDVtv2vCsP-m9-119": { title: "Late-fusion mixing", body: "A single learned scalar weight blends the memory's recall into the final representation — see the detailed Late Fusion panel on the right." },
      "vhPURF8fL8qqjuJQI4DR-4": { title: "yₜ", body: "The memory's associative-recall readout at the current step, about to be fused with the frozen encoder's output." },
      "vhPURF8fL8qqjuJQI4DR-1": { title: "Late Fusion", body: "h_final = h_attn[L] + β·y_mem[L′]. The base encoder (❄️ frozen in Phase 2) contributes h_attn[L] unchanged; the memory contributes β·y_mem[L′] on top — β is a single learned scalar initialized to 0, so short-history users are unaffected until the memory term is shown to help." },
      "vhPURF8fL8qqjuJQI4DR-5": { title: "Frozen base encoder", body: "h_attn[L] — the Phase-1 encoder's output, ❄️ frozen in Phase 2 so it stays provably identical to its Phase-1 value. The memory can only add to it, never change it." },
      "vhPURF8fL8qqjuJQI4DR-6": { title: "Frozen base encoder", body: "h_attn[L] — the Phase-1 encoder's output, ❄️ frozen in Phase 2 so it stays provably identical to its Phase-1 value. The memory can only add to it, never change it." },
      "vhPURF8fL8qqjuJQI4DR-7": { title: "Frozen base encoder", body: "h_attn[L] — the Phase-1 encoder's output, ❄️ frozen in Phase 2 so it stays provably identical to its Phase-1 value. The memory can only add to it, never change it." },
      "vhPURF8fL8qqjuJQI4DR-8": { title: "Frozen base encoder", body: "h_attn[L] — the Phase-1 encoder's output, ❄️ frozen in Phase 2 so it stays provably identical to its Phase-1 value. The memory can only add to it, never change it." },
      "vhPURF8fL8qqjuJQI4DR-11": { title: "y_mem[L′]", body: "The memory's readout at the extended history position L′ — carries whatever long-range signal fell outside the encoder's attention window." },
      "vhPURF8fL8qqjuJQI4DR-18": { title: "h_final", body: "The fused representation actually used for next-item scoring: frozen encoder output plus the memory's β-weighted contribution." }
    }
  });
})();
