/*! videojs-danmaku
 * Copyright (c) 2014 Sunny Li
 * Licensed under the MIT license. */
(function (videojs, CommentManager, commentLoader) {
  'use strict';
  
  var danmaku = function (options) {
    var overlay = document.createElement('div'),
      cm = new CommentManager(overlay),
      player = this;

    overlay.className = 'vjs-danmaku container';
    player.el().insertBefore(overlay, player.el().firstChild.nextSibling);
    cm.init();

    player.on('play', function () {
      cm.startTimer();
    });

    player.on('pause', function () {
      cm.stopTimer();
    });

    player.on('timeupdate', function (e) {
      cm.time(player.currentTime() * 1000);
    });

    function updateDisplayArea() {
      setTimeout(function () { cm.setBounds(); }, 100);
      if (player.isFullscreen()) {
        cm.def.scrollScale = screen.width / player.width();
      } else {
        cm.def.scrollScale = 1;
      }
    }

    player.on('resize', updateDisplayArea);
    player.on('fullscreenchange', updateDisplayArea);

    commentLoader(options.src, cm);
  };

  videojs.plugin('danmaku', danmaku);
}(window.videojs, window.CommentManager, window.CommentLoader));