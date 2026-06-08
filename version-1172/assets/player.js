(function () {
  var configNode = document.getElementById("video-config");
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var button = document.querySelector("[data-player-button]");
  var state = document.querySelector("[data-player-state]");

  if (!configNode || !video) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configNode.textContent || "{}");
  } catch (error) {
    config = {};
  }

  var source = config.src || "";
  var started = false;
  var ready = false;
  var hls = null;

  function setState(text) {
    if (state) {
      state.textContent = text;
    }
  }

  function prepare() {
    if (ready || !source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        ready = true;
        if (started) {
          playVideo();
        }
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        setState("播放加载失败，请刷新重试");
      });
      return;
    }

    setState("播放加载失败，请刷新重试");
  }

  function playVideo() {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
        setState("点击继续播放");
      });
    }
  }

  function start(event) {
    if (event) {
      event.preventDefault();
    }
    started = true;
    prepare();
    video.setAttribute("controls", "controls");
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    playVideo();
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }
  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  video.addEventListener("pause", function () {
    if (!video.ended && overlay) {
      setState("继续播放");
    }
  });
})();
