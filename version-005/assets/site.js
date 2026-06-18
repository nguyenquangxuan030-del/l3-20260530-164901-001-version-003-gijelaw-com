
(function () {
  function qs(root, selector) { return root.querySelector(selector); }
  function qsa(root, selector) { return Array.from(root.querySelectorAll(selector)); }

  function initMobileMenu() {
    const button = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
      button.setAttribute('aria-expanded', String(panel.classList.contains('open')));
    });
  }

  function initCarousel(root) {
    const slides = qsa(root, '[data-slide]');
    const prev = qs(root, '[data-carousel-prev]');
    const next = qs(root, '[data-carousel-next]');
    const dotsWrap = qs(root, '[data-carousel-dots]');
    if (!slides.length) return;
    let index = slides.findIndex(slide => slide.classList.contains('active'));
    if (index < 0) index = 0;
    let timer = null;

    function render() {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      if (dotsWrap) {
        qsa(dotsWrap, 'button').forEach((btn, i) => {
          btn.classList.toggle('active', i === index);
          btn.setAttribute('aria-pressed', String(i === index));
        });
      }
    }

    function go(step) {
      index = (index + step + slides.length) % slides.length;
      render();
    }

    if (dotsWrap && !dotsWrap.children.length) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换幻灯片 ' + (i + 1));
        dot.addEventListener('click', () => { index = i; render(); });
        dotsWrap.appendChild(dot);
      });
    } else if (dotsWrap && dotsWrap.children.length) {
      qsa(dotsWrap, 'button').forEach((btn, i) => btn.addEventListener('click', () => { index = i; render(); }));
    }

    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));

    function start() { stop(); timer = window.setInterval(() => go(1), 5500); }
    function stop() { if (timer) window.clearInterval(timer); timer = null; }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    render();
    start();
  }

  function initFilterGrid(root) {
    const search = qs(root, '[data-search-input]');
    const region = qs(root, '[data-region-filter]');
    const year = qs(root, '[data-year-filter]');
    const genre = qs(root, '[data-genre-filter]');
    const sort = qs(root, '[data-sort-filter]');
    const count = qs(root, '[data-result-count]');
    const cards = qsa(root, '[data-movie-card]');
    if (!search && !region && !year && !genre && !sort) return;

    function apply() {
      const keyword = search ? search.value.trim().toLowerCase() : '';
      const regionValue = region ? region.value : '';
      const yearValue = year ? year.value : '';
      const genreValue = genre ? genre.value : '';
      const sortValue = sort ? sort.value : '';

      let visible = cards.filter(card => {
        const hay = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
        if (keyword && !hay.includes(keyword)) return false;
        if (regionValue && card.dataset.region !== regionValue) return false;
        if (yearValue && card.dataset.year !== yearValue) return false;
        if (genreValue && !card.dataset.genre.includes(genreValue)) return false;
        return true;
      });

      if (sortValue === 'year-desc') visible.sort((a, b) => Number(b.dataset.year) - Number(a.dataset.year));
      else if (sortValue === 'year-asc') visible.sort((a, b) => Number(a.dataset.year) - Number(b.dataset.year));
      else if (sortValue === 'title-asc') visible.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN'));

      cards.forEach(card => card.style.display = visible.includes(card) ? '' : 'none');
      visible.forEach(card => card.parentNode.appendChild(card));
      if (count) count.textContent = '共 ' + visible.length + ' 部';
    }

    [search, region, year, genre, sort].filter(Boolean).forEach(el => el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply));
    apply();
  }

  function initVideoPlayers() {
    const videos = qsa(document, '[data-hls-src]');
    videos.forEach(video => {
      const wrapper = video.closest('[data-player-root]');
      const overlay = wrapper ? qs(wrapper, '[data-play-overlay]') : null;
      const source = video.dataset.hlsSrc;
      const canNative = video.canPlayType('application/vnd.apple.mpegurl');

      function syncOverlay() {
        if (overlay) overlay.style.display = video.paused ? 'inline-flex' : 'none';
      }

      if (source) {
        if (window.Hls && Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
              else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
              else hls.destroy();
            }
          });
        } else if (canNative) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      if (overlay) overlay.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
      video.addEventListener('play', syncOverlay);
      video.addEventListener('pause', syncOverlay);
      video.addEventListener('ended', syncOverlay);
      syncOverlay();
    });
  }

  function initFallbackImages() {
    qsa(document, 'img[data-fallback-title]').forEach(img => {
      img.addEventListener('error', function () {
        const wrap = img.parentElement;
        if (!wrap || wrap.querySelector('.poster-fallback')) return;
        const fallback = document.createElement('div');
        fallback.className = 'poster-fallback';
        fallback.textContent = img.dataset.fallbackTitle || img.alt || '精选电影';
        wrap.appendChild(fallback);
        img.style.display = 'none';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    qsa(document, '[data-carousel]').forEach(initCarousel);
    qsa(document, '[data-filter-grid]').forEach(initFilterGrid);
    initVideoPlayers();
    initFallbackImages();
  });
})();
