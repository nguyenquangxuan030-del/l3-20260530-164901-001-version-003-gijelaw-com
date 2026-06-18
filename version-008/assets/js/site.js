document.addEventListener("DOMContentLoaded", function () {
    var navToggle = document.querySelector(".nav-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (navToggle && mobilePanel) {
        navToggle.addEventListener("click", function () {
            var isOpen = mobilePanel.hasAttribute("hidden") === false;
            if (isOpen) {
                mobilePanel.setAttribute("hidden", "");
                navToggle.setAttribute("aria-expanded", "false");
            } else {
                mobilePanel.removeAttribute("hidden");
                navToggle.setAttribute("aria-expanded", "true");
            }
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.from(hero.querySelectorAll(".hero-slide"));
        var dots = Array.from(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
        var section = panel.closest(".content-section") || document;
        var cards = Array.from(section.querySelectorAll(".filterable .movie-card"));
        var input = panel.querySelector(".local-filter");
        var typeSelect = panel.querySelector(".type-filter");
        var yearSelect = panel.querySelector(".year-filter");
        var types = new Set();
        var years = new Set();

        cards.forEach(function (card) {
            if (card.dataset.type) {
                types.add(card.dataset.type);
            }
            if (card.dataset.year) {
                years.add(card.dataset.year);
            }
        });

        Array.from(types).sort().forEach(function (type) {
            var option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        Array.from(years).sort().reverse().forEach(function (year) {
            var option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        function filterCards() {
            var keyword = (input.value || "").trim().toLowerCase();
            var type = typeSelect.value;
            var year = yearSelect.value;
            cards.forEach(function (card) {
                var terms = (card.dataset.terms || "").toLowerCase();
                var matchKeyword = !keyword || terms.indexOf(keyword) !== -1;
                var matchType = !type || card.dataset.type === type;
                var matchYear = !year || card.dataset.year === year;
                card.classList.toggle("hidden-card", !(matchKeyword && matchType && matchYear));
            });
        }

        input.addEventListener("input", filterCards);
        typeSelect.addEventListener("change", filterCards);
        yearSelect.addEventListener("change", filterCards);
    });

    document.querySelectorAll(".player-shell").forEach(function (shell) {
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".play-cover");
        var playUrl = shell.getAttribute("data-play");
        var hlsInstance = null;

        function attach() {
            if (!video || !playUrl || video.dataset.ready === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playUrl;
            }

            video.controls = true;
            video.dataset.ready = "1";
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        }
    });

    var searchRoot = document.querySelector("[data-search-page]");
    if (searchRoot && typeof MOVIE_SEARCH_INDEX !== "undefined") {
        var params = new URLSearchParams(window.location.search);
        var input = document.getElementById("searchInput");
        var typeSelect = document.getElementById("searchType");
        var yearSelect = document.getElementById("searchYear");
        var results = document.getElementById("searchResults");
        var types = new Set();
        var years = new Set();

        MOVIE_SEARCH_INDEX.forEach(function (movie) {
            if (movie.type) {
                types.add(movie.type);
            }
            if (movie.year) {
                years.add(movie.year);
            }
        });

        Array.from(types).sort().forEach(function (type) {
            var option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });

        Array.from(years).sort().reverse().forEach(function (year) {
            var option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        input.value = params.get("q") || "";

        function render() {
            var keyword = (input.value || "").trim().toLowerCase();
            var type = typeSelect.value;
            var year = yearSelect.value;
            var matched = MOVIE_SEARCH_INDEX.filter(function (movie) {
                var terms = (movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags + " " + movie.oneLine).toLowerCase();
                var matchKeyword = !keyword || terms.indexOf(keyword) !== -1;
                var matchType = !type || movie.type === type;
                var matchYear = !year || movie.year === year;
                return matchKeyword && matchType && matchYear;
            }).slice(0, 120);

            results.innerHTML = matched.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster-wrap" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '<span class="poster-play">▶</span>',
                    '</a>',
                    '<div class="card-body">',
                    '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                    '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="card-tags"><span>' + escapeHtml(movie.category) + '</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        input.addEventListener("input", render);
        typeSelect.addEventListener("change", render);
        yearSelect.addEventListener("change", render);
        render();
    }
});
