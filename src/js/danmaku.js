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
    this.el().insertBefore(overlay, this.el().firstChild.nextSibling);
    cm.init();

    this.on('play', function () {
      cm.startTimer();
    });

    this.on('pause', function () {
      cm.stopTimer();
    });

    this.on('timeupdate', function (e) {
      cm.time(e.target.player.currentTime() * 1000);
    });

    function updateDisplayArea() {
      cm.setBounds();
      if (player.isFullscreen()) {
        cm.def.globalScale = screen.width / player.width();
      } else {
        cm.def.globalScale = 1;
      }
    }
    
    this.on('resize', updateDisplayArea);
    this.on('fullscreenchange', updateDisplayArea);

    commentLoader(options.src, cm);
  };

  videojs.plugin('danmaku', danmaku);
}(window.videojs, window.CommentManager, window.CommentLoader));