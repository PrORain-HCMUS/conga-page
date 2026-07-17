/* Shared factory: makes an inlined draw.io SVG hoverable/clickable per block.
   Each caller supplies its own mount id, popup id, and BLOCKS map keyed by data-cell-id. */
window.initInteractiveDiagram = function (opts) {
  "use strict";
  var mountId = opts.mountId;
  var popupId = opts.popupId;
  var blocks = opts.blocks;

  var pop = document.createElement("div");
  pop.id = popupId;
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
    // Query the actual shape descendant for geometry — the wrapping <g data-cell-id>
    // group has no geometry of its own and getBoundingClientRect() on it can
    // incorrectly return the whole SVG's box in some browsers.
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
    var info = blocks[g.getAttribute("data-cell-id")];
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
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var svg = mount.querySelector("svg");
    if (!svg) return;

    Object.keys(blocks).forEach(function (id) {
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
      if (to && to.closest && (to.closest("#" + popupId) || to.closest(".diagram-block") === g)) return;
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
      if (!e.target.closest || (!e.target.closest("#" + popupId) && !e.target.closest(".diagram-block"))) {
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
};
