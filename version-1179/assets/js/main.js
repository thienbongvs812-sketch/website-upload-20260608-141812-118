(function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showHero(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero((current + 1) % slides.length);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var filterScope = document.querySelector("[data-filter-scope]");

  if (filterScope) {
    var searchInput = filterScope.querySelector("[data-local-search]");
    var sortSelect = filterScope.querySelector("[data-local-sort]");
    var list = filterScope.querySelector("[data-card-list]");

    function applyLocalFilter() {
      if (!list) {
        return;
      }

      var keyword = normalize(searchInput && searchInput.value);
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" "));
        card.classList.toggle("is-filtered-out", keyword && haystack.indexOf(keyword) === -1);
      });

      var sortValue = sortSelect ? sortSelect.value : "year";
      cards.sort(function (a, b) {
        if (sortValue === "title") {
          return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-CN");
        }
        if (sortValue === "score") {
          return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
        }
        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
      });
      cards.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyLocalFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", applyLocalFilter);
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function createSearchCard(movie) {
    var title = escapeHtml(movie.title);
    var url = escapeHtml(movie.url);
    var cover = escapeHtml(movie.cover);
    var year = escapeHtml(movie.year);
    var channel = escapeHtml(movie.channel);
    var type = escapeHtml(movie.type);
    var oneLine = escapeHtml(movie.oneLine);
    var score = escapeHtml(movie.score);
    var region = escapeHtml(movie.region);
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-cover\" href=\"" + url + "\" aria-label=\"" + title + "\">",
      "<img src=\"" + cover + "\" alt=\"" + title + "\" loading=\"lazy\">",
      "<span class=\"play-dot\">▶</span>",
      "<span class=\"cover-badge\">" + year + "</span>",
      "</a>",
      "<div class=\"movie-info\">",
      "<div class=\"badge-row\"><span>" + channel + "</span><span>" + type + "</span></div>",
      "<h3><a href=\"" + url + "\">" + title + "</a></h3>",
      "<p>" + oneLine + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "<div class=\"card-meta\"><span>推荐 " + score + "</span><span>" + region + "</span></div>",
      "</div>",
      "</article>"
    ].join("");
  }

  var siteSearchInput = document.querySelector("[data-site-search-input]");
  var siteSearchButton = document.querySelector("[data-site-search-button]");
  var siteSearchType = document.querySelector("[data-site-search-type]");
  var siteSearchResults = document.querySelector("[data-site-search-results]");

  function runSiteSearch() {
    if (!siteSearchResults || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var keyword = normalize(siteSearchInput && siteSearchInput.value);
    var typeValue = siteSearchType ? siteSearchType.value : "all";
    var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      var text = normalize([movie.title, movie.year, movie.genre, movie.region, movie.type, movie.channel, movie.oneLine, (movie.tags || []).join(" ")].join(" "));
      var typeMatch = typeValue === "all" || normalize(movie.type).indexOf(normalize(typeValue)) !== -1;
      return typeMatch && (!keyword || text.indexOf(keyword) !== -1);
    }).slice(0, 120);

    siteSearchResults.innerHTML = results.map(createSearchCard).join("");
  }

  if (siteSearchInput) {
    siteSearchInput.addEventListener("input", runSiteSearch);
  }
  if (siteSearchButton) {
    siteSearchButton.addEventListener("click", runSiteSearch);
  }
  if (siteSearchType) {
    siteSearchType.addEventListener("change", runSiteSearch);
  }

  function initVideo(video) {
    if (!video || video.getAttribute("data-loaded") === "true") {
      return;
    }

    var source = video.getAttribute("data-video-src");
    if (!source) {
      return;
    }

    video.setAttribute("data-loaded", "true");

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  document.querySelectorAll(".js-play-button").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.getElementById(button.getAttribute("data-target"));
      initVideo(target);
      if (target) {
        var playResult = target.play();
        if (playResult && typeof playResult.then === "function") {
          playResult.catch(function () {});
        }
      }
      button.classList.add("is-hidden");
    });
  });

  document.querySelectorAll(".js-video-player").forEach(function (video) {
    video.addEventListener("play", function () {
      initVideo(video);
      var button = document.querySelector("[data-target='" + video.id + "']");
      if (button) {
        button.classList.add("is-hidden");
      }
    });
  });
})();
