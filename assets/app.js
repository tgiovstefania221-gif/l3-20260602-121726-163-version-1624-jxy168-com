(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

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

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-grid]'));
    if (!grids.length) return;
    var search = document.querySelector('[data-search]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var sort = document.querySelector('[data-sort]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && search) search.value = query;

    function apply() {
      var q = normalize(search && search.value);
      var t = normalize(typeFilter && typeFilter.value);
      var y = normalize(yearFilter && yearFilter.value);
      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
        cards.forEach(function (card) {
          var hay = normalize(card.dataset.title + ' ' + card.dataset.tags + ' ' + card.dataset.year + ' ' + card.dataset.type);
          var typeOK = !t || normalize(card.dataset.type).indexOf(t) !== -1;
          var yearOK = !y || normalize(card.dataset.year) === y;
          var queryOK = !q || hay.indexOf(q) !== -1;
          card.hidden = !(typeOK && yearOK && queryOK);
        });
        if (sort) {
          var mode = sort.value;
          var ordered = cards.slice().sort(function (a, b) {
            if (mode === 'score-desc') return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
            if (mode === 'title-asc') return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          });
          ordered.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      });
    }

    [search, typeFilter, yearFilter, sort].forEach(function (el) {
      if (el) el.addEventListener('input', apply);
      if (el) el.addEventListener('change', apply);
    });
    apply();
  }

  function setupSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="search"]');
        var q = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || 'search.html';
        window.location.href = q ? target + '?q=' + encodeURIComponent(q) : target;
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchForms();
  });
})();
