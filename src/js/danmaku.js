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


    /******************************
     *  Visibility Toggle Button
     ******************************/

    videojs.DanmakuButton = videojs.Button.extend({
      init: function (player, options) {
        videojs.Button.call(this, player, options);
      }
    });

    videojs.DanmakuButton.prototype.onClick = function () {
      var $danmakus = document.getElementsByClassName('vjs-danmaku container')[0];
      if (!/inactive/.test(this.el().className)) {
        this.el().className += ' inactive';
        $danmakus.style.display = "none";
      } else {
        this.el().className = this.el().className.replace(/\s?inactive/, '');
        $danmakus.style.display = "";
      }
    };

    function createDanmakuButton() {
      var props = {
        className: 'vjs-danmaku-button vjs-control',
        role: 'button',
        'aria-live': 'polite',
        tabIndex: 0
      };
      return videojs.Component.prototype.createEl(null, props);
    }

    player.controlBar.el().appendChild(
      new videojs.DanmakuButton(this, { 'el': createDanmakuButton() }).el()
    );
  };

  videojs.plugin('danmaku', danmaku);
}(window.videojs, window.CommentManager, window.CommentLoader));