(function () {
  var menuButton = document.querySelector("[data-mobile-menu-button]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  var filterForm = document.querySelector("[data-filter-form]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var emptyResult = document.querySelector("[data-empty-result]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    if (!filterForm || !cards.length) {
      return;
    }

    var queryInput = filterForm.querySelector("[data-filter-query]");
    var yearSelect = filterForm.querySelector("[data-filter-year]");
    var categorySelect = filterForm.querySelector("[data-filter-category]");
    var query = normalize(queryInput && queryInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var category = normalize(categorySelect && categorySelect.value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var searchable = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.year
      ].join(" "));
      var isMatch = true;

      if (query && searchable.indexOf(query) === -1) {
        isMatch = false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        isMatch = false;
      }
      if (category && normalize(card.dataset.category) !== category) {
        isMatch = false;
      }

      card.style.display = isMatch ? "" : "none";
      if (isMatch) {
        visibleCount += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  if (filterForm) {
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q");
    var queryInput = filterForm.querySelector("[data-filter-query]");

    if (queryFromUrl && queryInput) {
      queryInput.value = queryFromUrl;
    }

    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilters();
    });
    filterForm.addEventListener("input", applyFilters);
    filterForm.addEventListener("change", applyFilters);
    applyFilters();
  }

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var message = player.querySelector("[data-player-message]");
    var started = false;
    var source = video ? video.getAttribute("data-src") : "";
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function prepareVideo() {
      if (started) {
        return;
      }
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            showMessage("当前浏览器无法加载该视频，请稍后再试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function startVideo() {
      prepareVideo();
      player.classList.add("is-playing");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showMessage("请再次点击播放按钮开始播放");
          player.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startVideo();
      });
    }

    player.addEventListener("click", function (event) {
      if (event.target === video && !video.paused) {
        return;
      }
      startVideo();
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
})();
