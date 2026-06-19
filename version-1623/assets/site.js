(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length) {
    var active = 0;
    var show = function (index) {
      active = index % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
      });
    });
    show(0);
    window.setInterval(function () {
      show(active + 1);
    }, 5600);
  }

  var pageSearch = document.querySelector('[data-page-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var selectedFilter = 'all';
  var applyFilters = function () {
    var q = pageSearch ? pageSearch.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var year = Number(card.getAttribute('data-year') || 0);
      var passSearch = !q || haystack.indexOf(q) !== -1;
      var passFilter = selectedFilter === 'all';
      if (selectedFilter === 'movie') {
        passFilter = type.indexOf('电影') !== -1;
      }
      if (selectedFilter === 'series') {
        passFilter = type.indexOf('剧') !== -1;
      }
      if (selectedFilter === 'new') {
        passFilter = year >= 2024;
      }
      if (selectedFilter === 'classic') {
        passFilter = year > 0 && year <= 2015;
      }
      card.classList.toggle('hidden-card', !(passSearch && passFilter));
    });
  };
  if (pageSearch) {
    pageSearch.addEventListener('input', applyFilters);
  }
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      selectedFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });
})();
