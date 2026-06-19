(function () {
  function select(value) {
    return typeof value === 'string' ? document.querySelector(value) : value;
  }

  window.initMoviePlayer = function (options) {
    var video = select(options.video);
    var action = select(options.action);
    var cover = select(options.cover);
    var source = options.url;
    var prepared = false;

    if (!video || !source) return;

    function prepare() {
      if (prepared) return;
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      if (cover) cover.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (action) action.addEventListener('click', play);
    if (cover) cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  };
})();
