(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mainNav = document.querySelector('[data-main-nav]');
  const headerSearch = document.querySelector('.header-search');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
      if (headerSearch) {
        headerSearch.classList.toggle('open');
      }
    });
  }

  document.querySelectorAll('[data-cover-image]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
      image.setAttribute('aria-hidden', 'true');
    });
  });

  function setupHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  function setupHeaderSearch() {
    const input = document.querySelector('[data-search-input]');
    const panel = document.querySelector('[data-search-panel]');
    const data = window.MOVIE_SEARCH_DATA || [];

    if (!input || !panel || !data.length) {
      return;
    }

    function currentPrefix() {
      const stylesheet = document.querySelector('link[href$="assets/site.css"]');
      if (!stylesheet) {
        return '';
      }

      const href = stylesheet.getAttribute('href') || '';
      return href.replace(/assets\/site\.css.*$/, '');
    }

    function renderResults(keyword) {
      const value = keyword.trim().toLowerCase();
      if (!value) {
        panel.classList.remove('open');
        panel.innerHTML = '';
        return;
      }

      const prefix = currentPrefix();
      const results = data
        .filter(function (movie) {
          return movie.searchText.toLowerCase().includes(value);
        })
        .slice(0, 9);

      if (!results.length) {
        panel.innerHTML = '<p class="search-empty">没有找到匹配影片</p>';
        panel.classList.add('open');
        return;
      }

      panel.innerHTML = results.map(function (movie) {
        return [
          '<a class="search-result" href="' + prefix + 'movie/' + movie.id + '.html">',
          '  <img src="' + prefix + movie.cover + '" alt="' + movie.title + '">',
          '  <span>',
          '    <strong>' + movie.title + '</strong>',
          '    <span>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</span>',
          '  </span>',
          '</a>'
        ].join('');
      }).join('');
      panel.classList.add('open');
    }

    input.addEventListener('input', function () {
      renderResults(input.value);
    });

    input.addEventListener('focus', function () {
      renderResults(input.value);
    });

    document.addEventListener('click', function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove('open');
      }
    });
  }

  function setupPageFilters() {
    const panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (panel) {
      const input = panel.querySelector('[data-page-filter-input]');
      const yearSelect = panel.querySelector('[data-page-filter-select="year"]');
      const typeSelect = panel.querySelector('[data-page-filter-select="type"]');
      const count = panel.querySelector('[data-filter-count]');
      const grid = document.querySelector('[data-filter-grid]');

      if (!grid) {
        return;
      }

      const cards = Array.from(grid.querySelectorAll('.movie-card'));

      function applyFilter() {
        const keyword = (input ? input.value : '').trim().toLowerCase();
        const year = yearSelect ? yearSelect.value : '';
        const type = typeSelect ? typeSelect.value : '';
        let visible = 0;

        cards.forEach(function (card) {
          const searchable = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.year
          ].join(' ').toLowerCase();
          const matchKeyword = !keyword || searchable.includes(keyword);
          const matchYear = !year || card.dataset.year === year;
          const matchType = !type || card.dataset.type === type;
          const shouldShow = matchKeyword && matchYear && matchType;

          card.classList.toggle('is-hidden-by-filter', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部';
        }
      }

      [input, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      const params = new URLSearchParams(window.location.search);
      if (input && params.get('q')) {
        input.value = params.get('q');
      }
      applyFilter();
    });
  }

  setupHeroSlider();
  setupHeaderSearch();
  setupPageFilters();
})();
