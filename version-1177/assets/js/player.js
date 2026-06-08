(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function() {
    document.querySelectorAll(".js-player").forEach(function(box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".js-play");
      var stream = box.getAttribute("data-stream");
      var hls = null;
      var prepared = false;

      function attach() {
        if (!video || !stream || prepared) {
          return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function begin() {
        if (!video) {
          return;
        }

        attach();
        box.classList.add("is-playing");

        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function() {
            box.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          begin();
        });
      }

      box.addEventListener("click", function(event) {
        if (event.target === video && !video.paused) {
          return;
        }
        begin();
      });

      if (video) {
        video.addEventListener("play", function() {
          box.classList.add("is-playing");
        });

        video.addEventListener("pause", function() {
          if (video.currentTime === 0 || video.ended) {
            box.classList.remove("is-playing");
          }
        });

        video.addEventListener("ended", function() {
          box.classList.remove("is-playing");
        });
      }

      window.addEventListener("beforeunload", function() {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
