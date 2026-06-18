(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var searchButton = document.querySelector('[data-search-toggle]');
  var headerSearch = document.querySelector('[data-header-search]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  if (searchButton && headerSearch) {
    searchButton.addEventListener('click', function () {
      headerSearch.classList.toggle('is-open');
      var input = headerSearch.querySelector('input');
      if (input && headerSearch.classList.contains('is-open')) {
        input.focus();
      }
    });
  }

  setupHeroCarousel();
  setupCategoryFilter();
  setupSearchPage();
  setupPlayers();

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restartTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    restartTimer();
  }

  function setupCategoryFilter() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }

    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var count = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function updateFilter() {
      var keyword = normalize(input ? input.value : '');
      var genre = normalize(select ? select.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesGenre = !genre || normalize(card.getAttribute('data-genre')).indexOf(genre) !== -1;
        var shouldShow = matchesKeyword && matchesGenre;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    if (input) {
      input.addEventListener('input', updateFilter);
    }
    if (select) {
      select.addEventListener('change', updateFilter);
    }
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    var summary = document.querySelector('[data-search-summary]');

    if (input) {
      input.value = keyword;
    }

    var normalized = keyword.toLowerCase();
    var data = window.MOVIE_SEARCH_DATA;
    var matched = data.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, 240);

    if (summary) {
      summary.textContent = keyword
        ? '“' + keyword + '” 找到 ' + matched.length + ' 条结果'
        : '显示前 ' + matched.length + ' 部精选影片';
    }

    results.innerHTML = matched.map(function (movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-card__poster" href="' + escapeHtml(movie.url) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <div class="movie-card__overlay"><span class="play-pill">立即观看</span></div>',
        '  </a>',
        '  <div class="movie-card__body">',
        '    <div class="movie-card__meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-launch');
      var source = shell.getAttribute('data-m3u8');

      if (!video || !button || !source) {
        return;
      }

      button.addEventListener('click', function () {
        shell.classList.add('is-playing');
        startVideo(video, source);
      });
    });
  }

  function startVideo(video, source) {
    if (video.dataset.ready === 'true') {
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.dataset.ready = 'true';
        video.play().catch(function () {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
    } else {
      video.src = source;
      video.dataset.ready = 'true';
      video.play().catch(function () {});
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
