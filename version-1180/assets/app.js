(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function() {
            var isOpen = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function initHeaderSearch() {
        document.querySelectorAll(".site-search").forEach(function(form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHeroSlider() {
        document.querySelectorAll("[data-hero-slider]").forEach(function(slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var prev = slider.querySelector(".hero-prev");
            var next = slider.querySelector(".hero-next");
            if (!slides.length) {
                return;
            }
            var index = 0;
            var timer = null;
            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, position) {
                    slide.classList.toggle("is-active", position === index);
                });
                dots.forEach(function(dot, position) {
                    dot.classList.toggle("is-active", position === index);
                });
            }
            function play() {
                stop();
                timer = window.setInterval(function() {
                    show(index + 1);
                }, 5000);
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
                    play();
                });
            }
            if (next) {
                next.addEventListener("click", function() {
                    show(index + 1);
                    play();
                });
            }
            dots.forEach(function(dot, position) {
                dot.addEventListener("click", function() {
                    show(position);
                    play();
                });
            });
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", play);
            show(0);
            play();
        });
    }

    function initFilters() {
        document.querySelectorAll(".card-filter-scope").forEach(function(scope) {
            var panel = scope.querySelector("[data-filter-panel]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");
            if (!panel || !cards.length) {
                return;
            }
            function value(name) {
                var control = panel.querySelector("[data-filter='" + name + "']");
                return control ? control.value.trim().toLowerCase() : "";
            }
            function apply() {
                var keyword = value("keyword");
                var year = value("year");
                var region = value("region");
                var category = value("category");
                var visible = 0;
                cards.forEach(function(card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category")
                    ].map(text).join(" ");
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (year && text(card.getAttribute("data-year")) !== year) {
                        ok = false;
                    }
                    if (region && text(card.getAttribute("data-region")).indexOf(region) === -1) {
                        ok = false;
                    }
                    if (category && text(card.getAttribute("data-category")) !== category) {
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
            panel.addEventListener("input", apply);
            panel.addEventListener("change", apply);
            panel.addEventListener("submit", function(event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    }

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function movieCard(movie) {
        return "<article class=\"movie-card\">" +
            "<a class=\"card-link\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<div class=\"poster-frame\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
            "</div>" +
            "<div class=\"card-body\">" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "</div>" +
            "</a>" +
            "</article>";
    }

    function initSearchPage() {
        var results = document.getElementById("searchResults");
        var empty = document.getElementById("searchEmpty");
        var input = document.getElementById("searchPageInput");
        var category = document.getElementById("searchCategory");
        var year = document.getElementById("searchYear");
        var form = document.querySelector("[data-search-page-form]");
        var movies = window.SEARCH_MOVIES || [];
        if (!results || !input || !form) {
            return;
        }
        input.value = getQueryParam("q");
        function render() {
            var query = text(input.value.trim());
            var categoryValue = category ? category.value : "";
            var yearValue = year ? year.value : "";
            var found = movies.filter(function(movie) {
                var haystack = text([movie.title, movie.region, movie.year, movie.genre, movie.type, movie.oneLine, movie.categoryName].join(" "));
                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }
                if (categoryValue && movie.categorySlug !== categoryValue) {
                    return false;
                }
                if (yearValue && String(movie.yearKey) !== yearValue) {
                    return false;
                }
                return true;
            }).slice(0, 240);
            results.innerHTML = found.map(movieCard).join("");
            if (empty) {
                empty.classList.toggle("is-visible", found.length === 0);
            }
        }
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            render();
        });
        input.addEventListener("input", render);
        if (category) {
            category.addEventListener("change", render);
        }
        if (year) {
            year.addEventListener("change", render);
        }
        render();
    }

    window.initMoviePlayer = function(videoId, source) {
        var video = document.getElementById(videoId);
        if (!video || !source) {
            return;
        }
        var shell = video.closest(".player-shell");
        var cover = shell ? shell.querySelector(".player-cover") : null;
        var started = false;
        var hls = null;
        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }
        function playVideo() {
            hideCover();
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function() {});
            }
        }
        function start() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.load();
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function() {
                    hls.loadSource(source);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function(event, data) {
                    if (data && data.fatal && hls) {
                        hls.destroy();
                        hls = null;
                        video.src = source;
                        video.load();
                        playVideo();
                    }
                });
                return;
            }
            video.src = source;
            video.load();
            playVideo();
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function() {
            if (!started) {
                start();
            } else if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
    };

    ready(function() {
        initMenu();
        initHeaderSearch();
        initHeroSlider();
        initFilters();
        initSearchPage();
    });
})();
