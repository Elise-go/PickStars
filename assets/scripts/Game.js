// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

        /*********菜单模块*********/
        playBtn:{
            default:null,
            type:cc.Node
        },
        againBtn:{
            default:null,
            type:cc.Node
        },
        gameOverNode:{
            default:null,
            type:cc.Node
        },
        rules:{
            default:null,
            type:cc.Node
        },


         /*********主角模块*********/
        //Player节点，用于获取主角弹跳高度，和控制主角行动开关
        player:{
            default:null,
            type:cc.Node
        },


        /*********星星模块*********/
        //引用星星的预制资源
        starPrefab:{
            default:null,
            type:cc.Prefab
        },
        //星星产生后消失时间的随机范围
        maxStarDuration:0,
        minStarDuration:0,
        //地面节点，用于确定星星生成的高度
        ground:{
            default:null,
            type:cc.Node
        },


        /*********分数模块*********/
        scoreNode:{
            default:null,
            type:cc.Node
        },
        scoreDisplay:{
            default:null,
            type:cc.Label
        },
        //引用分数效果的预制资源
        scoreFXPrefab:{
            default:null,
            type:cc.Prefab
        },
        scoreAudio:{
            default:null,
            type:cc.AudioClip
          }

    },

    onLoad:function(){

        //设置游戏页面状态 (Playing or show menu)
        this.isPlaying = false;

        //初始化计时器
        this.timer = 0;
        this.starDuration =0;

        //initialize star and score pool
        this.starPool = new cc.NodePool('Star');
        this.scorePool = new cc.NodePool('ScoreAnim');

        // 保存当前星星节点以便销毁
        this.currentStar = null;

         //获取地平面的y轴坐标
         this.groundY = this.ground.y + this.ground.height/2;
    
    },

    /************onStartGame()开始***************/
    onStartGame(){  //Button组件 Click Events属性设置

        this.isPlaying = true;
        
        if(this.playBtn.isValid){
            this.playBtn.destroy();
        }

        if(this.rules.isValid){
            this.rules.destroy();
        }

        if(!this.scoreNode.active){
            this.scoreNode.active = true;
        }

        this.againBtn.active = false;
        this.gameOverNode.active = false;

        //重置玩家位置和移动速度
        this.player.getComponent('Player').startMoveAt(cc.v2(0,this.groundY));

        //生成星星
        this.spawnNewStar();

        // 重置计分
        this.resetScore();

    },

    spawnNewStar(){  

       var newStar = null; //node节点
       if(this.starPool.size() > 0 ){
        newStar = this.starPool.get(this);
       }else{
        newStar = cc.instantiate(this.starPrefab);
       }

        //将新增节点添加到Canvas节点下面
        this.node.addChild(newStar);
        //为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition(newStar));
        // pasee Game instance to Star
        newStar.getComponent('Star').init(this);
        //给星星设置计时器
        this.startTimer();

        this.currentStar = newStar;  
    },
    getNewStarPosition(starNode){  //spawnNewStar()调用
        var randY = this.groundY + Math.random()*this.player.getComponent('Player').jumpHeight + 50;
        var maxX = this.node.width/2 - starNode.width/2;
        var randX = (Math.random()-0.5)*2*maxX;
        return cc.v2(randX,randY);
    },
    startTimer(){ //spawnNewStar()调用
        this.starDuration = this.minStarDuration + Math.random()*(this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    resetScore(){  
        this.score = 0;
        this.scoreDisplay.string = 'Score: 0';
    },

    /************onStartGame()结束***************/


    gainScore(pos){  //Star.js--onPicked()调用
        this.score += 1;
        //更新 scoreDisplay Label的文字
        this.scoreDisplay.string = 'Score: '+ this.score;
        //播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio,false);
        //播放特效
        var fx = this.spawnScoreFX();
        this.node.addChild(fx);
        fx.setPosition(pos);
        fx.getComponent(cc.Animation).play('score_pop');

    },

    spawnScoreFX(){
        var fx;
        if(this.scorePool.size()>0){
            fx = this.scorePool.get(this);
        }else{
            fx = cc.instantiate(this.scoreFXPrefab);
            fx.getComponent('ScoreAnim').init(this);
        }
        return fx;
    },

    despawnScoreFX(scoreFX){  //作为动画播放最后一帧的回调函数
        this.scorePool.put(scoreFX);
    },


    despawnStar(star){  //Star.js--onPicked()调用
        this.starPool.put(star);
        this.spawnNewStar();
    },
    
    update:function(dt){
        //若isPlaying==false,则往下代码不会执行，直接退出update
        if(!this.isPlaying) return;

        //每帧更新计时器，超时还未生成新的星星就会调用游戏失败逻辑
        if(this.timer > this.starDuration){
            this.gameOver();
            return;
        }

        this.timer += dt;
    },

    gameOver(){
        this.isPlaying = false;

        this.againBtn.active = true;
        this.gameOverNode.active = true;

        this.player.getComponent('Player').enabled = false;
        this.player.stopAllActions();
       
        this.currentStar.destroy();
        
    }


});
