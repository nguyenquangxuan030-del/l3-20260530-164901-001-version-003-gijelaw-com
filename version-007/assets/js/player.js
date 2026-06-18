(function () {
  var hlsLoader;

  function loadHls(callback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }
    if (hlsLoader) {
      hlsLoader.then(function () {
        callback(window.Hls);
      });
      return;
    }
    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    hlsLoader.then(function () {
      callback(window.Hls);
    }).catch(function () {});
  }

  window.initPlayer = function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }

    function attach() {
      if (video.dataset.ready === "1") {
        return;
      }
      video.dataset.ready = "1";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      loadHls(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        }
      });
    }

    function start() {
      attach();
      button.classList.add("is-hidden");
      var playing = video.play();
      if (playing && typeof playing.catch === "function") {
        playing.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    attach();
    button.addEventListener("click", start);
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        return;
      }
      button.classList.remove("is-hidden");
    });
  };
})();
