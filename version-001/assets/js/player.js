import { H as Hls } from './hls-vendor-dru42stk.js';

const playerInstances = new WeakMap();

function setStatus(frame, message) {
  const status = frame.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function hideCover(frame) {
  const cover = frame.querySelector('[data-play-button]');
  if (cover) {
    cover.classList.add('is-hidden');
  }
}

function playVideo(video, frame) {
  video.play().catch(function () {
    setStatus(frame, '播放源已就绪，请再次点击视频播放');
  });
}

function createHlsPlayer(video, source, frame) {
  if (playerInstances.has(video)) {
    playVideo(video, frame);
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    playerInstances.set(video, hls);
    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(frame, '播放源已就绪');
      playVideo(video, frame);
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus(frame, '网络波动，正在重新加载播放源');
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus(frame, '媒体解码异常，正在尝试恢复');
        hls.recoverMediaError();
        return;
      }

      setStatus(frame, '播放源暂时无法加载');
      hls.destroy();
      playerInstances.delete(video);
    });

    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    playerInstances.set(video, true);
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      setStatus(frame, '播放源已就绪');
      playVideo(video, frame);
    }, { once: true });
    return;
  }

  setStatus(frame, '当前浏览器暂不支持 HLS 播放');
}

function initStaticPlayers() {
  const frames = document.querySelectorAll('[data-player]');

  frames.forEach(function (frame) {
    const video = frame.querySelector('video[data-source]');
    const button = frame.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    function startPlayback() {
      const source = video.getAttribute('data-source');
      if (!source) {
        setStatus(frame, '播放源未配置');
        return;
      }

      hideCover(frame);
      createHlsPlayer(video, source, frame);
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      hideCover(frame);
    });
  });
}

document.addEventListener('DOMContentLoaded', initStaticPlayers);
