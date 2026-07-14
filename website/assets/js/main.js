/* BOREAS AIR — site behaviour (vanilla JS, no dependencies) */
(function () {
  "use strict";

  // Sticky header shadow
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Dropdowns: click support (touch / keyboard)
  document.querySelectorAll(".nav-drop > button").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var drop = btn.parentElement;
      var wasOpen = drop.classList.contains("open");
      document.querySelectorAll(".nav-drop.open").forEach(function (d) {
        d.classList.remove("open");
      });
      drop.classList.toggle("open", !wasOpen);
      btn.setAttribute("aria-expanded", !wasOpen ? "true" : "false");
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".nav-drop.open").forEach(function (d) {
      d.classList.remove("open");
      var b = d.querySelector("button");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  });

  // Comparison bars: animate widths from data-value / data-max
  var animateBars = function () {
    document.querySelectorAll(".bar-fill[data-value]").forEach(function (bar) {
      var value = parseFloat(bar.getAttribute("data-value"));
      var max = parseFloat(bar.getAttribute("data-max")) || 100;
      var pct = Math.max(2, Math.min(100, (value / max) * 100));
      bar.style.width = pct + "%";
    });
  };
  animateBars();

  // Quote form: build a prefilled mailto (no backend required for static hosting)
  var form = document.querySelector("form.quote-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var lang = document.documentElement.lang || "tr";
      var lines = [];
      data.forEach(function (v, k) {
        if (v) lines.push(k + ": " + v);
      });
      var subject =
        lang === "en"
          ? "Quote request — drilling air package"
          : "Teklif talebi — sondaj hava paketi";
      var mail =
        "mailto:info@boreasair.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(lines.join("\n"));
      window.location.href = mail;
    });
  }

  // Current year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
