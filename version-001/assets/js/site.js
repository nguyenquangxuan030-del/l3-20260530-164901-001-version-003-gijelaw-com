(function () {
  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function setActive(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setActive(dotIndex);
      });
    });

    window.setInterval(function () {
      setActive(activeIndex + 1);
    }, 5200);
  }

  function initCardFilter() {
    var input = document.querySelector('[data-card-filter]');
    var list = document.querySelector('[data-card-list]');
    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        card.style.display = !value || haystack.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  }

  function getQueryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card compact">',
      '  <a class="card-poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-play">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    if (!form || !input || !results || !Array.isArray(window.__MOVIES__)) {
      return;
    }

    function runSearch(query) {
      var keyword = query.trim().toLowerCase();
      input.value = query;

      if (!keyword) {
        var initialMovies = window.__MOVIES__.slice(0, 24);
        results.innerHTML = initialMovies.map(movieCardTemplate).join('');
        summary.textContent = '默认展示 24 部热门内容。输入关键词可搜索全部片库。';
        return;
      }

      var matches = window.__MOVIES__.filter(function (movie) {
        return movie.searchText.indexOf(keyword) !== -1;
      }).slice(0, 80);

      results.innerHTML = matches.map(movieCardTemplate).join('');
      summary.textContent = '搜索“' + query + '”找到 ' + matches.length + ' 条结果。';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var targetUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', targetUrl);
      runSearch(query);
    });

    input.addEventListener('input', function () {
      runSearch(input.value);
    });

    runSearch(getQueryFromUrl());
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeroSlider();
    initCardFilter();
    initSearchPage();
  });
})();
