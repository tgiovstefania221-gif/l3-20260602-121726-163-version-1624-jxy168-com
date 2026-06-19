(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var localFilter = document.querySelector('[data-local-filter]');
  if (localFilter) {
    var localInput = localFilter.querySelector('input');
    var localCards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    localFilter.addEventListener('submit', function (event) {
      event.preventDefault();
    });
    if (localInput) {
      localInput.addEventListener('input', function () {
        var keyword = localInput.value.trim().toLowerCase();
        localCards.forEach(function (card) {
          var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
          card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
        });
      });
    }
  }

  var searchList = document.querySelector('[data-search-list]');
  if (searchList) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var pageInput = document.querySelector('.big-search input[name="q"]');
    var searchCards = Array.prototype.slice.call(searchList.querySelectorAll('[data-card]'));
    if (pageInput) {
      pageInput.value = q;
      pageInput.addEventListener('input', function () {
        filter(pageInput.value);
      });
    }
    filter(q);

    function filter(value) {
      var keyword = String(value || '').trim().toLowerCase();
      searchCards.forEach(function (card) {
        var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
        card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    }
  }
})();

function initMoviePlayer(src) {
  var video = document.getElementById('movie-player');
  var overlay = document.getElementById('play-overlay');
  if (!video || !src) {
    return;
  }

  var ready = false;
  var hlsInstance = null;

  function prepare() {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }
    ready = true;
  }

  function play() {
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  prepare();

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
