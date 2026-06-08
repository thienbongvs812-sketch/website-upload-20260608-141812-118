(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function() {
    document.querySelectorAll(".cover-img").forEach(function(img) {
      img.addEventListener("error", function() {
        img.classList.add("is-hidden");
      });
    });

    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function(carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-dot]"));
      var prev = carousel.querySelector("[data-prev]");
      var next = carousel.querySelector("[data-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function() {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function() {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function(dot, dotIndex) {
        dot.addEventListener("click", function() {
          show(dotIndex);
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      var empty = scope.querySelector("[data-filter-empty]");

      function match(card, query, selectedYear, selectedType) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-text") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var keywordOK = !query || haystack.indexOf(query) !== -1;
        var yearOK = !selectedYear || cardYear === selectedYear;
        var typeOK = !selectedType || cardType === selectedType;
        return keywordOK && yearOK && typeOK;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var ok = match(card, query, selectedYear, selectedType);
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, type].forEach(function(control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (scope.hasAttribute("data-search-page") && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
      }

      apply();
    });
  });
})();
