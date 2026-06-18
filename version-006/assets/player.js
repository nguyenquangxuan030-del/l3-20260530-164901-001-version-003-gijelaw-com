(function () {
  function initializePlayer(player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.dataset.src;
    var hlsInstance = null;

    function bindSource() {
      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      bindSourceOnce();
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    var sourceBound = false;

    function bindSourceOnce() {
      if (sourceBound) {
        return;
      }

      sourceBound = true;
      bindSource();
    }

    player.addEventListener('click', function (event) {
      if (event.target === video && !video.paused) {
        return;
      }

      if (event.target.closest('[data-play-button]') || event.target === player) {
        playVideo();
      }
    });

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (playButton) {
        playButton.classList.remove('hidden');
      }
    });

    video.addEventListener('loadedmetadata', function () {
      if (playButton) {
        playButton.classList.remove('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-video-player]').forEach(initializePlayer);
})();
