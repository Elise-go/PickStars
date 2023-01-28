
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/__qc_index__.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}
require('./assets/scripts/Game');
require('./assets/scripts/Player');
require('./assets/scripts/ScoreAnim');
require('./assets/scripts/Star');

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
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/Game.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '75ad2ExrTNDSpTqclFm5t5B', 'Game');
// scripts/Game.js

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
    /*********菜单模块*********/
    playBtn: {
      "default": null,
      type: cc.Node
    },
    againBtn: {
      "default": null,
      type: cc.Node
    },
    gameOverNode: {
      "default": null,
      type: cc.Node
    },
    rules: {
      "default": null,
      type: cc.Node
    },

    /*********主角模块*********/
    //Player节点，用于获取主角弹跳高度，和控制主角行动开关
    player: {
      "default": null,
      type: cc.Node
    },

    /*********星星模块*********/
    //引用星星的预制资源
    starPrefab: {
      "default": null,
      type: cc.Prefab
    },
    //星星产生后消失时间的随机范围
    maxStarDuration: 0,
    minStarDuration: 0,
    //地面节点，用于确定星星生成的高度
    ground: {
      "default": null,
      type: cc.Node
    },

    /*********分数模块*********/
    scoreNode: {
      "default": null,
      type: cc.Node
    },
    scoreDisplay: {
      "default": null,
      type: cc.Label
    },
    //引用分数效果的预制资源
    scoreFXPrefab: {
      "default": null,
      type: cc.Prefab
    },
    scoreAudio: {
      "default": null,
      type: cc.AudioClip
    }
  },
  onLoad: function onLoad() {
    //设置游戏页面状态 (Playing or show menu)
    this.isPlaying = false; //初始化计时器

    this.timer = 0;
    this.starDuration = 0; //initialize star and score pool

    this.starPool = new cc.NodePool('Star');
    this.scorePool = new cc.NodePool('ScoreAnim'); // 保存当前星星节点以便销毁

    this.currentStar = null; //获取地平面的y轴坐标

    this.groundY = this.ground.y + this.ground.height / 2;
  },

  /************onStartGame()开始***************/
  onStartGame: function onStartGame() {
    //Button组件 Click Events属性设置
    this.isPlaying = true;

    if (this.playBtn.isValid) {
      this.playBtn.destroy();
    }

    if (this.rules.isValid) {
      this.rules.destroy();
    }

    if (!this.scoreNode.active) {
      this.scoreNode.active = true;
    }

    this.againBtn.active = false;
    this.gameOverNode.active = false; //重置玩家位置和移动速度

    this.player.getComponent('Player').startMoveAt(cc.v2(0, this.groundY)); //生成星星

    this.spawnNewStar(); // 重置计分

    this.resetScore();
  },
  spawnNewStar: function spawnNewStar() {
    var newStar = null; //node节点

    if (this.starPool.size() > 0) {
      newStar = this.starPool.get(this);
    } else {
      newStar = cc.instantiate(this.starPrefab);
    } //将新增节点添加到Canvas节点下面


    this.node.addChild(newStar); //为星星设置一个随机位置

    newStar.setPosition(this.getNewStarPosition(newStar)); // pasee Game instance to Star

    newStar.getComponent('Star').init(this); //给星星设置计时器

    this.startTimer();
    this.currentStar = newStar;
  },
  getNewStarPosition: function getNewStarPosition(starNode) {
    //spawnNewStar()调用
    var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 50;
    var maxX = this.node.width / 2 - starNode.width / 2;
    var randX = (Math.random() - 0.5) * 2 * maxX;
    return cc.v2(randX, randY);
  },
  startTimer: function startTimer() {
    //spawnNewStar()调用
    this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
    this.timer = 0;
  },
  resetScore: function resetScore() {
    this.score = 0;
    this.scoreDisplay.string = 'Score: 0';
  },

  /************onStartGame()结束***************/
  gainScore: function gainScore(pos) {
    //Star.js--onPicked()调用
    this.score += 1; //更新 scoreDisplay Label的文字

    this.scoreDisplay.string = 'Score: ' + this.score; //播放得分音效

    cc.audioEngine.playEffect(this.scoreAudio, false); //播放特效

    var fx = this.spawnScoreFX();
    this.node.addChild(fx);
    fx.setPosition(pos);
    fx.getComponent(cc.Animation).play('score_pop');
  },
  spawnScoreFX: function spawnScoreFX() {
    var fx;

    if (this.scorePool.size() > 0) {
      fx = this.scorePool.get(this);
    } else {
      fx = cc.instantiate(this.scoreFXPrefab);
      fx.getComponent('ScoreAnim').init(this);
    }

    return fx;
  },
  despawnScoreFX: function despawnScoreFX(scoreFX) {
    //作为动画播放最后一帧的回调函数
    this.scorePool.put(scoreFX);
  },
  despawnStar: function despawnStar(star) {
    //Star.js--onPicked()调用
    this.starPool.put(star);
    this.spawnNewStar();
  },
  update: function update(dt) {
    //若isPlaying==false,则往下代码不会执行，直接退出update
    if (!this.isPlaying) return; //每帧更新计时器，超时还未生成新的星星就会调用游戏失败逻辑

    if (this.timer > this.starDuration) {
      this.gameOver();
      return;
    }

    this.timer += dt;
  },
  gameOver: function gameOver() {
    this.isPlaying = false;
    this.againBtn.active = true;
    this.gameOverNode.active = true;
    this.player.getComponent('Player').enabled = false;
    this.player.stopAllActions();
    this.currentStar.destroy();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcR2FtZS5qcyJdLCJuYW1lcyI6WyJjYyIsIkNsYXNzIiwiQ29tcG9uZW50IiwicHJvcGVydGllcyIsInBsYXlCdG4iLCJ0eXBlIiwiTm9kZSIsImFnYWluQnRuIiwiZ2FtZU92ZXJOb2RlIiwicnVsZXMiLCJwbGF5ZXIiLCJzdGFyUHJlZmFiIiwiUHJlZmFiIiwibWF4U3RhckR1cmF0aW9uIiwibWluU3RhckR1cmF0aW9uIiwiZ3JvdW5kIiwic2NvcmVOb2RlIiwic2NvcmVEaXNwbGF5IiwiTGFiZWwiLCJzY29yZUZYUHJlZmFiIiwic2NvcmVBdWRpbyIsIkF1ZGlvQ2xpcCIsIm9uTG9hZCIsImlzUGxheWluZyIsInRpbWVyIiwic3RhckR1cmF0aW9uIiwic3RhclBvb2wiLCJOb2RlUG9vbCIsInNjb3JlUG9vbCIsImN1cnJlbnRTdGFyIiwiZ3JvdW5kWSIsInkiLCJoZWlnaHQiLCJvblN0YXJ0R2FtZSIsImlzVmFsaWQiLCJkZXN0cm95IiwiYWN0aXZlIiwiZ2V0Q29tcG9uZW50Iiwic3RhcnRNb3ZlQXQiLCJ2MiIsInNwYXduTmV3U3RhciIsInJlc2V0U2NvcmUiLCJuZXdTdGFyIiwic2l6ZSIsImdldCIsImluc3RhbnRpYXRlIiwibm9kZSIsImFkZENoaWxkIiwic2V0UG9zaXRpb24iLCJnZXROZXdTdGFyUG9zaXRpb24iLCJpbml0Iiwic3RhcnRUaW1lciIsInN0YXJOb2RlIiwicmFuZFkiLCJNYXRoIiwicmFuZG9tIiwianVtcEhlaWdodCIsIm1heFgiLCJ3aWR0aCIsInJhbmRYIiwic2NvcmUiLCJzdHJpbmciLCJnYWluU2NvcmUiLCJwb3MiLCJhdWRpb0VuZ2luZSIsInBsYXlFZmZlY3QiLCJmeCIsInNwYXduU2NvcmVGWCIsIkFuaW1hdGlvbiIsInBsYXkiLCJkZXNwYXduU2NvcmVGWCIsInNjb3JlRlgiLCJwdXQiLCJkZXNwYXduU3RhciIsInN0YXIiLCJ1cGRhdGUiLCJkdCIsImdhbWVPdmVyIiwiZW5hYmxlZCIs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LE9BQW5DLEdBQTZDLEtBQTdDO0lBQ0EsS0FBS3BFLE1BQUwsQ0FBWXFFLGNBQVo7SUFFQSxLQUFLbEQsV0FBTCxDQUFpQk0sT0FBakI7RUFFSDtBQTNOSSxDQUFUIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyBMZWFybiBjYy5DbGFzczpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL2NsYXNzLmh0bWxcbi8vIExlYXJuIEF0dHJpYnV0ZTpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL3JlZmVyZW5jZS9hdHRyaWJ1dGVzLmh0bWxcbi8vIExlYXJuIGxpZmUtY3ljbGUgY2FsbGJhY2tzOlxuLy8gIC0gaHR0cHM6Ly9kb2NzLmNvY29zLmNvbS9jcmVhdG9yL21hbnVhbC9lbi9zY3JpcHRpbmcvbGlmZS1jeWNsZS1jYWxsYmFja3MuaHRtbFxuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAgIC8qKioqKioqKiroj5zljZXmqKHlnZcqKioqKioqKiovXG4gICAgICAgIHBsYXlCdG46e1xuICAgICAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICAgICAgdHlwZTpjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIGFnYWluQnRuOntcbiAgICAgICAgICAgIGRlZmF1bHQ6bnVsbCxcbiAgICAgICAgICAgIHR5cGU6Y2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBnYW1lT3Zlck5vZGU6e1xuICAgICAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICAgICAgdHlwZTpjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIHJ1bGVzOntcbiAgICAgICAgICAgIGRlZmF1bHQ6bnVsbCxcbiAgICAgICAgICAgIHR5cGU6Y2MuTm9kZVxuICAgICAgICB9LFxuXG5cbiAgICAgICAgIC8qKioqKioqKirkuLvop5LmqKHlnZcqKioqKioqKiovXG4gICAgICAgIC8vUGxheWVy6IqC54K577yM55So5LqO6I635Y+W5Li76KeS5by56Lez6auY5bqm77yM5ZKM5o6n5Yi25Li76KeS6KGM5Yqo5byA5YWzXG4gICAgICAgIHBsYXllcjp7XG4gICAgICAgICAgICBkZWZhdWx0Om51bGwsXG4gICAgICAgICAgICB0eXBlOmNjLk5vZGVcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKioqKioqKirmmJ/mmJ/mqKHlnZcqKioqKioqKiovXG4gICAgICAgIC8v5byV55So5pif5pif55qE6aKE5Yi26LWE5rqQXG4gICAgICAgIHN0YXJQcmVmYWI6e1xuICAgICAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICAgICAgdHlwZTpjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgLy/mmJ/mmJ/kuqfnlJ/lkI7mtojlpLHml7bpl7TnmoTpmo/mnLrojIPlm7RcbiAgICAgICAgbWF4U3RhckR1cmF0aW9uOjAsXG4gICAgICAgIG1pblN0YXJEdXJhdGlvbjowLFxuICAgICAgICAvL+WcsOmdouiKgueCue+8jOeUqOS6juehruWumuaYn+aYn+eUn+aIkOeahOmrmOW6plxuICAgICAgICBncm91bmQ6e1xuICAgICAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICAgICAgdHlwZTpjYy5Ob2RlXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKioqKioqKioq5YiG5pWw5qih5Z2XKioqKioqKioqL1xuICAgICAgICBzY29yZU5vZGU6e1xuICAgICAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICAgICAgdHlwZTpjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3JlRGlzcGxheTp7XG4gICAgICAgICAgICBkZWZhdWx0Om51bGwsXG4gICAgICAgICAgICB0eXBlOmNjLkxhYmVsXG4gICAgICAgIH0sXG4gICAgICAgIC8v5byV55So5YiG5pWw5pWI5p6c55qE6aKE5Yi26LWE5rqQXG4gICAgICAgIHNjb3JlRlhQcmVmYWI6e1xuICAgICAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICAgICAgdHlwZTpjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgc2NvcmVBdWRpbzp7XG4gICAgICAgICAgICBkZWZhdWx0Om51bGwsXG4gICAgICAgICAgICB0eXBlOmNjLkF1ZGlvQ2xpcFxuICAgICAgICAgIH1cblxuICAgIH0sXG5cbiAgICBvbkxvYWQ6ZnVuY3Rpb24oKXtcblxuICAgICAgICAvL+iuvue9rua4uOaIj+mhtemdoueKtuaAgSAoUGxheWluZyBvciBzaG93IG1lbnUpXG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy/liJ3lp4vljJborqHml7blmahcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0wO1xuXG4gICAgICAgIC8vaW5pdGlhbGl6ZSBzdGFyIGFuZCBzY29yZSBwb29sXG4gICAgICAgIHRoaXMuc3RhclBvb2wgPSBuZXcgY2MuTm9kZVBvb2woJ1N0YXInKTtcbiAgICAgICAgdGhpcy5zY29yZVBvb2wgPSBuZXcgY2MuTm9kZVBvb2woJ1Njb3JlQW5pbScpO1xuXG4gICAgICAgIC8vIOS/neWtmOW9k+WJjeaYn+aYn+iKgueCueS7peS+v+mUgOavgVxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyID0gbnVsbDtcblxuICAgICAgICAgLy/ojrflj5blnLDlubPpnaLnmoR56L205Z2Q5qCHXG4gICAgICAgICB0aGlzLmdyb3VuZFkgPSB0aGlzLmdyb3VuZC55ICsgdGhpcy5ncm91bmQuaGVpZ2h0LzI7XG4gICAgXG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKipvblN0YXJ0R2FtZSgp5byA5aeLKioqKioqKioqKioqKioqL1xuICAgIG9uU3RhcnRHYW1lKCl7ICAvL0J1dHRvbue7hOS7tiBDbGljayBFdmVudHPlsZ7mgKforr7nva5cblxuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICBpZih0aGlzLnBsYXlCdG4uaXNWYWxpZCl7XG4gICAgICAgICAgICB0aGlzLnBsYXlCdG4uZGVzdHJveSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5ydWxlcy5pc1ZhbGlkKXtcbiAgICAgICAgICAgIHRoaXMucnVsZXMuZGVzdHJveSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIXRoaXMuc2NvcmVOb2RlLmFjdGl2ZSl7XG4gICAgICAgICAgICB0aGlzLnNjb3JlTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZ2FpbkJ0bi5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5nYW1lT3Zlck5vZGUuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgLy/ph43nva7njqnlrrbkvY3nva7lkoznp7vliqjpgJ/luqZcbiAgICAgICAgdGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdQbGF5ZXInKS5zdGFydE1vdmVBdChjYy52MigwLHRoaXMuZ3JvdW5kWSkpO1xuXG4gICAgICAgIC8v55Sf5oiQ5pif5pifXG4gICAgICAgIHRoaXMuc3Bhd25OZXdTdGFyKCk7XG5cbiAgICAgICAgLy8g6YeN572u6K6h5YiGXG4gICAgICAgIHRoaXMucmVzZXRTY29yZSgpO1xuXG4gICAgfSxcblxuICAgIHNwYXduTmV3U3RhcigpeyAgXG5cbiAgICAgICB2YXIgbmV3U3RhciA9IG51bGw7IC8vbm9kZeiKgueCuVxuICAgICAgIGlmKHRoaXMuc3RhclBvb2wuc2l6ZSgpID4gMCApe1xuICAgICAgICBuZXdTdGFyID0gdGhpcy5zdGFyUG9vbC5nZXQodGhpcyk7XG4gICAgICAgfWVsc2V7XG4gICAgICAgIG5ld1N0YXIgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnN0YXJQcmVmYWIpO1xuICAgICAgIH1cblxuICAgICAgICAvL+WwhuaWsOWinuiKgueCuea3u+WKoOWIsENhbnZhc+iKgueCueS4i+mdolxuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQobmV3U3Rhcik7XG4gICAgICAgIC8v5Li65pif5pif6K6+572u5LiA5Liq6ZqP5py65L2N572uXG4gICAgICAgIG5ld1N0YXIuc2V0UG9zaXRpb24odGhpcy5nZXROZXdTdGFyUG9zaXRpb24obmV3U3RhcikpO1xuICAgICAgICAvLyBwYXNlZSBHYW1lIGluc3RhbmNlIHRvIFN0YXJcbiAgICAgICAgbmV3U3Rhci5nZXRDb21wb25lbnQoJ1N0YXInKS5pbml0KHRoaXMpO1xuICAgICAgICAvL+e7meaYn+aYn+iuvue9ruiuoeaXtuWZqFxuICAgICAgICB0aGlzLnN0YXJ0VGltZXIoKTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyID0gbmV3U3RhcjsgIFxuICAgIH0sXG4gICAgZ2V0TmV3U3RhclBvc2l0aW9uKHN0YXJOb2RlKXsgIC8vc3Bhd25OZXdTdGFyKCnosIPnlKhcbiAgICAgICAgdmFyIHJhbmRZID0gdGhpcy5ncm91bmRZICsgTWF0aC5yYW5kb20oKSp0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1BsYXllcicpLmp1bXBIZWlnaHQgKyA1MDtcbiAgICAgICAgdmFyIG1heFggPSB0aGlzLm5vZGUud2lkdGgvMiAtIHN0YXJOb2RlLndpZHRoLzI7XG4gICAgICAgIHZhciByYW5kWCA9IChNYXRoLnJhbmRvbSgpLTAuNSkqMiptYXhYO1xuICAgICAgICByZXR1cm4gY2MudjIocmFuZFgscmFuZFkpO1xuICAgIH0sXG4gICAgc3RhcnRUaW1lcigpeyAvL3NwYXduTmV3U3Rhcigp6LCD55SoXG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gdGhpcy5taW5TdGFyRHVyYXRpb24gKyBNYXRoLnJhbmRvbSgpKih0aGlzLm1heFN0YXJEdXJhdGlvbiAtIHRoaXMubWluU3RhckR1cmF0aW9uKTtcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgfSxcblxuICAgIHJlc2V0U2NvcmUoKXsgIFxuICAgICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICAgICAgdGhpcy5zY29yZURpc3BsYXkuc3RyaW5nID0gJ1Njb3JlOiAwJztcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKm9uU3RhcnRHYW1lKCnnu5PmnZ8qKioqKioqKioqKioqKiovXG5cblxuICAgIGdhaW5TY29yZShwb3MpeyAgLy9TdGFyLmpzLS1vblBpY2tlZCgp6LCD55SoXG4gICAgICAgIHRoaXMuc2NvcmUgKz0gMTtcbiAgICAgICAgLy/mm7TmlrAgc2NvcmVEaXNwbGF5IExhYmVs55qE5paH5a2XXG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJysgdGhpcy5zY29yZTtcbiAgICAgICAgLy/mkq3mlL7lvpfliIbpn7PmlYhcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNjb3JlQXVkaW8sZmFsc2UpO1xuICAgICAgICAvL+aSreaUvueJueaViFxuICAgICAgICB2YXIgZnggPSB0aGlzLnNwYXduU2NvcmVGWCgpO1xuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQoZngpO1xuICAgICAgICBmeC5zZXRQb3NpdGlvbihwb3MpO1xuICAgICAgICBmeC5nZXRDb21wb25lbnQoY2MuQW5pbWF0aW9uKS5wbGF5KCdzY29yZV9wb3AnKTtcblxuICAgIH0sXG5cbiAgICBzcGF3blNjb3JlRlgoKXtcbiAgICAgICAgdmFyIGZ4O1xuICAgICAgICBpZih0aGlzLnNjb3JlUG9vbC5zaXplKCk+MCl7XG4gICAgICAgICAgICBmeCA9IHRoaXMuc2NvcmVQb29sLmdldCh0aGlzKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBmeCA9IGNjLmluc3RhbnRpYXRlKHRoaXMuc2NvcmVGWFByZWZhYik7XG4gICAgICAgICAgICBmeC5nZXRDb21wb25lbnQoJ1Njb3JlQW5pbScpLmluaXQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ4O1xuICAgIH0sXG5cbiAgICBkZXNwYXduU2NvcmVGWChzY29yZUZYKXsgIC8v5L2c5Li65Yqo55S75pKt5pS+5pyA5ZCO5LiA5bin55qE5Zue6LCD5Ye95pWwXG4gICAgICAgIHRoaXMuc2NvcmVQb29sLnB1dChzY29yZUZYKTtcbiAgICB9LFxuXG5cbiAgICBkZXNwYXduU3RhcihzdGFyKXsgIC8vU3Rhci5qcy0tb25QaWNrZWQoKeiwg+eUqFxuICAgICAgICB0aGlzLnN0YXJQb29sLnB1dChzdGFyKTtcbiAgICAgICAgdGhpcy5zcGF3bk5ld1N0YXIoKTtcbiAgICB9LFxuICAgIFxuICAgIHVwZGF0ZTpmdW5jdGlvbihkdCl7XG4gICAgICAgIC8v6IulaXNQbGF5aW5nPT1mYWxzZSzliJnlvoDkuIvku6PnoIHkuI3kvJrmiafooYzvvIznm7TmjqXpgIDlh7p1cGRhdGVcbiAgICAgICAgaWYoIXRoaXMuaXNQbGF5aW5nKSByZXR1cm47XG5cbiAgICAgICAgLy/mr4/luKfmm7TmlrDorqHml7blmajvvIzotoXml7bov5jmnKrnlJ/miJDmlrDnmoTmmJ/mmJ/lsLHkvJrosIPnlKjmuLjmiI/lpLHotKXpgLvovpFcbiAgICAgICAgaWYodGhpcy50aW1lciA+IHRoaXMuc3RhckR1cmF0aW9uKXtcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGltZXIgKz0gZHQ7XG4gICAgfSxcblxuICAgIGdhbWVPdmVyKCl7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5hZ2FpbkJ0bi5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmdhbWVPdmVyTm9kZS5hY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMucGxheWVyLmdldENvbXBvbmVudCgnUGxheWVyJykuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBsYXllci5zdG9wQWxsQWN0aW9ucygpO1xuICAgICAgIFxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyLmRlc3Ryb3koKTtcbiAgICAgICAgXG4gICAgfVxuXG5cbn0pO1xuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/ScoreAnim.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcU2NvcmVBbmltLmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJpbml0IiwiZ2FtZSIsImRlc3Bhd24iLCJkZXNwYXduU2NvcmVGWCIsIm5vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUFBLEVBQUUsQ0FBQ0MsS0FBSCxDQUFTO0VBQ0wsV0FBU0QsRUFBRSxDQUFDRSxTQURQO0VBR0xDLElBSEssZ0JBR0FDLElBSEEsRUFHSztJQUNOLEtBQUtBLElBQUwsR0FBWUEsSUFBWjtFQUNILENBTEk7RUFPTEMsT0FQSyxxQkFPSTtJQUNMLEtBQUtELElBQUwsQ0FBVUUsY0FBVixDQUF5QixLQUFLQyxJQUE5QjtFQUNIO0FBVEksQ0FBVCIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8gTGVhcm4gY2MuQ2xhc3M6XG4vLyAgLSBodHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvbWFudWFsL2VuL3NjcmlwdGluZy9jbGFzcy5odG1sXG4vLyBMZWFybiBBdHRyaWJ1dGU6XG4vLyAgLSBodHRwczovL2RvY3MuY29jb3MuY29tL2NyZWF0b3IvbWFudWFsL2VuL3NjcmlwdGluZy9yZWZlcmVuY2UvYXR0cmlidXRlcy5odG1sXG4vLyBMZWFybiBsaWZlLWN5Y2xlIGNhbGxiYWNrczpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL2xpZmUtY3ljbGUtY2FsbGJhY2tzLmh0bWxcblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIGluaXQoZ2FtZSl7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgfSxcblxuICAgIGRlc3Bhd24oKXtcbiAgICAgICAgdGhpcy5nYW1lLmRlc3Bhd25TY29yZUZYKHRoaXMubm9kZSk7XG4gICAgfVxuXG59KTtcbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/Star.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcU3Rhci5qcyJdLCJuYW1lcyI6WyJjYyIsIkNsYXNzIiwiQ29tcG9uZW50IiwicHJvcGVydGllcyIsInBpY2tSYWRpdXMiLCJnYW1lIiwib25Mb2FkIiwiZW5hYmxlZCIsImluaXQiLCJnZXRQbGF5ZXJEaXN0YW5jZSIsInBsYXllclBvcyIsInBsYXllciIsImdldFBvc2l0aW9uIiwiZGlzdCIsIm5vZGUiLCJwb3NpdGlvbiIsInN1YiIsIm1hZyIsIm9uUGlja2VkIiwicG9zIiwiZ2FpblNjb3JlIiwiZGVzcGF3blN0YXIiLCJ1cGRhdGUiLCJkdCIsIm9wYWNpdHlSYXRpbyIsInRpbWVyIiwic3RhckR1cmF0aW9uIiwibWluT3BhY2l0eSIsIm9wYWNpdHkiLCJNYXRoIiwiZmxvb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUFBLEVBQUUsQ0FBQ0MsS0FBSCxDQUFTO0VBQ0wsV0FBU0QsRUFBRSxDQUFDRSxTQURQO0VBR0xDLFVBQVUsRUFBRTtJQUNSO0lBQ0FDLFVBQVUsRUFBQyxDQUZIO0lBR1JDLElBQUksRUFBQztFQUhHLENBSFA7RUFVTEMsTUFWSyxvQkFVSztJQUNOLEtBQUtDLE9BQUwsR0FBZSxLQUFmO0VBQ0gsQ0FaSTtFQWNMQyxJQWRLLGdCQWNBSCxJQWRBLEVBY0s7SUFDTixLQUFLQSxJQUFMLEdBQVlBLElBQVo7SUFDQSxLQUFLRSxPQUFMLEdBQWUsSUFBZjtFQUNILENBakJJO0VBbUJMRSxpQkFuQkssK0JBbUJjO0lBQ2Y7SUFDQSxJQUFJQyxTQUFTLEdBQUcsS0FBS0wsSUFBTCxDQUFVTSxNQUFWLENBQWlCQyxXQUFqQixFQUFoQjtJQUNBLElBQUlDLElBQUksR0FBRyxLQUFLQyxJQUFMLENBQVVDLFFBQVYsQ0FBbUJDLEdBQW5CLENBQXVCTixTQUF2QixFQUFrQ08sR0FBbEMsRUFBWDtJQUNBLE9BQU9KLElBQVA7RUFDSCxDQXhCSTtFQTBCTEssUUExQkssc0JBMEJLO0lBQ04sSUFBSUMsR0FBRyxHQUFHLEtBQUtMLElBQUwsQ0FBVUYsV0FBVixFQUFWLENBRE0sQ0FFTjs7SUFDQSxLQUFLUCxJQUFMLENBQVVlLFNBQVYsQ0FBb0JELEdBQXBCLEVBSE0sQ0FJTjs7SUFDQSxLQUFLZCxJQUFMLENBQVVnQixXQUFWLENBQXNCLEtBQUtQLElBQTNCO0VBRUgsQ0FqQ0k7RUFtQ0xRLE1BQU0sRUFBQyxnQkFBU0MsRUFBVCxFQUFZO0lBQ2YsSUFBRyxLQUFLZCxpQkFBTCxLQUEyQixLQUFLTCxVQUFuQyxFQUE4QztNQUMxQyxLQUFLYyxRQUFMO01BQ0E7SUFDSCxDQUpjLENBTWY7OztJQUNBLElBQUlNLFlBQVksR0FBRyxJQUFJLEtBQUtuQixJQUFMLENBQVVvQixLQUFWLEdBQWdCLEtBQUtwQixJQUFMLENBQVVxQixZQUFqRDtJQUNBLElBQUlDLFVBQVUsR0FBRyxFQUFqQjtJQUNBLEtBQUtiLElBQUwsQ0FBVWMsT0FBVixHQUFvQkQsVUFBVSxHQUFHRSxJQUFJLENBQUNDLEtBQUwsQ0FBV04sWUFBWSxJQUFFLE1BQUlHLFVBQU4sQ0FBdkIsQ0FBakM7RUFDSDtBQTdDSSxDQUFUIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyBMZWFybiBjYy5DbGFzczpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL2NsYXNzLmh0bWxcbi8vIExlYXJuIEF0dHJpYnV0ZTpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL3JlZmVyZW5jZS9hdHRyaWJ1dGVzLmh0bWxcbi8vIExlYXJuIGxpZmUtY3ljbGUgY2FsbGJhY2tzOlxuLy8gIC0gaHR0cHM6Ly9kb2NzLmNvY29zLmNvbS9jcmVhdG9yL21hbnVhbC9lbi9zY3JpcHRpbmcvbGlmZS1jeWNsZS1jYWxsYmFja3MuaHRtbFxuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvL+aYn+aYn+WSjOS4u+inkuS5i+mXtOeahOi3neemu+Wwj+S6jui/meS4quaVsOWAvOaXtu+8jOWwseS8muWujOaIkOaUtumbhlxuICAgICAgICBwaWNrUmFkaXVzOjAsXG4gICAgICAgIGdhbWU6bnVsbFxuICAgIH0sXG5cblxuICAgIG9uTG9hZCAoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBpbml0KGdhbWUpe1xuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgIH0sXG5cbiAgICBnZXRQbGF5ZXJEaXN0YW5jZSgpe1xuICAgICAgICAvL+agueaNrnBsYXllcuiKgueCueS9jee9ruWIpOaWrei3neemu1xuICAgICAgICB2YXIgcGxheWVyUG9zID0gdGhpcy5nYW1lLnBsYXllci5nZXRQb3NpdGlvbigpO1xuICAgICAgICB2YXIgZGlzdCA9IHRoaXMubm9kZS5wb3NpdGlvbi5zdWIocGxheWVyUG9zKS5tYWcoKTtcbiAgICAgICAgcmV0dXJuIGRpc3Q7XG4gICAgfSxcblxuICAgIG9uUGlja2VkKCl7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgLy/kvKDlhaUgcG9zIOaYr+WboOS4uumAmui/hyBzdGFy6IqC54K5IOeahOS9jee9ruadpeehruWumuWIhuaVsOaYvuekuueahOS9jee9rlxuICAgICAgICB0aGlzLmdhbWUuZ2FpblNjb3JlKHBvcyk7XG4gICAgICAgIC8vIOW9k+aYn+aYn+iiq+aUtumbhuaXtu+8jOiwg+eUqEdhbWXohJrmnKzkuK3nmoTmjqXlj6PvvIzplIDmr4HlvZPliY3mmJ/mmJ/oioLngrnvvIznhLblkI7nlJ/miJDkuIDkuKrmlrDnmoTmmJ/mmJ9cbiAgICAgICAgdGhpcy5nYW1lLmRlc3Bhd25TdGFyKHRoaXMubm9kZSk7XG5cbiAgICB9LFxuXG4gICAgdXBkYXRlOmZ1bmN0aW9uKGR0KXtcbiAgICAgICAgaWYodGhpcy5nZXRQbGF5ZXJEaXN0YW5jZSgpIDwgdGhpcy5waWNrUmFkaXVzKXtcbiAgICAgICAgICAgIHRoaXMub25QaWNrZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOagueaNrkdhbWXohJrmnKzkuK3nmoTorqHml7blmajmm7TmlrDmmJ/mmJ/nmoTpgI/mmI7luqZcbiAgICAgICAgdmFyIG9wYWNpdHlSYXRpbyA9IDEgLSB0aGlzLmdhbWUudGltZXIvdGhpcy5nYW1lLnN0YXJEdXJhdGlvbjtcbiAgICAgICAgdmFyIG1pbk9wYWNpdHkgPSA1MDtcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSBtaW5PcGFjaXR5ICsgTWF0aC5mbG9vcihvcGFjaXR5UmF0aW8qKDI1NS1taW5PcGFjaXR5KSk7XG4gICAgfVxuICAgIFxufSk7XG4iXX0=
//------QC-SOURCE-SPLIT------

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcUGxheWVyLmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwianVtcEhlaWdodCIsImp1bXBEdXJhdGlvbiIsInNxdWFzaER1cmF0aW9uIiwibWF4TW92ZVNwZWVkIiwiYWNjZWwiLCJqdW1wQXVkaW8iLCJ0eXBlIiwiQXVkaW9DbGlwIiwib25Mb2FkIiwiZW5hYmxlZCIsImFjY0xlZnQiLCJhY2NSaWdodCIsInhTcGVlZCIsIm1pblBvc1giLCJub2RlIiwicGFyZW50Iiwid2lkdGgiLCJtYXhQb3NYIiwic2V0SW5wdXRDb250cm9sIiwic3lzdGVtRXZlbnQiLCJvbiIsIlN5c3RlbUV2ZW50IiwiRXZlbnRUeXBlIiwiS0VZX0RPV04iLCJvbktleURvd24iLCJLRVlfVVAiLCJvbktleVVwIiwiTm9kZSIsIlRPVUNIX1NUQVJUIiwib25Ub3VjaEJlZ2FuIiwiVE9VQ0hfRU5EIiwib25Ub3VjaEVuZGVkIiwiZXZlbnQiLCJrZXlDb2RlIiwibWFjcm8iLCJLRVkiLCJhIiwibGVmdCIsImQiLCJyaWdodCIsInRvdWNoTG9jIiwiZ2V0TG9jYXRpb24iLCJ4Iiwid2luU2l6ZSIsInN0YXJ0TW92ZUF0IiwicG9zIiwic2V0UG9zaXRpb24iLCJqdW1wQWN0aW9uIiwicnVuSnVtcEFjaXRvbiIsInR3ZWVuIiwidGhlbiIsInN0YXJ0IiwianVtcFVwIiwiYnkiLCJ5IiwiZWFzaW5nIiwianVtcERvd24iLCJzcXVhc2giLCJ0byIsInNjYWxlWCIsInNjYWxlWSIsInN0cmV0Y2giLCJzY2FsZUJhY2siLCJzZXF1ZW5jZSIsImNhbGwiLCJwbGF5SnVtcFNvdW5kIiwicmVwZWF0Rm9yZXZlciIsImF1ZGlvRW5naW5lIiwicGxheUVmZmVjdCIsImdldENlbnRlclBvcyIsImNlbnRlclBvcyIsInYyIiwiaGVpZ2h0IiwidXBkYXRlIiwiZHQiLCJNYXRoIiwiYWJzIiwib25EZXN0cm95Iiwib2ZmIl0sIm1h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QVYsR0FBYyxLQUFLekIsT0FBbkI7TUFDQSxLQUFLTCxNQUFMLEdBQWMsQ0FBZDtJQUNELENBSEQsTUFHTSxJQUFHLEtBQUtFLElBQUwsQ0FBVTRCLENBQVYsR0FBYyxLQUFLN0IsT0FBdEIsRUFBOEI7TUFDbEMsS0FBS0MsSUFBTCxDQUFVNEIsQ0FBVixHQUFjLEtBQUs3QixPQUFuQjtNQUNBLEtBQUtELE1BQUwsR0FBYyxDQUFkO0lBQ0Q7RUFDRixDQXpKSTtFQTJKTDtFQUNBaUUsU0E1SkssdUJBNEpNO0lBQ1RqRixFQUFFLENBQUN1QixXQUFILENBQWUyRCxHQUFmLENBQW1CbEYsRUFBRSxDQUFDeUIsV0FBSCxDQUFlQyxTQUFmLENBQXlCQyxRQUE1QyxFQUFxRCxLQUFLQyxTQUExRCxFQUFvRSxJQUFwRTtJQUNBNUIsRUFBRSxDQUFDdUIsV0FBSCxDQUFlMkQsR0FBZixDQUFtQmxGLEVBQUUsQ0FBQ3lCLFdBQUgsQ0FBZUMsU0FBZixDQUF5QkcsTUFBNUMsRUFBbUQsS0FBS0MsT0FBeEQsRUFBZ0UsSUFBaEU7RUFFRDtBQWhLSSxDQUFUIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyBMZWFybiBjYy5DbGFzczpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL2NsYXNzLmh0bWxcbi8vIExlYXJuIEF0dHJpYnV0ZTpcbi8vICAtIGh0dHBzOi8vZG9jcy5jb2Nvcy5jb20vY3JlYXRvci9tYW51YWwvZW4vc2NyaXB0aW5nL3JlZmVyZW5jZS9hdHRyaWJ1dGVzLmh0bWxcbi8vIExlYXJuIGxpZmUtY3ljbGUgY2FsbGJhY2tzOlxuLy8gIC0gaHR0cHM6Ly9kb2NzLmNvY29zLmNvbS9jcmVhdG9yL21hbnVhbC9lbi9zY3JpcHRpbmcvbGlmZS1jeWNsZS1jYWxsYmFja3MuaHRtbFxuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgLy/kuLvop5Lot7Pot4Ppq5jluqZcbiAgICAgIGp1bXBIZWlnaHQ6MCxcbiAgICAgIC8v5Li76KeS6Lez6LeD5oyB57ut5pe26Ze0XG4gICAgICBqdW1wRHVyYXRpb246MCxcbiAgICAgIC8v6L6F5Yqp5b2i5Y+Y5Yqo5L2c5pe26Ze0XG4gICAgICBzcXVhc2hEdXJhdGlvbjowLFxuICAgICAgLy/mnIDlpKfnp7vliqjpgJ/luqZcbiAgICAgIG1heE1vdmVTcGVlZDowLFxuICAgICAgLy/liqDpgJ/luqZcbiAgICAgIGFjY2VsOjAsXG4gICAgICAvL+i3s+i3g+mfs+aViOi1hOa6kFxuICAgICAganVtcEF1ZGlvOntcbiAgICAgICAgZGVmYXVsdDpudWxsLFxuICAgICAgICB0eXBlOmNjLkF1ZGlvQ2xpcFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQ6ZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgICAvL+WKoOmAn+W6puaWueWQkeW8gOWFs1xuICAgICAgdGhpcy5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICB0aGlzLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAvL+S4u+inkuW9k+WJjeawtOW5s+aWueWQkemAn+W6plxuICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgLy/pobXpnaLovrnnlYxcbiAgICAgIHRoaXMubWluUG9zWCA9IC0gdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yICsgdGhpcy5ub2RlLndpZHRoLzI7XG4gICAgICB0aGlzLm1heFBvc1ggPSB0aGlzLm5vZGUucGFyZW50LndpZHRoLzIgLSB0aGlzLm5vZGUud2lkdGgvMjtcbiAgICAgIC8v5Yid5aeL5YyW6ZSu55uY6L6T5YWl55uR5ZCsXG4gICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xuICAgIH0sXG5cbiAgICAvKioqKioqKioqKioqc2V0SW5wdXRDb250cm9sKCnlvIDlp4sqKioqKioqKioqKioqKiovXG4gICAgc2V0SW5wdXRDb250cm9sKCl7XG4gICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX0RPV04sdGhpcy5vbktleURvd24sdGhpcyk7XG4gICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX1VQLHRoaXMub25LZXlVcCx0aGlzKTtcblxuICAgICAgdGhpcy5ub2RlLnBhcmVudC5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9TVEFSVCx0aGlzLm9uVG91Y2hCZWdhbix0aGlzKTtcbiAgICAgIHRoaXMubm9kZS5wYXJlbnQub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELHRoaXMub25Ub3VjaEVuZGVkLHRoaXMpXG4gICAgfSxcblxuICAgIG9uS2V5RG93bihldmVudCl7XG4gICAgICBzd2l0Y2goZXZlbnQua2V5Q29kZSl7XG4gICAgICAgIGNhc2UgY2MubWFjcm8uS0VZLmE6XG4gICAgICAgIGNhc2UgY2MubWFjcm8uS0VZLmxlZnQ6XG4gICAgICAgICAgdGhpcy5hY2NMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkuZDpcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkucmlnaHQ6XG4gICAgICAgICAgdGhpcy5hY2NSaWdodCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbktleVVwKGV2ZW50KXtcbiAgICAgIHN3aXRjaChldmVudC5rZXlDb2RlKXtcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkuYTpcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkubGVmdDpcbiAgICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkuZDpcbiAgICAgICAgY2FzZSBjYy5tYWNyby5LRVkucmlnaHQ6XG4gICAgICAgICAgdGhpcy5hY2NSaWdodD0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9uVG91Y2hCZWdhbihldmVudCl7XG4gICAgICB2YXIgdG91Y2hMb2MgPSBldmVudC5nZXRMb2NhdGlvbigpO1xuICAgICAgaWYodG91Y2hMb2MueCA+PSBjYy53aW5TaXplLndpZHRoLzIpe1xuICAgICAgICB0aGlzLmFjY1JpZ2h0ID0gdHJ1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmFjY0xlZnQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgLy9kb24ndCBjYXB0dXJlIHRoZSBldmVudFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIG9uVG91Y2hFbmRlZChldmVudCl7XG4gICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgIHRoaXMuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKnNldElucHV0Q29udHJvbCgp57uT5p2fKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvKioqKioqKioqKioqIHN0YXJ0TW92ZUF0KCnlvIDlp4sqKioqKioqKioqKioqKiovXG4gICAgc3RhcnRNb3ZlQXQocG9zKXsgIC8vR2FtZS5qcy0tb25TdGFydEdhbWUoKeiwg+eUqFxuICAgICAgLy/lkK/nlKjor6XohJrmnKznu4Tku7ZcbiAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLm5vZGUuc2V0UG9zaXRpb24ocG9zKTtcbiAgICAgIHRoaXMueFNwZWVkID0gMDtcblxuICAgICAgdmFyIGp1bXBBY3Rpb24gPSB0aGlzLnJ1bkp1bXBBY2l0b24oKTtcbiAgICAgIGNjLnR3ZWVuKHRoaXMubm9kZSkudGhlbihqdW1wQWN0aW9uKS5zdGFydCgpO1xuICAgIH0sXG5cbiAgICBydW5KdW1wQWNpdG9uKCl7XG4gICAgICAvL+i3s+i3g+S4iuWNh1xuICAgICAgdmFyIGp1bXBVcCA9IGNjLnR3ZWVuKCkuYnkodGhpcy5qdW1wRHVyYXRpb24se3k6dGhpcy5qdW1wSGVpZ2h0fSx7ZWFzaW5nOidzaW5lT3V0J30pO1xuICAgICAgLy/kuIvokL1cbiAgICAgIHZhciBqdW1wRG93biA9IGNjLnR3ZWVuKCkuYnkodGhpcy5qdW1wRHVyYXRpb24se3k6LXRoaXMuanVtcEhlaWdodH0se2Vhc2luZzonc2luZUluJ30pO1xuICAgICAgLy/lvaLlj5hcbiAgICAgIHZhciBzcXVhc2ggPSBjYy50d2VlbigpLnRvKHRoaXMuc3F1YXNoRHVyYXRpb24se3NjYWxlWDogMSwgc2NhbGVZOiAwLjZ9KTsgLy/mjKTljotcbiAgICAgIHZhciBzdHJldGNoID0gY2MudHdlZW4oKS50byh0aGlzLnNxdWFzaER1cmF0aW9uLHtzY2FsZVg6IDEsIHNjYWxlWTogMS4yfSk7IC8v5Ly45bGVXG4gICAgICB2YXIgc2NhbGVCYWNrID1jYy50d2VlbigpLnRvKHRoaXMuc3F1YXNoRHVyYXRpb24se3NjYWxlWDogMSwgc2NhbGVZOiAxfSk7IC8v5aSN5Y6fXG4gICAgICAvL+WIm+W7uuS4gOS4que8k+WKqFxuICAgICAgdmFyIHR3ZWVuID0gY2MudHdlZW4oKVxuICAgICAgICAgICAgICAgICAgICAuc2VxdWVuY2Uoc3F1YXNoLHN0cmV0Y2gsanVtcFVwLHNjYWxlQmFjayxqdW1wRG93bilcbiAgICAgICAgICAgICAgICAgICAgLy/mt7vliqDkuIDkuKrlm57osIPlh73mlbDvvIzlnKjliY3pnaLnmoTliqjkvZzpg73nu5PmnZ/ml7bosIPnlKhwbGF5SnVtcFNvdW5kKCnmlrnms5VcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwodGhpcy5wbGF5SnVtcFNvdW5kLHRoaXMpO1xuICAgICAgcmV0dXJuIGNjLnR3ZWVuKCkucmVwZWF0Rm9yZXZlcih0d2Vlbik7XG4gICAgfSxcblxuICAgIHBsYXlKdW1wU291bmQoKXtcbiAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5qdW1wQXVkaW8sZmFsc2UpO1xuICAgIH0sXG4gICAgLyoqKioqKioqKioqKiBzdGFydE1vdmVBdCgp57uT5p2fKioqKioqKioqKioqKioqL1xuXG4gICAgZ2V0Q2VudGVyUG9zKCl7IC8vU3Rhci5qcy0tZ2V0UGxheWVyRGlzdGFuY2UoKeiwg+eUqFxuICAgICAgdmFyIGNlbnRlclBvcyA9IGNjLnYyKHRoaXMubm9kZS54LCB0aGlzLm5vZGUueSArIHRoaXMubm9kZS5oZWlnaHQvMik7XG4gICAgICByZXR1cm4gY2VudGVyUG9zO1xuICAgIH0sXG5cblxuICAgIHVwZGF0ZTpmdW5jdGlvbihkdCl7XG4gICAgXG4gICAgICAvL+agueaNruW9k+WJjeWKoOmAn+W6puaWueWQkeavj+W4p+abtOaWsOmAn+W6plxuICAgICAgaWYodGhpcy5hY2NMZWZ0KXtcbiAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCpkdDtcbiAgICAgIH1lbHNlIGlmKHRoaXMuYWNjUmlnaHQpe1xuICAgICAgICB0aGlzLnhTcGVlZCArPSB0aGlzLmFjY2VsKmR0O1xuICAgICAgfVxuXG4gICAgICAvL+mZkOWumuS4u+inkueahOmAn+W6puS4jeiDvei2hei/h+acgOWkp+WAvFxuICAgICAgaWYoTWF0aC5hYnModGhpcy54U3BlZWQpID4gdGhpcy5tYXhNb3ZlU3BlZWQpe1xuICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIC8v5qC55o2u5b2T5YmN6YCf5bqm5pu05paw5Li76KeS55qE5L2N572uXG4gICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCpkdDtcblxuICAgICAgLy/pmZDliLbkuLvop5LnmoTnp7vliqjkuI3og73otoXov4fop4bnqpfovrnnlYxcbiAgICAgIGlmKHRoaXMubm9kZS54ID4gdGhpcy5tYXhQb3NYKXtcbiAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm1heFBvc1g7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcbiAgICAgIH1lbHNlIGlmKHRoaXMubm9kZS54IDwgdGhpcy5taW5Qb3NYKXtcbiAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm1pblBvc1g7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/lj5bmtojplK7nm5jovpPlhaXnm5HlkKxcbiAgICBvbkRlc3Ryb3koKXtcbiAgICAgIGNjLnN5c3RlbUV2ZW50Lm9mZihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX0RPV04sdGhpcy5vbktleURvd24sdGhpcyk7XG4gICAgICBjYy5zeXN0ZW1FdmVudC5vZmYoY2MuU3lzdGVtRXZlbnQuRXZlbnRUeXBlLktFWV9VUCx0aGlzLm9uS2V5VXAsdGhpcyk7XG5cbiAgICB9XG4gICBcbn0pO1xuIl19
//------QC-SOURCE-SPLIT------
