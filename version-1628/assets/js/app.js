(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.nav-menu');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupMissingImages() {
        document.addEventListener('error', function (event) {
            var target = event.target;
            if (target && target.tagName === 'IMG') {
                target.classList.add('image-missing');
                target.removeAttribute('srcset');
            }
        }, true);
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            slides[index].classList.remove('active');
            if (dots[index]) {
                dots[index].classList.remove('active');
            }
            index = next;
            slides[index].classList.add('active');
            if (dots[index]) {
                dots[index].classList.add('active');
            }
        }
        function start() {
            timer = window.setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });
        start();
    }

    function loadHls(video) {
        var src = video.getAttribute('data-src');
        if (!src) {
            return Promise.resolve();
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== src) {
                video.src = src;
            }
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                video.__hlsInstance = hls;
            }
            return Promise.resolve();
        }
        if (video.src !== src) {
            video.src = src;
        }
        return Promise.resolve();
    }

    function setupPlayers() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.player-start'));
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-player-target');
                var video = document.getElementById(id);
                var frame = button.closest('.player-frame');
                if (!video) {
                    return;
                }
                loadHls(video).then(function () {
                    if (frame) {
                        frame.classList.add('is-playing');
                    }
                    var playResult = video.play();
                    if (playResult && typeof playResult.catch === 'function') {
                        playResult.catch(function () {
                            if (frame) {
                                frame.classList.remove('is-playing');
                            }
                        });
                    }
                });
            });
        });
        Array.prototype.slice.call(document.querySelectorAll('.js-hls-player')).forEach(function (video) {
            video.addEventListener('play', function () {
                loadHls(video);
            }, { once: true });
        });
    }

    function setupSearch() {
        var input = document.querySelector('[data-search-input]');
        var select = document.querySelector('[data-search-category]');
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-movie-item]'));
        if (!input || !items.length) {
            return;
        }
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var category = select ? select.value : '';
            items.forEach(function (item) {
                var text = item.getAttribute('data-search-text') || '';
                var itemCategory = item.getAttribute('data-category') || '';
                var keywordMatch = !keyword || text.toLowerCase().indexOf(keyword) !== -1;
                var categoryMatch = !category || itemCategory === category;
                item.style.display = keywordMatch && categoryMatch ? '' : 'none';
            });
        }
        input.addEventListener('input', apply);
        if (select) {
            select.addEventListener('change', apply);
        }
    }

    ready(function () {
        setupMenu();
        setupMissingImages();
        setupHero();
        setupPlayers();
        setupSearch();
    });
})();
