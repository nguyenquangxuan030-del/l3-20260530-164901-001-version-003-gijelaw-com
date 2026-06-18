(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
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
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    var filterInput = document.querySelector(".js-page-filter");
    var typeFilter = document.querySelector(".js-type-filter");
    var yearFilter = document.querySelector(".js-year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-filter-card"));
    var empty = document.querySelector("[data-empty-state]");
    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var term = normalize(filterInput && filterInput.value);
      var type = normalize(typeFilter && typeFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = (!term || haystack.indexOf(term) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [filterInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
    applyFilters();

    var resultBox = document.querySelector("[data-search-results]");
    var searchTitle = document.querySelector("[data-search-title]");
    var searchEmpty = document.querySelector("[data-search-empty]");
    if (resultBox && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var q = normalize(params.get("q"));
      var list = window.SEARCH_MOVIES;
      if (q) {
        list = window.SEARCH_MOVIES.filter(function (item) {
          return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags + " " + item.oneLine).indexOf(q) !== -1;
        });
        if (searchTitle) {
          searchTitle.textContent = "搜索结果";
        }
      } else {
        list = window.SEARCH_MOVIES.slice(0, 24);
      }
      if (q || window.location.pathname.indexOf("search") !== -1) {
        resultBox.innerHTML = list.slice(0, 240).map(function (item) {
          var tags = item.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
          }).join("");
          return "<article class=\"movie-card grid\"><a href=\"" + item.url + "\" aria-label=\"观看" + escapeHtml(item.title) + "\"><span class=\"poster-wrap\"><img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"play-badge\">▶</span><span class=\"region-badge\">" + escapeHtml(item.region) + "</span></span><span class=\"movie-body\"><strong>" + escapeHtml(item.title) + "</strong><span class=\"movie-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.type) + " · " + escapeHtml(item.genre) + "</span><span class=\"movie-desc\">" + escapeHtml(item.oneLine) + "</span><span class=\"tag-row\">" + tags + "</span></span></a></article>";
        }).join("");
        if (searchEmpty) {
          searchEmpty.hidden = list.length !== 0;
        }
      }
    }
  });

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }
})();
