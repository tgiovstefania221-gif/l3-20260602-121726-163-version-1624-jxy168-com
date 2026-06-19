import { H as Hls } from './hls-dru42stk.js';

function setMessage(frame, message) {
  const messageBox = frame.querySelector('[data-player-message]');
  if (messageBox) {
    messageBox.textContent = message || '';
  }
}

function playVideo(video, frame) {
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      setMessage(frame, '浏览器阻止了自动播放，请再次点击播放器开始播放。');
    });
  }
}

function attachSource(video, frame) {
  const source = video.dataset.hlsSrc;
  if (!source) {
    setMessage(frame, '当前影片缺少播放地址。');
    return;
  }

  if (video.dataset.playerReady === 'true') {
    playVideo(video, frame);
    return;
  }

  setMessage(frame, '正在加载播放源...');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.playerReady = 'true';
    video.addEventListener('loadedmetadata', function () {
      setMessage(frame, '');
      playVideo(video, frame);
    }, { once: true });
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    video.dataset.playerReady = 'true';
    video.hlsInstance = hls;

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setMessage(frame, '');
      playVideo(video, frame);
    });

    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (data && data.fatal) {
        setMessage(frame, '播放源加载失败，请稍后重试或更换浏览器。');
        hls.destroy();
        video.dataset.playerReady = 'false';
      }
    });
    return;
  }

  setMessage(frame, '当前浏览器不支持 HLS 播放。');
}

function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach(function (frame) {
    const video = frame.querySelector('video');
    const trigger = frame.querySelector('[data-play-trigger]');

    if (!video || !trigger) {
      return;
    }

    trigger.addEventListener('click', function () {
      trigger.classList.add('hidden');
      attachSource(video, frame);
    });

    video.addEventListener('play', function () {
      trigger.classList.add('hidden');
    });
  });
}

setupPlayers();
