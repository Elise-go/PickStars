
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