(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  var menuButton = document.querySelector("[data-menu-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");
  if (menuButton && navMenu) {
    menuButton.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get("q") || "";

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var genre = scope.querySelector("[data-filter-genre]");
    var year = scope.querySelector("[data-filter-year]");
    var type = scope.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty]");

    if (input && queryValue) {
      input.value = queryValue;
    }

    function filterCards() {
      var text = normalize(input && input.value);
      var genreValue = normalize(genre && genre.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute("data-search"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var ok = true;

        if (text && search.indexOf(text) === -1) {
          ok = false;
        }
        if (genreValue && cardGenre.indexOf(genreValue) === -1) {
          ok = false;
        }
        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }
        if (typeValue && cardType !== typeValue) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, genre, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    filterCards();
  });
})();
