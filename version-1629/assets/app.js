(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menuPanel = document.querySelector('[data-menu-panel]');

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', function () {
      menuPanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var keyword = filterRoot.querySelector('[data-filter-keyword]');
    var genre = filterRoot.querySelector('[data-filter-genre]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var empty = filterRoot.querySelector('[data-empty-result]');

    function includes(source, value) {
      return !value || String(source || '').toLowerCase().indexOf(String(value).toLowerCase()) !== -1;
    }

    function filterCards() {
      var keyValue = keyword ? keyword.value.trim() : '';
      var genreValue = genre ? genre.value : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        ok = ok && includes(card.dataset.title, keyValue);
        ok = ok && includes(card.dataset.genre, genreValue);
        ok = ok && includes(card.dataset.year, yearValue);
        ok = ok && includes(card.dataset.region, regionValue);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, genre, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-button]');
    var initialized = false;
    var hlsInstance = null;

    function loadVideo() {
      if (!video || initialized) {
        return;
      }

      var source = video.dataset.src;
      if (!source) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startVideo() {
      loadVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!initialized || video.paused) {
          startVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
