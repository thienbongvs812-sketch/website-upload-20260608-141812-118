(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      target.classList.add('image-missing');
    }
  }, true);

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  var controlBlocks = Array.prototype.slice.call(document.querySelectorAll('.catalog-controls'));
  controlBlocks.forEach(function (controls) {
    var scope = controls.parentElement;
    var searchInput = controls.querySelector('[data-filter-search]');
    var typeSelect = controls.querySelector('[data-filter-type]');
    var decadeSelect = controls.querySelector('[data-filter-decade]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    var filterCards = function () {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : 'all';
      var decade = decadeSelect ? decadeSelect.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardDecade = card.getAttribute('data-decade') || '';
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (type !== 'all' && cardType !== type) {
          matched = false;
        }
        if (decade !== 'all' && cardDecade !== decade) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [searchInput, typeSelect, decadeSelect].forEach(function (input) {
      if (input) {
        input.addEventListener('input', filterCards);
        input.addEventListener('change', filterCards);
      }
    });

    filterCards();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.player-box'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var stream = box.getAttribute('data-stream');
    var hlsInstance = null;
    var started = false;

    var play = function () {
      if (!video || !stream) {
        return;
      }

      box.classList.add('is-playing');
      video.muted = true;

      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    };

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}());
