"use strict";
cc._RF.push(module, 'af7cfA1npVNXpxbwKo9X4Hx', 'ScoreAnim');
// scripts/ScoreAnim.js

"use strict";

// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
cc.Class({
  "extends": cc.Component,
  init: function init(game) {
    this.game = game;
  },
  despawn: function despawn() {
    this.game.despawnScoreFX(this.node);
  }
});

cc._RF.pop();