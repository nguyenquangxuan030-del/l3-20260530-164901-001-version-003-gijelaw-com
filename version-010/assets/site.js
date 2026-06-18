(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot) {
        var dotIndex = Number(dot.getAttribute('data-hero-dot'));
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-scroll-row]').forEach(function (row) {
    var shell = row.closest('.scroll-shell');
    var left = shell ? shell.querySelector('[data-scroll-left]') : null;
    var right = shell ? shell.querySelector('[data-scroll-right]') : null;

    if (left) {
      left.addEventListener('click', function () {
        row.scrollBy({ left: -360, behavior: 'smooth' });
      });
    }

    if (right) {
      right.addEventListener('click', function () {
        row.scrollBy({ left: 360, behavior: 'smooth' });
      });
    }
  });

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    }).forEach(function (value) {
      if (!value) {
        return;
      }

      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  document.querySelectorAll('[data-card-list]').forEach(function (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var panel = document.querySelector('.filter-panel');
    var search = panel ? panel.querySelector('[data-local-search]') : null;
    var type = panel ? panel.querySelector('[data-filter-type]') : null;
    var year = panel ? panel.querySelector('[data-filter-year]') : null;
    var region = panel ? panel.querySelector('[data-filter-region]') : null;
    var empty = document.querySelector('[data-empty-state]');

    fillSelect(type, Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-type') || '';
    }))));
    fillSelect(year, Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-year') || '';
    }))));
    fillSelect(region, Array.from(new Set(cards.map(function (card) {
      return card.getAttribute('data-region') || '';
    }))));

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matched = false;
        }

        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matched = false;
        }

        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [search, type, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  function buildSearchCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card" data-movie-card>' +
      '<a class="movie-card__poster" href="./' + encodeURI(item.file) + '" aria-label="观看' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="movie-card__play">▶</span>' +
      '<span class="movie-card__type">' + escapeHtml(item.type) + '</span>' +
      '</a>' +
      '<div class="movie-card__body">' +
      '<a class="movie-card__title" href="./' + encodeURI(item.file) + '">' + escapeHtml(item.title) + '</a>' +
      '<p class="movie-card__line">' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="movie-card__meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
      '<div class="movie-card__tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchEmpty = document.querySelector('[data-search-empty]');
  var searchInput = document.querySelector('[data-search-page-input]');

  if (searchResults && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function runSearch() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : initialQuery.trim().toLowerCase();

      if (!query) {
        searchResults.innerHTML = '';
        if (searchEmpty) {
          searchEmpty.textContent = '请输入关键词开始搜索。';
          searchEmpty.hidden = false;
        }
        return;
      }

      var words = query.split(/\s+/).filter(Boolean);
      var matches = window.SEARCH_INDEX.filter(function (item) {
        var haystack = item.searchText.toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      searchResults.innerHTML = matches.map(buildSearchCard).join('');
      if (searchEmpty) {
        searchEmpty.textContent = matches.length ? '' : '没有找到匹配的影片。';
        searchEmpty.hidden = matches.length > 0;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', runSearch);
    }

    runSearch();
  }
})();
