
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/Player.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'ac19esuaf1JsYy97RXvSp41', 'Player');
// scripts/Player.js

"use strict";

// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
cc.Class({
  "extends": cc.Component,
  properties: {
    //主角跳跃高度
    jumpHeight: 0,
    //主角跳跃持续时间
    jumpDuration: 0,
    //辅助形变动作时间
    squashDuration: 0,
    //最大移动速度
    maxMoveSpeed: 0,
    //加速度
    accel: 0,
    //跳跃音效资源
    jumpAudio: {
      "default": null,
      type: cc.AudioClip
    }
  },
  onLoad: function onLoad() {
    this.enabled = false; //加速度方向开关

    this.accLeft = false;
    this.accRight = false; //主角当前水平方向速度

    this.xSpeed = 0; //页面边界

    this.minPosX = -this.node.parent.width / 2 + this.node.width / 2;
    this.maxPosX = this.node.parent.width / 2 - this.node.width / 2; //初始化键盘输入监听

    this.setInputControl();
  },

  /************setInputControl()开始***************/
  setInputControl: function setInputControl() {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    this.node.parent.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
    this.node.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
  },
  onKeyDown: function onKeyDown(event) {
    switch (event.keyCode) {
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        this.accLeft = true;
        break;

      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        this.accRight = true;
        break;
    }
  },
  onKeyUp: function onKeyUp(event) {
    switch (event.keyCode) {
      case cc.macro.KEY.a:
      case cc.macro.KEY.left:
        this.accLeft = false;
        break;

      case cc.macro.KEY.d:
      case cc.macro.KEY.right:
        this.accRight = false;
        break;
    }
  },
  onTouchBegan: function onTouchBegan(event) {
    var touchLoc = event.getLocation();

    if (touchLoc.x >= cc.winSize.width / 2) {
      this.accRight = true;
    } else {
      this.accLeft = true;
    } //don't capture the event


    return true;
  },
  onTouchEnded: function onTouchEnded(event) {
    this.accLeft = false;
    this.accRight = false;
  },

  /************setInputControl()结束***************/

  /************ startMoveAt()开始***************/
  startMoveAt: function startMoveAt(pos) {
    //Game.js--onStartGame()调用
    //启用该脚本组件
    this.enabled = true;
    this.node.setPosition(pos);
    this.xSpeed = 0;
    var jumpAction = this.runJumpAciton();
    cc.tween(this.node).then(jumpAction).start();
  },
  runJumpAciton: function runJumpAciton() {
    //跳跃上升
    var jumpUp = cc.tween().by(this.jumpDuration, {
      y: this.jumpHeight
    }, {
      easing: 'sineOut'
    }); //下落

    var jumpDown = cc.tween().by(this.jumpDuration, {
      y: -this.jumpHeight
    }, {
      easing: 'sineIn'
    }); //形变

    var squash = cc.tween().to(this.squashDuration, {
      scaleX: 1,
      scaleY: 0.6
    }); //挤压

    var stretch = cc.tween().to(this.squashDuration, {
      scaleX: 1,
      scaleY: 1.2
    }); //伸展

    var scaleBack = cc.tween().to(this.squashDuration, {
      scaleX: 1,
      scaleY: 1
    }); //复原
    //创建一个缓动

    var tween = cc.tween().sequence(squash, stretch, jumpUp, scaleBack, jumpDown) //添加一个回调函数，在前面的动作都结束时调用playJumpSound()方法
    .call(this.playJumpSound, this);
    return cc.tween().repeatForever(tween);
  },
  playJumpSound: function playJumpSound() {
    cc.audioEngine.playEffect(this.jumpAudio, false);
  },

  /************ startMoveAt()结束***************/
  getCenterPos: function getCenterPos() {
    //Star.js--getPlayerDistance()调用
    var centerPos = cc.v2(this.node.x, this.node.y + this.node.height / 2);
    return centerPos;
  },
  update: function update(dt) {
    //根据当前加速度方向每帧更新速度
    if (this.accLeft) {
      this.xSpeed -= this.accel * dt;
    } else if (this.accRight) {
      this.xSpeed += this.accel * dt;
    } //限定主角的速度不能超过最大值


    if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
      this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
    } //根据当前速度更新主角的位置


    this.node.x += this.xSpeed * dt; //限制主角的移动不能超过视窗边界

    if (this.node.x > this.maxPosX) {
      this.node.x = this.maxPosX;
      this.xSpeed = 0;
    } else if (this.node.x < this.minPosX) {
      this.node.x = this.minPosX;
      this.xSpeed = 0;
    }
  },
  //取消键盘输入监听
  onDestroy: function onDestroy() {
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
  }
});

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcUGxheWVyLmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwianVtcEhlaWdodCIsImp1bXBEdXJhdGlvbiIsInNxdWFzaER1cmF0aW9uIiwibWF4TW92ZVNwZWVkIiwiYWNjZWwiLCJqdW1wQXVkaW8iLCJ0eXBlIiwiQXVkaW9DbGlwIiwib25Mb2FkIiwiZW5hYmxlZCIsImFjY0xlZnQiLCJhY2NSaWdodCIsInhTcGVlZCIsIm1pblBvc1giLCJub2RlIiwicGFyZW50Iiwid2lkdGgiLCJtYXhQb3NYIiwic2V0SW5wdXRDb250cm9sIiwic3lzdGVtRXZlbnQiLCJvbiIsIlN5c3RlbUV2ZW50IiwiRXZlbnRUeXBlIiwiS0VZX0RPV04iLCJvbktleURvd24iLCJLRVlfVVAiLCJvbktleVVwIiwiTm9kZSIsIlRPVUNIX1NUQVJUIiwib25Ub3VjaEJlZ2FuIiwiVE9VQ0hfRU5EIiwib25Ub3VjaEVuZGVkIiwiZXZlbnQiLCJrZXlDb2RlIiwibWFjcm8iLCJLRVkiLCJhIiwibGVmdCIsImQiLCJyaWdodCIsInRvdWNoTG9jIiwiZ2V0TG9jYXRpb24iLCJ4Iiwid2luU2l6ZSIsInN0YXJ0TW92ZUF0IiwicG9zIiwic2V0UG9zaXRpb24iLCJqdW1wQWN0aW9uIiwicnVuSnVtcEFjaXRvbiIsInR3ZWVuIiwidGhlbiIsInN0YXJ0IiwianVtcFVwIiwiYnkiLCJ5IiwiZWFzaW5nIiwianVtcERvd24iLCJzcXVhc2giLCJ0byIsInNjYWxlWCIsInNjYWxlWSIsInN0cmV0Y2giLCJzY2FsZUJhY2siLCJzZXF1ZW5jZSIsImNhbGwiLCJwbGF5SnVtcFNvdW5kIiwicmVwZWF0Rm9yZXZlciIsImF1ZGlvRW5naW5lIiwicGxheUVmZmVjdCIsImdldENlbnRlclBvcyIsImNlbnRlclBvcyIsInYyIiwiaGVpZ2h0IiwidXBkYXRlIiwiZHQiLCJNYXRoIiwiYWJzIiwib25EZXN0cm95Iiwib2ZmIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBQSxFQUFFLENBQUNDLEtBQUgsQ0FBUztFQUNMLFdBQVNELEVBQUUsQ0FBQ0UsU0FEUDtFQUdMQyxVQUFVLEVBQUU7SUFDVjtJQUNBQyxVQUFVLEVBQUMsQ0FGRDtJQUdWO0lBQ0FDLFlBQVksRUFBQyxDQUpIO0lBS1Y7SUFDQUMsY0FBYyxFQUFDLENBTkw7SUFPVjtJQUNBQyxZQUFZLEVBQUMsQ0FSSDtJQVNWO0lBQ0FDLEtBQUssRUFBQyxDQVZJO0lBV1Y7SUFDQUMsU0FBUyxFQUFDO01BQ1IsV0FBUSxJQURBO01BRVJDLElBQUksRUFBQ1YsRUFBRSxDQUFDVztJQUZBO0VBWkEsQ0FIUDtFQXFCTEMsTUFBTSxFQUFDLGtCQUFVO0lBQ2YsS0FBS0MsT0FBTCxHQUFlLEtBQWYsQ0FEZSxDQUdmOztJQUNBLEtBQUtDLE9BQUwsR0FBZSxLQUFmO0lBQ0EsS0FBS0MsUUFBTCxHQUFnQixLQUFoQixDQUxlLENBTWY7O0lBQ0EsS0FBS0MsTUFBTCxHQUFjLENBQWQsQ0FQZSxDQVFmOztJQUNBLEtBQUtDLE9BQUwsR0FBZSxDQUFFLEtBQUtDLElBQUwsQ0FBVUMsTUFBVixDQUFpQkMsS0FBbkIsR0FBeUIsQ0FBekIsR0FBNkIsS0FBS0YsSUFBTCxDQUFVRSxLQUFWLEdBQWdCLENBQTVEO0lBQ0EsS0FBS0MsT0FBTCxHQUFlLEtBQUtILElBQUwsQ0FBVUMsTUFBVixDQUFpQkMsS0FBakIsR0FBdUIsQ0FBdkIsR0FBMkIsS0FBS0YsSUFBTCxDQUFVRSxLQUFWLEdBQWdCLENBQTFELENBVmUsQ0FXZjs7SUFDQSxLQUFLRSxlQUFMO0VBQ0QsQ0FsQ0k7O0VBb0NMO0VBQ0FBLGVBckNLLDZCQXFDWTtJQUNmdEIsRUFBRSxDQUFDdUIsV0FBSCxDQUFlQyxFQUFmLENBQWtCeEIsRUFBRSxDQUFDeUIsV0FBSCxDQUFlQyxTQUFmLENBQXlCQyxRQUEzQyxFQUFvRCxLQUFLQyxTQUF6RCxFQUFtRSxJQUFuRTtJQUNBNUIsRUFBRSxDQUFDdUIsV0FBSCxDQUFlQyxFQUFmLENBQWtCeEIsRUFBRSxDQUFDeUIsV0FBSCxDQUFlQyxTQUFmLENBQXlCRyxNQUEzQyxFQUFrRCxLQUFLQyxPQUF2RCxFQUErRCxJQUEvRDtJQUVBLEtBQUtaLElBQUwsQ0FBVUMsTUFBVixDQUFpQkssRUFBakIsQ0FBb0J4QixFQUFFLENBQUMrQixJQUFILENBQVFMLFNBQVIsQ0FBa0JNLFdBQXRDLEVBQWtELEtBQUtDLFlBQXZELEVBQW9FLElBQXBFO0lBQ0EsS0FBS2YsSUFBTCxDQUFVQyxNQUFWLENBQWlCSyxFQUFqQixDQUFvQnhCLEVBQUUsQ0FBQytCLElBQUgsQ0FBUUwsU0FBUixDQUFrQlEsU0FBdEMsRUFBZ0QsS0FBS0MsWUFBckQsRUFBa0UsSUFBbEU7RUFDRCxDQTNDSTtFQTZDTFAsU0E3Q0sscUJBNkNLUSxLQTdDTCxFQTZDVztJQUNkLFFBQU9BLEtBQUssQ0FBQ0MsT0FBYjtNQUNFLEtBQUtyQyxFQUFFLENBQUNzQyxLQUFILENBQVNDLEdBQVQsQ0FBYUMsQ0FBbEI7TUFDQSxLQUFLeEMsRUFBRSxDQUFDc0MsS0FBSCxDQUFTQyxHQUFULENBQWFFLElBQWxCO1FBQ0UsS0FBSzNCLE9BQUwsR0FBZSxJQUFmO1FBQ0E7O01BQ0YsS0FBS2QsRUFBRSxDQUFDc0MsS0FBSCxDQUFTQyxHQUFULENBQWFHLENBQWxCO01BQ0EsS0FBSzFDLEVBQUUsQ0FBQ3NDLEtBQUgsQ0FBU0MsR0FBVCxDQUFhSSxLQUFsQjtRQUNFLEtBQUs1QixRQUFMLEdBQWdCLElBQWhCO1FBQ0E7SUFSSjtFQVVELENBeERJO0VBeURMZSxPQXpESyxtQkF5REdNLEtBekRILEVBeURTO0lBQ1osUUFBT0EsS0FBSyxDQUFDQyxPQUFiO01BQ0UsS0FBS3JDLEVBQUUsQ0FBQ3NDLEtBQUgsQ0FBU0MsR0FBVCxDQUFhQyxDQUFsQjtNQUNBLEtBQUt4QyxFQUFFLENBQUNzQyxLQUFILENBQVNDLEdBQVQsQ0FBYUUsSUFBbEI7UUFDRSxLQUFLM0IsT0FBTCxHQUFlLEtBQWY7UUFDQTs7TUFDRixLQUFLZCxFQUFFLENBQUNzQyxLQUFILENBQVNDLEdBQVQsQ0FBYUcsQ0FBbEI7TUFDQSxLQUFLMUMsRUFBRSxDQUFDc0MsS0FBSCxDQUFTQyxHQUFULENBQWFJLEtBQWxCO1FBQ0UsS0FBSzVCLFFBQUwsR0FBZSxLQUFmO1FBQ0E7SUFSSjtFQVVELENBcEVJO0VBc0VMa0IsWUF0RUssd0JBc0VRRyxLQXRFUixFQXNFYztJQUNqQixJQUFJUSxRQUFRLEdBQUdSLEtBQUssQ0FBQ1MsV0FBTixFQUFmOztJQUNBLElBQUdELFFBQVEsQ0FBQ0UsQ0FBVCxJQUFjOUMsRUFBRSxDQUFDK0MsT0FBSCxDQUFXM0IsS0FBWCxHQUFpQixDQUFsQyxFQUFvQztNQUNsQyxLQUFLTCxRQUFMLEdBQWdCLElBQWhCO0lBQ0QsQ0FGRCxNQUVLO01BQ0gsS0FBS0QsT0FBTCxHQUFlLElBQWY7SUFDRCxDQU5nQixDQU9qQjs7O0lBQ0EsT0FBTyxJQUFQO0VBQ0QsQ0EvRUk7RUFpRkxxQixZQWpGSyx3QkFpRlFDLEtBakZSLEVBaUZjO0lBQ2pCLEtBQUt0QixPQUFMLEdBQWUsS0FBZjtJQUNBLEtBQUtDLFFBQUwsR0FBZ0IsS0FBaEI7RUFDRCxDQXBGSTs7RUFzRkw7O0VBR0E7RUFDQWlDLFdBMUZLLHVCQTBGT0MsR0ExRlAsRUEwRlc7SUFBRztJQUNqQjtJQUNBLEtBQUtwQyxPQUFMLEdBQWUsSUFBZjtJQUNBLEtBQUtLLElBQUwsQ0FBVWdDLFdBQVYsQ0FBc0JELEdBQXRCO0lBQ0EsS0FBS2pDLE1BQUwsR0FBYyxDQUFkO0lBRUEsSUFBSW1DLFVBQVUsR0FBRyxLQUFLQyxhQUFMLEVBQWpCO0lBQ0FwRCxFQUFFLENBQUNxRCxLQUFILENBQVMsS0FBS25DLElBQWQsRUFBb0JvQyxJQUFwQixDQUF5QkgsVUFBekIsRUFBcUNJLEtBQXJDO0VBQ0QsQ0FsR0k7RUFvR0xILGFBcEdLLDJCQW9HVTtJQUNiO0lBQ0EsSUFBSUksTUFBTSxHQUFHeEQsRUFBRSxDQUFDcUQsS0FBSCxHQUFXSSxFQUFYLENBQWMsS0FBS3BELFlBQW5CLEVBQWdDO01BQUNxRCxDQUFDLEVBQUMsS0FBS3REO0lBQVIsQ0FBaEMsRUFBb0Q7TUFBQ3VELE1BQU0sRUFBQztJQUFSLENBQXBELENBQWIsQ0FGYSxDQUdiOztJQUNBLElBQUlDLFFBQVEsR0FBRzVELEVBQUUsQ0FBQ3FELEtBQUgsR0FBV0ksRUFBWCxDQUFjLEtBQUtwRCxZQUFuQixFQUFnQztNQUFDcUQsQ0FBQyxFQUFDLENBQUMsS0FBS3REO0lBQVQsQ0FBaEMsRUFBcUQ7TUFBQ3VELE1BQU0sRUFBQztJQUFSLENBQXJELENBQWYsQ0FKYSxDQUtiOztJQUNBLElBQUlFLE1BQU0sR0FBRzdELEVBQUUsQ0FBQ3FELEtBQUgsR0FBV1MsRUFBWCxDQUFjLEtBQUt4RCxjQUFuQixFQUFrQztNQUFDeUQsTUFBTSxFQUFFLENBQVQ7TUFBWUMsTUFBTSxFQUFFO0lBQXBCLENBQWxDLENBQWIsQ0FOYSxDQU02RDs7SUFDMUUsSUFBSUMsT0FBTyxHQUFHakUsRUFBRSxDQUFDcUQsS0FBSCxHQUFXUyxFQUFYLENBQWMsS0FBS3hELGNBQW5CLEVBQWtDO01BQUN5RCxNQUFNLEVBQUUsQ0FBVDtNQUFZQyxNQUFNLEVBQUU7SUFBcEIsQ0FBbEMsQ0FBZCxDQVBhLENBTzhEOztJQUMzRSxJQUFJRSxTQUFTLEdBQUVsRSxFQUFFLENBQUNxRCxLQUFILEdBQVdTLEVBQVgsQ0FBYyxLQUFLeEQsY0FBbkIsRUFBa0M7TUFBQ3lELE1BQU0sRUFBRSxDQUFUO01BQVlDLE1BQU0sRUFBRTtJQUFwQixDQUFsQyxDQUFmLENBUmEsQ0FRNkQ7SUFDMUU7O0lBQ0EsSUFBSVgsS0FBSyxHQUFHckQsRUFBRSxDQUFDcUQsS0FBSCxHQUNHYyxRQURILENBQ1lOLE1BRFosRUFDbUJJLE9BRG5CLEVBQzJCVCxNQUQzQixFQUNrQ1UsU0FEbEMsRUFDNENOLFFBRDVDLEVBRUU7SUFGRixDQUdHUSxJQUhILENBR1EsS0FBS0MsYUFIYixFQUcyQixJQUgzQixDQUFaO0lBSUEsT0FBT3JFLEVBQUUsQ0FBQ3FELEtBQUgsR0FBV2lCLGFBQVgsQ0FBeUJqQixLQUF6QixDQUFQO0VBQ0QsQ0FuSEk7RUFxSExnQixhQXJISywyQkFxSFU7SUFDYnJFLEVBQUUsQ0FBQ3VFLFdBQUgsQ0FBZUMsVUFBZixDQUEwQixLQUFLL0QsU0FBL0IsRUFBeUMsS0FBekM7RUFDRCxDQXZISTs7RUF3SEw7RUFFQWdFLFlBMUhLLDBCQTBIUztJQUFFO0lBQ2QsSUFBSUMsU0FBUyxHQUFHMUUsRUFBRSxDQUFDMkUsRUFBSCxDQUFNLEtBQUt6RCxJQUFMLENBQVU0QixDQUFoQixFQUFtQixLQUFLNUIsSUFBTCxDQUFVd0MsQ0FBVixHQUFjLEtBQUt4QyxJQUFMLENBQVUwRCxNQUFWLEdBQWlCLENBQWxELENBQWhCO0lBQ0EsT0FBT0YsU0FBUDtFQUNELENBN0hJO0VBZ0lMRyxNQUFNLEVBQUMsZ0JBQVNDLEVBQVQsRUFBWTtJQUVqQjtJQUNBLElBQUcsS0FBS2hFLE9BQVIsRUFBZ0I7TUFDZCxLQUFLRSxNQUFMLElBQWUsS0FBS1IsS0FBTCxHQUFXc0UsRUFBMUI7SUFDRCxDQUZELE1BRU0sSUFBRyxLQUFLL0QsUUFBUixFQUFpQjtNQUNyQixLQUFLQyxNQUFMLElBQWUsS0FBS1IsS0FBTCxHQUFXc0UsRUFBMUI7SUFDRCxDQVBnQixDQVNqQjs7O0lBQ0EsSUFBR0MsSUFBSSxDQUFDQyxHQUFMLENBQVMsS0FBS2hFLE1BQWQsSUFBd0IsS0FBS1QsWUFBaEMsRUFBNkM7TUFDM0MsS0FBS1MsTUFBTCxHQUFjLEtBQUtULFlBQUwsR0FBb0IsS0FBS1MsTUFBekIsR0FBa0MrRCxJQUFJLENBQUNDLEdBQUwsQ0FBUyxLQUFLaEUsTUFBZCxDQUFoRDtJQUNELENBWmdCLENBY2pCOzs7SUFDQSxLQUFLRSxJQUFMLENBQVU0QixDQUFWLElBQWUsS0FBSzlCLE1BQUwsR0FBWThELEVBQTNCLENBZmlCLENBaUJqQjs7SUFDQSxJQUFHLEtBQUs1RCxJQUFMLENBQVU0QixDQUFWLEdBQWMsS0FBS3pCLE9BQXRCLEVBQThCO01BQzVCLEtBQUtILElBQUwsQ0FBVTRCLENBQVYsR0FBYyxLQUFLekIsT0FBbkI7TUFDQSxLQUFLTCxNQUFMLEdBQWMsQ0FBZDtJQUNELENBSEQsTUFHTSxJQUFHLEtBQUtFLElBQUwsQ0FBVTRCLENBQVYsR0FBYyxLQUFLN0IsT0FBdEIsRUFBOEI7TUFDbEMsS0FBS0MsSUFBTCxDQUFVNEIsQ0FBVixHQUFjLEtBQUs3QixPQUFuQjtNQUNBLEtBQUtELE1BQUwsR0FBYyxDQUFkO0lBQ0Q7RUFDRixDQXpKSTtFQTJKTDtFQUNBaUUsU0E1SkssdUJBNEpNO0lBQ1RqRixFQUFFLENBQUN1QixXQUFILENBQWUyRCxHQUFmLENBQW1CbEYsRUFBRSxDQUFDeUIsV0FBSCxDQUFlQyxTQUFmLENBQXlCQyxRQUE1QyxFQUFxRCxLQUFLQyxTQUExRCxFQUFvRSxJQUFwRTtJQUNBNUIsRUFBRSxDQUFDdUIsV0FBSCxDQUFlMkQsR0FBZixDQUFtQmxGLEVBQUUsQ0FBQ3lCLFdBQUgsQ0FBZUMsU0FBZixDQUF5QkcsTUFBNUMsRUFBbUQsS0FBS0MsT0FBeEQsRUFBZ0UsSUFBaEU7RUFFRDtBQWhLSSxDQUFUIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyBMZWFybiBjYy5DbGFzczpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL2NsYXNzLmh0bWxcbi8vIExlYXJuIEF0dHJpYnV0ZTpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL3JlZmVyZW5jZS9hdHRyaWJ1dGVzLmh0bWxcbi8vIExlYXJuIGxpZmUtY3ljbGUgY2FsbGJhY2tzOlxuLy8gIC0gaHR0cHM6Ly9kb2NzLmNvY29zLmNvbS9jcmVhdG9yL21hbnVhbC9lbi9zY3JpcHRpbmcvbGlmZS1jeWNsZS1jYWxsYmFja3MuaHRtbFxuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgLy/kuLvop5Lot7Pot4Ppq5jluqZcbiAgICAgIGp1bXBIZWlnaHQ6MCxcbiAgICAgIC8v5Li76KeS6Lez6LeD5oyB57ut5pe26Ze0XG4gICAgICBqdW1wRHVyYXRpb246MCxcbiAgICAgIC8v6L6F5Yqp5b2i5Y+Y5Yqo5L2c5pe26Ze0XG4gICAgICBzcXVhc2hEdXJhdGlvbjowLFxuICAgICAgLy/mnIDlpKfnp7vliqjpgJ/luqZcbiAgICAgIG1heE1vdmVTcGVlZDowLFxuICAgICAgLy/liqDpgJ/luqZcbiAgICAgIGFjY2VsOjAsXG4gICAgICAvL+i3s+i3g+mfs+aViOi1hOa6kFxuICAgICAganVtcEF1ZGlvOntcbiAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICB0eXBlOmNjLkF1ZGlvQ2xpcFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQ6ZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgICAvL+WKoOmAn+W6puaWueWQkeW8gOWFs1xuICAgICAgdGhpcy5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICB0aGlzLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAvL+S4u+inkuW9k+WJjeawtOW5s+aWueWQkemAn+W6plxuICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgLy/pobXpnaLovrnnlYxcbiAgICAgIHRoaXMubWluUG9zWCA9IC0gdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yICsgdGhpcy5ub2RlLndpZHRoLzI7XG4gICAgICB0aGlzLm1heFBvc1ggPSB0aGlzLm5vZGUucGFyZW50LndpZHRoLzIgLSB0aGlzLm5vZGUud2lkdGgvMjtcbiAgICAgIC8v5Yid5aeL5YyW6ZSu55uY6L6T5YWl55uR5ZCsXG4gICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqc2V0SW5wdXRDb250cm9sKCnlvIDlp4sqKioqKioqKioqKioqKiovXG4gICAgc2V0SW5wdXRDb250cm9sKCl7XG4gICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX0RPV04sdGhpcy5vbktleURvd24sdGhpcyk7XG4gICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX1VQLHRoaXMub25LZXlVcCx0aGlzKTtcblxuICAgICAgdGhpcy5ub2RlLnBhcmVudC5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCx0aGlzLm9uVG91Y2hCZWdhbix0aGlzKTtcbiAgICAgIHRoaXMubm9kZS5wYXJlbnQub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMub25Ub3VjaEVuZGVkLHRoaXMpXG4gICAgfSxcblxuICAgIG9uS2V5RG93bihldmVudCl7XG4gICAgICBzd2l0Y2goZXZlbnQua2V5Q29kZSl7XG4gICAgICAgIGNhc2UgY2MubWFjcm8uS0VZLmE6XG4gICAgICAgIGNhc2UgY2MubWFjcm8uS0VZLmxlZnQ6XG4gICAgICAgICAgdGhpcy5hY2NMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkuZDpcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkucmlnaHQ6XG4gICAgICAgICAgdGhpcy5hY2NSaWdodCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbktleVVwKGV2ZW50KXtcbiAgICAgIHN3aXRjaChldmVudC5rZXlDb2RlKXtcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkuYTpcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkubGVmdDpcbiAgICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkuZDpcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkucmlnaHQ6XG4gICAgICAgICAgdGhpcy5hY2NSaWdodD0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uVG91Y2hCZWdhbihldmVudCl7XG4gICAgICB2YXIgdG91Y2hMb2MgPSBldmVudC5nZXRMb2NhdGlvbigpO1xuICAgICAgaWYodG91Y2hMb2MueCA+PSBjYy53aW5TaXplLndpZHRoLzIpe1xuICAgICAgICB0aGlzLmFjY1JpZ2h0ID0gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmFjY0xlZnQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy9kb24ndCBjYXB0dXJlIHRoZSBldmVudFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIG9uVG91Y2hFbmRlZChldmVudCl7XG4gICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgIHRoaXMuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKnNldElucHV0Q29udHJvbCgp57uT5p2fKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvKioqKioqKioqKioqIHN0YXJ0TW92ZUF0KCnlvIDlp4sqKioqKioqKioqKioqKiovXG4gICAgc3RhcnRNb3ZlQXQocG9zKXsgIC8vR2FtZS5qcy0tb25TdGFydEdhbWUoKeiwg+eUqFxuICAgICAgLy/lkK/nlKjor6XohJrmnKznu4Tku7ZcbiAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLm5vZGUuc2V0UG9zaXRpb24ocG9zKTtcbiAgICAgIHRoaXMueFNwZWVkID0gMDtcblxuICAgICAgdmFyIGp1bXBBY3Rpb24gPSB0aGlzLnJ1bkp1bXBBY2l0b24oKTtcbiAgICAgIGNjLnR3ZWVuKHRoaXMubm9kZSkudGhlbihqdW1wQWN0aW9uKS5zdGFydCgpO1xuICAgIH0sXG5cbiAgICBydW5KdW1wQWNpdG9uKCl7XG4gICAgICAvL+i3s+i3g+S4iuWNh1xuICAgICAgdmFyIGp1bXBVcCA9IGNjLnR3ZWVuKCkuYnkodGhpcy5qdW1wRHVyYXRpb24se3k6dGhpcy5qdW1wSGVpZ2h0fSx7ZWFzaW5nOidzaW5lT3V0J30pO1xuICAgICAgLy/kuIvokL1cbiAgICAgIHZhciBqdW1wRG93biA9IGNjLnR3ZWVuKCkuYnkodGhpcy5qdW1wRHVyYXRpb24se3k6LXRoaXMuanVtcEhlaWdodH0se2Vhc2luZzonc2luZUluJ30pO1xuICAgICAgLy/lvaLlj5hcbiAgICAgIHZhciBzcXVhc2ggPSBjYy50d2VlbigpLnRvKHRoaXMuc3F1YXNoRHVyYXRpb24se3NjYWxlWDogMSwgc2NhbGVZOiAwLjZ9KTsgLy/mjKTljotcbiAgICAgIHZhciBzdHJldGNoID0gY2MudHdlZW4oKS50byh0aGlzLnNxdWFzaER1cmF0aW9uLHtzY2FsZVg6IDEsIHNjYWxlWTogMS4yfSk7IC8v5Ly45bGVXG4gICAgICB2YXIgc2NhbGVCYWNrID1jYy50d2VlbigpLnRvKHRoaXMuc3F1YXNoRHVyYXRpb24se3NjYWxlWDogMSwgc2NhbGVZOiAxfSk7IC8v5aSN5Y6fXG4gICAgICAvL+WIm+W7uuS4gOS4que8k+WKqFxuICAgICAgdmFyIHR3ZWVuID0gY2MudHdlZW4oKVxuICAgICAgICAgICAgICAgICAgICAuc2VxdWVuY2Uoc3F1YXNoLHN0cmV0Y2gsanVtcFVwLHNjYWxlQmFjayxqdW1wRG93bilcbiAgICAgICAgICAgICAgICAgICAgLy/mt7vliqDkuIDkuKrlm57osIPlh73mlbDvvIzlnKjliY3pnaLnmoTliqjkvZzpg73nu5PmnZ/ml7bosIPnlKhwbGF5SnVtcFNvdW5kKCnmlrnms5VcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwodGhpcy5wbGF5SnVtcFNvdW5kLHRoaXMpO1xuICAgICAgcmV0dXJuIGNjLnR3ZWVuKCkucmVwZWF0Rm9yZXZlcih0d2Vlbik7XG4gICAgfSxcblxuICAgIHBsYXlKdW1wU291bmQoKXtcbiAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5qdW1wQXVkaW8sZmFsc2UpO1xuICAgIH0sXG4gICAgLyoqKioqKioqKioqKiBzdGFydE1vdmVBdCgp57uT5p2fKioqKioqKioqKioqKioqL1xuXG4gICAgZ2V0Q2VudGVyUG9zKCl7IC8vU3Rhci5qcy0tZ2V0UGxheWVyRGlzdGFuY2UoKeiwg+eUqFxuICAgICAgdmFyIGNlbnRlclBvcyA9IGNjLnYyKHRoaXMubm9kZS54LCB0aGlzLm5vZGUueSArIHRoaXMubm9kZS5oZWlnaHQvMik7XG4gICAgICByZXR1cm4gY2VudGVyUG9zO1xuICAgIH0sXG5cblxuICAgIHVwZGF0ZTpmdW5jdGlvbihkdCl7XG4gICAgXG4gICAgICAvL+agueaNruW9k+WJjeWKoOmAn+W6puaWueWQkeavj+W4p+abtOaWsOmAn+W6plxuICAgICAgaWYodGhpcy5hY2NMZWZ0KXtcbiAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCpkdDtcbiAgICAgIH1lbHNlIGlmKHRoaXMuYWNjUmlnaHQpe1xuICAgICAgICB0aGlzLnhTcGVlZCArPSB0aGlzLmFjY2VsKmR0O1xuICAgICAgfVxuXG4gICAgICAvL+mZkOWumuS4u+inkueahOmAn+W6puS4jeiDvei2hei/h+acgOWkp+WAvFxuICAgICAgaWYoTWF0aC5hYnModGhpcy54U3BlZWQpID4gdGhpcy5tYXhNb3ZlU3BlZWQpe1xuICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIC8v5qC55o2u5b2T5YmN6YCf5bqm5pu05paw5Li76KeS55qE5L2N572uXG4gICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCpkdDtcblxuICAgICAgLy/pmZDliLbkuLvop5LnmoTnp7vliqjkuI3og73otoXov4fop4bnqpfovrnnlYxcbiAgICAgIGlmKHRoaXMubm9kZS54ID4gdGhpcy5tYXhQb3NYKXtcbiAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm1heFBvc1g7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcbiAgICAgIH1lbHNlIGlmKHRoaXMubm9kZS54IDwgdGhpcy5taW5Qb3NYKXtcbiAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm1pblBvc1g7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/lj5bmtojplK7nm5jovpPlhaXnm5HlkKxcbiAgICBvbkRlc3Ryb3koKXtcbiAgICAgIGNjLnN5c3RlbUV2ZW50Lm9mZihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX0RPV04sdGhpcy5vbktleURvd24sdGhpcyk7XG4gICAgICBjYy5zeXN0ZW1FdmVudC5vZmYoY2MuU3lzdGVtRXZlbnQuRXZlbnRUeXBlLktFWV9VUCx0aGlzLm9uS2V5VXAsdGhpcyk7XG5cbiAgICB9XG4gICBcbn0pO1xuIl19