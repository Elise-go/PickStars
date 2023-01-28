"use strict";
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