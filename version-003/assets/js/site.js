(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    var menu = qs('.mobile-nav');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function restart() {
      window.clearInterval(timer);
      play();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    play();
  }

  function setupLocalFilter() {
    qsa('[data-filter-target]').forEach(function (input) {
      var target = qs(input.getAttribute('data-filter-target'));
      if (!target) return;
      var cards = qsa('.movie-card', target);
      input.addEventListener('input', function () {
        var q = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          card.style.display = !q || haystack.indexOf(q) >= 0 ? '' : 'none';
        });
      });
    });
  }

  function setupSort() {
    qsa('[data-sort-target]').forEach(function (select) {
      var target = qs(select.getAttribute('data-sort-target'));
      if (!target) return;
      select.addEventListener('change', function () {
        var cards = qsa('.movie-card', target);
        var mode = select.value;
        cards.sort(function (a, b) {
          if (mode === 'views') return Number(b.dataset.views) - Number(a.dataset.views);
          if (mode === 'rating') return Number(b.dataset.rating) - Number(a.dataset.rating);
          if (mode === 'year') return Number(b.dataset.year) - Number(a.dataset.year);
          return Number(a.dataset.id) - Number(b.dataset.id);
        });
        cards.forEach(function (card) {
          target.appendChild(card);
        });
      });
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card" data-id="' + movie.id + '" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(movie.tags) + '" data-year="' + escapeHtml(movie.year) + '" data-views="' + movie.views + '" data-rating="' + movie.rating + '">',
      '<a href="' + movie.url + '">',
      '<div class="poster-wrap"><img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-badge">' + escapeHtml(movie.year) + '</span></div>',
      '<div class="card-body"><h2 class="card-title">' + escapeHtml(movie.title) + '</h2><p class="card-desc">' + escapeHtml(movie.oneLine) + '</p><div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>评分 ' + movie.rating + '</span></div></div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var box = qs('#search-results');
    var input = qs('#site-search-input');
    var summary = qs('#search-summary');
    if (!box || !input || !window.MOVIE_INDEX) return;
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var q = normalize(input.value);
      var data = window.MOVIE_INDEX;
      var results = q ? data.filter(function (movie) {
        var haystack = normalize([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(' '));
        return haystack.indexOf(q) >= 0;
      }).slice(0, 160) : data.slice(0, 32);
      box.innerHTML = results.length ? results.map(cardTemplate).join('') : '<div class="empty-state">未找到相关影片</div>';
      if (summary) {
        summary.textContent = q ? '关键词：' + input.value + '，相关影片如下' : '可输入片名、地区、类型或标签进行搜索';
      }
    }

    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSort();
    setupSearchPage();
  });
})();
