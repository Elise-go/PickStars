"use strict";
cc._RF.push(module, '5f5c3XQZQxKkLu3TwPTimgq', 'Star');
// scripts/Star.js

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
    //星星和主角之间的距离小于这个数值时，就会完成收集
    pickRadius: 0,
    game: null
  },
  onLoad: function onLoad() {
    this.enabled = false;
  },
  init: function init(game) {
    this.game = game;
    this.enabled = true;
  },
  getPlayerDistance: function getPlayerDistance() {
    //根据player节点位置判断距离
    var playerPos = this.game.player.getPosition();
    var dist = this.node.position.sub(playerPos).mag();
    return dist;
  },
  onPicked: function onPicked() {
    var pos = this.node.getPosition(); //传入 pos 是因为通过 star节点 的位置来确定分数显示的位置

    this.game.gainScore(pos); // 当星星被收集时，调用Game脚本中的接口，销毁当前星星节点，然后生成一个新的星星

    this.game.despawnStar(this.node);
  },
  update: function update(dt) {
    if (this.getPlayerDistance() < this.pickRadius) {
      this.onPicked();
      return;
    } // 根据Game脚本中的计时器更新星星的透明度


    var opacityRatio = 1 - this.game.timer / this.game.starDuration;
    var minOpacity = 50;
    this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
  }
});

cc._RF.pop();