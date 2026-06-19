(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var mobileMenu = qs('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  qsa('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = 'search.html?q=' + encodeURIComponent(query);
      }
    });
  });

  var filterInput = qs('[data-card-filter]');
  var yearSelect = qs('[data-year-filter]');
  var typeSelect = qs('[data-type-filter]');
  var cards = qsa('[data-movie-card]');
  var noResults = qs('[data-no-results]');

  function applyCardFilter() {
    if (!cards.length) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre')).toLowerCase();
      var cardYear = card.getAttribute('data-year');
      var cardType = card.getAttribute('data-type');
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || cardYear === year;
      var matchType = !type || cardType === type;
      var show = matchKeyword && matchYear && matchType;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });
    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  }

  [filterInput, yearSelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyCardFilter);
      control.addEventListener('change', applyCardFilter);
    }
  });

  var hero = qs('[data-hero-slider]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function renderSearchResults() {
    var target = qs('[data-search-results]');
    var input = qs('[data-search-page-input]');
    if (!target || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function cardTemplate(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<a class="tag-link" href="search.html?q=' + encodeURIComponent(tag) + '">' + escapeHtml(tag) + '</a>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + item.url + '">',
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="badge">' + escapeHtml(item.type) + '</span>',
        '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
        '</a>',
        '<div class="movie-body">',
        '<h2 class="movie-title"><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
        '<p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function update() {
      var keyword = input.value.trim().toLowerCase();
      var source = window.SEARCH_INDEX;
      var results = keyword ? source.filter(function (item) {
        var text = [item.title, item.region, item.type, item.genre, item.oneLine, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }) : source.slice(0, 36);
      target.innerHTML = results.slice(0, 120).map(cardTemplate).join('');
    }

    input.addEventListener('input', update);
    update();
  }

  renderSearchResults();

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var streamUrl = options.streamUrl;
    var attached = false;
    var hlsInstance = null;

    if (!video || !overlay || !button || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    overlay.addEventListener('click', startPlayback);
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlayback();
    });
    video.addEventListener('click', function () {
      if (!attached) {
        startPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
