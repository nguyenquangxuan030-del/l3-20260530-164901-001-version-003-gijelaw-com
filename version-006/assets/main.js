(function () {
  function query(selector, root) {
    return (root || document).querySelector(selector);
  }

  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = query('[data-menu-button]');
  var mobileMenu = query('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  queryAll('[data-filter-scope]').forEach(function (scope) {
    var input = query('[data-filter-input]', scope);
    var cards = queryAll('[data-card]', scope);
    var empty = query('[data-empty-state]', scope);

    if (!input || cards.length === 0) {
      return;
    }

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();

        var matched = keyword === '' || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });

  var searchInput = query('#global-search-input');
  var searchResults = query('#search-results');
  var searchSummary = query('#search-summary');
  var categorySelect = query('#global-category-select');
  var yearSelect = query('#global-year-select');

  if (searchInput && searchResults && window.SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    var years = Array.from(new Set(window.SEARCH_DATA.map(function (item) {
      return item.year;
    }))).filter(Boolean).sort().reverse();

    if (yearSelect) {
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    function renderSearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      var matched = window.SEARCH_DATA.filter(function (item) {
        var text = [
          item.title,
          item.region,
          item.year,
          item.genre,
          item.tags,
          item.oneLine,
          item.category
        ].join(' ').toLowerCase();

        return (keyword === '' || text.indexOf(keyword) !== -1) &&
          (category === '' || item.category === category) &&
          (year === '' || item.year === year);
      }).slice(0, 240);

      searchResults.innerHTML = matched.map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="corner-label">' + escapeHtml(item.region) + '</span>',
          '<span class="play-circle">▶</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p class="movie-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>',
          '<p class="movie-line">' + escapeHtml(item.oneLine) + '</p>',
          '<div class="movie-tags"><span>' + escapeHtml(item.category) + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');

      if (searchSummary) {
        if (matched.length === 0) {
          searchSummary.textContent = '没有找到匹配影片';
        } else {
          searchSummary.textContent = '显示 ' + matched.length + ' 条匹配结果';
        }
      }
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    searchInput.addEventListener('input', renderSearch);

    if (categorySelect) {
      categorySelect.addEventListener('change', renderSearch);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', renderSearch);
    }

    renderSearch();
  }
})();
