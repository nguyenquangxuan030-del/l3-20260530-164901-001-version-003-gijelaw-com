(function () {
  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = sourceUrl;
      attached = true;
    }

    function play() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      if (video) {
        video.controls = true;
        var run = video.play();
        if (run && typeof run.catch === "function") {
          run.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    }
  };
})();
