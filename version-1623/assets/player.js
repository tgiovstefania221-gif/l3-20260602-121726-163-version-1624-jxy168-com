(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-play]');
    var stream = wrap.getAttribute('data-stream');
    var prepared = false;
    var hls = null;

    var prepare = function () {
      if (prepared || !video || !stream) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    };

    var start = function () {
      prepare();
      var playTask = video.play();
      if (playTask && typeof playTask.then === 'function') {
        playTask.then(function () {
          wrap.classList.add('is-playing');
        }).catch(function () {
          wrap.classList.remove('is-playing');
        });
      } else {
        wrap.classList.add('is-playing');
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        wrap.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        wrap.classList.remove('is-playing');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
