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

    videojs.DanmakuButton = videojs.MenuButton.extend({
      init: function (player, options) {
        options.title = "Danmaku Settings";
        videojs.MenuButton.call(this, player, options);
      }
    });

    videojs.DanmakuButton.prototype.createItems = function () {
      return [
        new videojs.DanmakuLifetimeLabel(player, {}),
        new videojs.DanmakuLifetimeSlider(player),
        new videojs.DanmakuOpacityLabel(player, {}),
        new videojs.DanmakuOpacitySlider(player)
      ];
    };

    videojs.DanmakuButton.prototype.onClick = function () {
      if (!/danmaku-hidden/.test(this.el().className)) {
        this.el().className += ' danmaku-hidden';
        overlay.style.display = "none";
      } else {
        this.el().className = this.el().className.replace(/\s?danmaku-hidden/, '');
        overlay.style.display = "";
      }
    };

    videojs.LazyLabel = videojs.MenuItem.extend();
    videojs.LazyLabel.prototype.onClick = function () {};
    videojs.LazyLabel.prototype.createEl = function () {
      return videojs.MenuItem.prototype.createEl.call(this, 'li', {
        className: 'vjs-menu-label',
        role: 'tooltip',
        'aria-label': this.options_.label
      });
    };

    videojs.DanmakuLifetimeLabel = videojs.LazyLabel.extend({
      init: function (player, options) {
        options.label = "lifetime";
        videojs.LazyLabel.call(this, player, options);
      }
    });

    videojs.DanmakuOpacityLabel = videojs.LazyLabel.extend({
      init: function (player, options) {
        options.label = "opacity";
        videojs.LazyLabel.call(this, player, options);
      }
    });

    /***************
     *  Sliders
     ***************/

    videojs.GenericSlider = videojs.Slider.extend({
      init: function (player, options) {
        var self = this;
        setTimeout(function () {
          self.update();
        }, 0);
        videojs.Slider.call(this, player, options);
      }
    });
    videojs.GenericSlider.prototype.options_ = {
      children: {
        'genericSliderLevel': {},
        'genericSliderHandle': {}
      },
      'barName': 'genericSliderLevel',
      'handleName': 'genericSliderHandle'
    };
    videojs.GenericSlider.prototype.playerEvent = 'danmakuSettingsChange';
    videojs.GenericSlider.prototype.createEl = function () {
      return videojs.Slider.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-bar'
      });
    };
    videojs.GenericSlider.prototype.getPercent = function () {
      return 0.5;
    };
    videojs.GenericSliderLevel = videojs.Component.extend();
    videojs.GenericSliderLevel.prototype.createEl = function () {
      return videojs.Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-level'
      });
    };
    videojs.GenericSliderHandle = videojs.SliderHandle.extend();
    videojs.GenericSliderHandle.prototype.createEl = function () {
      return videojs.SliderHandle.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-handle'
      });
    };

    videojs.DanmakuLifetimeSlider = videojs.GenericSlider.extend();
    videojs.DanmakuLifetimeSlider.prototype.onMouseMove = function (event) {
      var scale;
      if ((scale = this.calculateDistance(event)) > 0.1) {
        cm.def.globalScale = scale * 2;
      }
      this.trigger('danmakuSettingsChange');
    };
    videojs.DanmakuLifetimeSlider.prototype.getPercent = function () {
      return cm.def.globalScale / 2;
    };

    videojs.DanmakuOpacitySlider = videojs.GenericSlider.extend();
    videojs.DanmakuOpacitySlider.prototype.onMouseMove = function (event) {
      cm.def.opacity = this.calculateDistance(event);
      this.trigger('danmakuSettingsChange');
    };
    videojs.DanmakuOpacitySlider.prototype.getPercent = function () {
      return cm.def.opacity;
    };

    /********************
     *  Init Components
     ********************/

    function createDanmakuButton() {
      var props = {
        className: 'vjs-danmaku-button vjs-menu-button vjs-control',
        role: 'button',
        'aria-label': 'danmaku settings',
        'aria-live': 'polite',
        tabIndex: 0
      };
      return videojs.Component.prototype.createEl(null, props);
    }

    player.controlBar.el().appendChild(
      new videojs.DanmakuButton(this, { 'el': createDanmakuButton() }).el()
    );


    /********************
     *  Comment Bar
     ********************/

    if (options.cid) {
      var bar = document.createElement('div'),
        form = document.createElement('form'),
        span = document.createElement('span'),
        select = document.createElement('select'),
        option = document.createElement('option'),
        input = document.createElement('input'),
        span_mode = span.cloneNode(),
        select_mode = select.cloneNode(),
        text_input = input.cloneNode(),
        submit_button = input.cloneNode(),
        option_mode_default = option.cloneNode(),
        option_mode_top = option.cloneNode(),
        option_mode_bottom = option.cloneNode();

      bar.className = "vjs-danmaku-bar";

      select_mode.className = "mode";
      option_mode_default.appendChild(document.createTextNode("<"));
      option_mode_default.setAttribute("value", 1);
      option_mode_default.setAttribute("selected", "");
      select_mode.appendChild(option_mode_default);
      option_mode_top.appendChild(document.createTextNode("^"));
      option_mode_top.setAttribute("value", 5);
      select_mode.appendChild(option_mode_top);
      option_mode_bottom.appendChild(document.createTextNode("v"));
      option_mode_bottom.setAttribute("value", 4);
      select_mode.appendChild(option_mode_bottom);

      span_mode.appendChild(document.createTextNode("Mode: "));
      span_mode.appendChild(select_mode);
      form.appendChild(span_mode);

      text_input.setAttribute("type", "text");
      text_input.setAttribute("placeholder", " leave a comment");
      text_input.setAttribute("autofocus", "");
      form.appendChild(text_input);

      submit_button.setAttribute("type", "submit");
      submit_button.setAttribute("value", "send");
      form.appendChild(submit_button);

      form.className = "danmaku";
      bar.appendChild(form);
      player.controlBar.el().appendChild(bar);

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (text_input.value !== '') {
          var cmt = {};
          cmt.cid = options.cid;
          cmt.stime = player.currentTime();
          cmt.mode = parseInt(select_mode.value, 10);
          cmt.size = 25;
          cmt.text = text_input.value;

          var dmpost = new XMLHttpRequest(),
            cmtSend = JSON.stringify(cmt);
          dmpost.open("POST", options.postURL || '/danmaku', true);
          dmpost.setRequestHeader("Content-type", "application/json");

          dmpost.onreadystatechange = function () {
            if (dmpost.readyState === XMLHttpRequest.DONE) {

              if (dmpost.status === 200 || dmpost.status === 201) {
                cmt.stime *= 1000;
                cmt.border = true;
                cm.timeline.binsert(cmt, function (a, b) {
                  if (a.stime < b.stime) {
                    return -1;
                  } else if (a.stime === b.stime) {
                    return 0;
                  } else { return 1; }
                });

                text_input.setAttribute("placeholder", " comment sent");

              } else {
                text_input.setAttribute("placeholder", " comment failed");
              }

            }
          };

          dmpost.send(cmtSend);
          text_input.value = '';
        }
        return false;
      });
    }
  };

  videojs.plugin('danmaku', danmaku);
}(window.videojs, window.CommentManager, window.CommentLoader));
