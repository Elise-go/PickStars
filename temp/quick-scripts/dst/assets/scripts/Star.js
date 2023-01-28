
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