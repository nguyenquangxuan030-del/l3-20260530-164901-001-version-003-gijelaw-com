(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) return;
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 6500);
  }

  function setupSort() {
    document.querySelectorAll('[data-sort-panel]').forEach(function (panel) {
      var list = panel.parentElement.querySelector('.sortable-list');
      if (!list) return;
      var original = Array.prototype.slice.call(list.children);
      panel.querySelectorAll('[data-sort]').forEach(function (button) {
        button.addEventListener('click', function () {
          panel.querySelectorAll('[data-sort]').forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          var sort = button.getAttribute('data-sort');
          var items = original.slice();
          if (sort === 'views') {
            items.sort(function (a, b) {
              return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
            });
          } else if (sort === 'likes') {
            items.sort(function (a, b) {
              return Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0);
            });
          } else if (sort === 'year') {
            items.sort(function (a, b) {
              return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });
          }
          items.forEach(function (item) {
            list.appendChild(item);
          });
        });
      });
    });
  }

  function setupSearch() {
    var input = document.querySelector('[data-search-input]');
    var grid = document.querySelector('[data-search-grid]');
    if (!input || !grid) return;
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');
    var copy = document.querySelector('[data-search-copy]');
    var empty = document.querySelector('[data-empty-state]');
    input.value = query;
    function apply(value) {
      var text = value.trim().toLowerCase();
      var visible = 0;
      grid.querySelectorAll('.searchable-card').forEach(function (card) {
        var pool = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var match = !text || pool.indexOf(text) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) visible += 1;
      });
      if (title) title.textContent = text ? '搜索：' + value.trim() : '影片列表';
      if (copy) copy.textContent = text ? '已按关键词匹配标题、类型、地区、年份与标签。' : '支持标题、简介、标签、年份与地区匹配。';
      if (empty) empty.hidden = visible !== 0;
    }
    apply(query);
    input.addEventListener('input', function () {
      apply(input.value);
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      if (!video || !button) return;
      var src = video.getAttribute('data-src');
      var loaded = false;
      var hls = null;
      function load() {
        if (loaded || !src) return;
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            backBufferLength: 30
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
        shell.classList.add('is-ready');
      }
      function play() {
        load();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!loaded) play();
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime <= 0.1) {
          shell.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSort();
    setupSearch();
    setupPlayers();
  });
})();
