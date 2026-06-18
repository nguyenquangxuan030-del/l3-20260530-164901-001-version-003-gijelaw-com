import { H as Hls } from './hls-vendor-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.player-card').forEach(function (card) {
    var video = card.querySelector('video');
    var overlay = card.querySelector('.play-overlay');
    if (!video || !overlay) return;

    function begin() {
      var src = video.getAttribute('data-video-url');
      overlay.classList.add('is-hidden');
      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.dataset.ready = '1';
          video.play().catch(function () {
            overlay.classList.remove('is-hidden');
          });
        } else if (Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.dataset.ready = '1';
            video.play().catch(function () {
              overlay.classList.remove('is-hidden');
            });
          });
        } else {
          video.src = src;
          video.dataset.ready = '1';
          video.play().catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      } else {
        video.play().catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (video.paused) begin();
    });
  });
});
