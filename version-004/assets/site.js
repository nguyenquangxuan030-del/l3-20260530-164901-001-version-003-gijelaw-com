(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-list-search]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    function filterCards() {
      var q = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var region = (card.getAttribute("data-region") || "").toLowerCase();
        var genre = (card.getAttribute("data-genre") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var okText = !q || title.indexOf(q) >= 0 || region.indexOf(q) >= 0 || genre.indexOf(q) >= 0;
        var okType = !type || cardType === type;
        var okYear = !year || cardYear === year;
        card.hidden = !(okText && okType && okYear);
      });
    }
    [filterInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    var searchBox = document.querySelector("[data-search-box]");
    var searchResults = document.querySelector("[data-search-results]");
    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }
    function renderSearch() {
      if (!searchBox || !searchResults || !Array.isArray(window.MOVIE_INDEX)) {
        return;
      }
      var q = searchBox.value.trim().toLowerCase();
      var pool = window.MOVIE_INDEX.filter(function (item) {
        if (!q) {
          return true;
        }
        return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(q) >= 0;
      }).slice(0, 96);
      searchResults.innerHTML = pool.map(function (item) {
        return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
          '<figure class="poster-frame"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></figure>' +
          '<div class="movie-card-body">' +
          '<div class="movie-card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</div>' +
          '<h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
          '</div></a>';
      }).join("");
    }
    if (searchBox) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (initial) {
        searchBox.value = initial;
      }
      searchBox.addEventListener("input", renderSearch);
      renderSearch();
    }
  });
})();
