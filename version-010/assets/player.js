(function () {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('[data-player-video]');
    var startButton = player.querySelector('[data-player-start]');
    var source = player.getAttribute('data-source');
    var ready = false;
    var hls = null;

    function attachSource() {
      if (ready || !video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
      ready = true;
    }

    function startPlayback() {
      attachSource();

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (startButton) {
            startButton.classList.remove('is-hidden');
          }
        });
      }
    }

    if (startButton && video) {
      startButton.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          startPlayback();
        }
      });
      video.addEventListener('error', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  });
})();
