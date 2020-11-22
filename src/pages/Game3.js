import React, { Component } from 'react';
import beijing from "@/img/beijing3.png";
import spider from "@/img/spider.gif";
import beeMine from "@/img/beeMine3.png";
import mosquitoesMine from "@/img/mosquitoesMine3.png";
import spiderNet from "@/img/wang.png";
import {Input,Modal,message} from "antd";
import global from "@/global";
import "@/css/Demo3.less";
// document.body.style.background = "#999999";

//屏幕宽度
let window_innerWidth=window.innerWidth;
//屏幕高度
let window_innerHeight=window.innerHeight;
//屏幕宽度/20
let boxWidth=window_innerWidth/20;
//屏幕高度/20
let boxHeight=window_innerHeight/20;
//单位大小
let boxLen=boxWidth<boxHeight?boxWidth:boxHeight;

//禁止下拉
document.addEventListener('touchmove', function (event) {
    event.preventDefault();
}, false);

export default class Game3 extends Component {
    ws =null;//websocket
    state = {
        num:0,//周围地雷数量
        key:true,//key=true允许向服务器发送键盘信息,减少
        text:[],//聊天框
        win:false,//胜利者无限移动
        winner:"",//胜利者的名字
        name:"",//用户名
        username:"",//输入的username
        password:"",//输入的password
        visible:false,//登陆Model是否显示
        msg:"",//发言Input输入框
        x:5,//主角X轴
        y:5,//主角Y轴
        step:"1",//轮到的玩家
        seat:0,//自己的位置
        seat1:{//玩家1的信息
            username:"",//用户名
            status:0//0未准备1已准备
        },
        seat2:{//玩家2的信息
            username:"",//用户名
            status:0//0未准备1已准备
        },
        map:[//地图
            [1,0,1,0,2,0,1,0,2,0,1],
            [0,0,2,0,2,0,1,0,2,0,1],
            [0,0,1,0,0,0,0,0,1,0,1],
            [0,0,1,0,2,0,1,0,2,0,0],
            [0,1,1,0,2,0,1,0,2,0,1],
            [0,0,0,0,0,0,0,0,2,0,0],
            [0,0,1,0,2,0,0,0,0,0,1],
            [1,0,1,0,0,0,1,0,2,1,1],
            [0,0,0,0,0,0,1,0,2,0,1],
            [0,0,1,0,0,0,1,0,0,0,0],
            [0,1,1,0,2,0,1,0,2,0,1]
        ],
    };
    componentDidMount(){
        //键盘监听
        document.addEventListener("keydown", this.onKeyDown);
        //禁止选中
        document.oncontextmenu = function(){
            return false;
        };
        document.onselectstart= function(){
            return false;
        };
        document.onmousewheel= function(){
            return false;
        };
        //禁止滚动
        document.body.style.cssText="overflow-x: hidden;overflow-y: hidden;"+document.body.style.cssText;
    }
    componentWillUnmount(){
        // 组件销毁时你要执行的代码
        this.userExit();
        //键盘监听结束
        document.removeEventListener("keydown",this.onKeyDown);
    }
    /**
     * 键盘按下时触发
     * @param e
     */
    onKeyDown = (e) => {
        console.log(e.keyCode);
        if(this.ws){
            if(this.state.key) {
                if(this.state.win===true){
                    this.ws.send("winM"+e.keyCode);
                }else if(this.state.seat+""===this.state.step){
                    this.setState({
                        key:false
                    },()=>{
                        this.ws.send("move"+e.keyCode)
                    })
                }
            }
        }else {
            let map=this.state.map;
            map[this.state.y][this.state.x]=-1;
            this.setState({
                map:map
            });
            switch( e.keyCode) {
                case 37:
                    if(this.state.x>0){
                        this.setState({
                            x:this.state.x-1,
                        });
                    }
                    break;
                case 39:
                    if(this.state.x<10){
                        this.setState({
                            x:this.state.x+1,
                        });
                    }
                    break;
                case 38:
                    if(this.state.y>0){
                        this.setState({
                            y:this.state.y-1,
                        });
                    }
                    break;
                case 40:
                    if(this.state.y<10){
                        this.setState({
                            y:this.state.y+1,
                        });
                    }
                    break;
                default:
                    break
            }
        }
    };
    /**
     * 走下一步交换行动权
     */
    step=()=>{
        if(this.state.step==="1"){
            this.setState({
                step:"2",
            })
        }else {
            this.setState({
                step:"1",
            })
        }
    };
    /**
     * 检查下一步是否被蛛网挡住
     * @param x
     * @param y
     * @returns {boolean}
     */
    checkNet=(x,y)=>{

        if(this.state.map[y][x]<0){
            if(this.state.seat+""===this.state.step){
                message.warn("被蛛网封住了");
            }
            return true;
        }else {
            return false;
        }
    };
    /**
     * 找找周围地雷数量
     * @param x
     * @param y
     */
    checkNum=(x,y)=>{
        let num=0;
        num+=y===10||this.state.map[y+1][x]<=0?0:1;
        num+=y===0||this.state.map[y-1][x]<=0?0:1;
        num+=x===0||this.state.map[y][x-1]<=0?0:1;
        num+=x===10||this.state.map[y][x+1]<=0?0:1;
        num+=y===10||x===0||this.state.map[y+1][x-1]<=0?0:1;
        num+=y===0||x===10||this.state.map[y-1][x+1]<=0?0:1;
        num+=x===0||y===0||this.state.map[y-1][x-1]<=0?0:1;
        num+=x===10||y===10||this.state.map[y+1][x+1]<=0?0:1;
        this.setState({
            num:num
        })
    };
    /**
     * 检测该位置的移动结果，游戏是否结束
     * @param x
     * @param y
     * @returns {boolean}
     */
    checkStep=(x,y)=>{
        //上下左右是否是蛛网
        let bottom=y===10||this.state.map[y+1][x]<0;
        let top=y===0||this.state.map[y-1][x]<0;
        let left=x===0||this.state.map[y][x-1]<0;
        let right=x===10||this.state.map[y][x+1]<0;
        let msg;
        let text=this.state.text;
        if(this.state.map[y][x]>0){//走的这一步>0是地雷
            switch (this.state.step) {
                case "2":
                    msg="游戏结束！玩家："+this.state.seat2.username+"获胜！";
                    text.unshift(<div style={{color:"#8A2BE2"}}>{msg}</div>);
                    this.setState({
                        winner:this.state.seat2.username,
                        seat1:{
                            username:"",
                            status:0
                        },
                        seat:this.state.seat===1?0:this.state.seat,
                        win:this.state.name===this.state.seat2.username,
                        text:text
                    });
                    message.success(msg);
                    return true;
                case "1":
                    msg="游戏结束！玩家："+this.state.seat1.username+"获胜！";
                    // msg=<div style={{color:"red"}}>{"游戏结束！玩家："+this.state.seat1.username+"获胜！"}</div>;
                    text.unshift(<div style={{color:"#8A2BE2"}}>{msg}</div>);
                    this.setState({
                        winner:this.state.seat1.username,
                        seat2:{
                            username:"",
                            status:0
                        },
                        seat:this.state.seat===2?0:this.state.seat,
                        win:this.state.name===this.state.seat1.username,
                        text:text
                    });
                    message.success(msg);
                    return true;
                default:
                    return false;
            }
        }else if(bottom&&left&&top&&right){//四周都是蛛网
            switch (this.state.step) {
                case "1":
                    msg="游戏结束！玩家："+this.state.seat2.username+"获胜！";
                    text.unshift(<div style={{color:"#8A2BE2"}}>{msg}</div>);
                    this.setState({
                        winner:this.state.seat2.username,
                        seat1:{
                            username:"",
                            status:0
                        },
                        seat:this.state.seat===1?0:this.state.seat,
                        win:this.state.name===this.state.seat2.username,
                        text:text
                    });
                    message.success(msg);
                    return true;
                case "2":
                    msg="游戏结束！玩家："+this.state.seat1.username+"获胜！";
                    text.unshift(<div style={{color:"#8A2BE2"}}>{msg}</div>);
                    this.setState({
                        winner:this.state.seat1.username,
                        seat2:{
                            username:"",
                            status:0
                        },
                        seat:this.state.seat===2?0:this.state.seat,
                        win:this.state.name===this.state.seat1.username,
                        text:text
                    });
                    message.success(msg);
                    return true;
                default:
                    return false;
            }
        }
    };
    /**
     * 刷新地图
     */
    mapStart=()=>{
        let map=[];
        let i,j;
        //随机生成地图
        for(i=0;i<11;i++){
            let list=[];
            for(j=0;j<11;j++){
                let n=Math.random()*100;
                if(n<5){
                    list.push(2);
                }else if(n<10){
                    list.push(1);
                }else {
                    list.push(0);
                }
            }
            map.push(list);
        }
        //如果ws已经建立，向服务器发送更新后的地图
        if(this.ws){
            let seat1=this.state.seat1;
            let seat2=this.state.seat2;
            seat1.status=0;
            seat2.status=0;
            this.ws.send("map0"+JSON.stringify({
                x:5,
                y:5,
                map:map,
                seat1:seat1,
                seat2:seat2,
                step:"1",
                again:true
            }));
        }
    };
    /**
     * 胜利者自由移动
     * @param keyCode
     */
    winnerMove=(keyCode)=>{
        let map=this.state.map;
        let y=this.state.y;
        let x=this.state.x;
        map[y][x]=-1;
        this.setState({
            map:map,
            key:true
        });
        switch(keyCode) {
            case "37":
                if(x>0){
                    this.setState({
                        x:x-1,
                    });
                    this.checkNum(x-1,y);
                }
                break;
            case "39":
                if(x<10){
                    this.setState({
                        x:x+1,
                    });
                    this.checkNum(x+1,y);
                }
                break;
            case "38":
                if(y>0){
                    this.setState({
                        y:y-1,
                    });
                    this.checkNum(x,y-1);
                }
                break;
            case "40":
                if(y<10){
                    this.setState({
                        y:y+1,
                    });
                    this.checkNum(x,y+1);
                }
                break;
            default:
                break
        }
    };
    /**
     * 角色移动
     * @param keyCode
     */
    userMove=(keyCode)=>{
        console.log(keyCode);
        let map=this.state.map;
        let y=this.state.y;
        let x=this.state.x;
        map[y][x]=-1;
        this.setState({
            map:map,
            key:true
        });
        switch(keyCode) {
            case "37":
                if(x>0){
                    if(this.checkNet(x-1,y)){
                        return ;
                    }else {
                        this.step();
                        this.checkStep(x-1,y);
                        this.setState({
                            x:this.state.x-1,
                        });
                        this.checkNum(x-1,y);
                    }
                }
                break;
            case "39":
                if(x<10){
                    if(this.checkNet(x+1,y)){
                        return ;
                    }else {
                        this.step();
                        this.checkStep(x+1,y);
                        this.setState({
                            x:x+1,
                        });
                        this.checkNum(x+1,y);
                    }
                }
                break;
            case "38":
                if(y>0){
                    if(this.checkNet(x,y-1)){
                        return ;
                    }else {
                        this.step();
                        this.checkStep(x,y-1);
                        // if(this.checkStep(x,y-1)){
                        //     return ;
                        // }
                        this.setState({
                            y:y-1,
                        });
                        this.checkNum(x,y-1);
                    }
                }
                break;
            case "40":
                if(y<10){
                    if(this.checkNet(x,y+1)){
                        return ;
                    }else {
                        this.step();
                        this.checkStep(x,y+1);
                        this.setState({
                            y:y+1,
                        });
                        this.checkNum(x,y+1);
                    }
                }
                break;
            default:
                break;
        }
    };
    /**
     *显示登陆Model
     */
    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    /**
     * 登陆并且隐藏登陆Model
     * @param e
     */
    handleOk = (e) => {
        console.log(e);
        this.login();
        this.setState({
            visible: false,
        });
    };
    /**
     * 隐藏登陆Model
     * @param e
     */
    handleCancel = (e) => {
        console.log("退出",e);
        this.setState({
            visible: false,
        });
    };
    /**
     * 登陆接口
     */
    login=()=>{
        const url=global.localhostUrl+"user/login";
        fetch(url, {
            method: "POST",
            mode: "cors",
            credentials:"include",//跨域携带cookie
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
                username:this.state.username,
                password:this.state.password,
            }),
        }).then(function (res) {//function (res) {} 和 res => {}效果一致
            return res.json()
        }).then(json => {
            // get result
            const data = json;
            console.log(data);
            if(data.status){
                message.success(data.message);
                this.setState({
                    name:data.data.username,
                })
            }else {
                message.error(data.message);
            }
        }).catch(function () {
            console.log("fetch fail");
            // alert('系统错误');
        });
    };
    /**
     * Input框，用户名修改函数
     * @param e
     */
    usernameChange=(e)=>{
        this.setState({
            username:e.target.value,
        })
    };
    /**
     * Input框，密码修改函数
     * @param e
     */
    passwordChange=(e)=>{
        this.setState({
            password:e.target.value
        })
    };
    /**
     * 进入房间
     * @returns {null}
     */
    userJoin=()=>{
        if(this.ws){
        }else {
            let username=this.state.name;
            if(username===''){
                alert('请先登陆');
                return null;
            }
            let urlPrefix =global.wsHostUrl+'game3/';
            let url = urlPrefix + username;
            let self=this;
            this.ws = new WebSocket(url);
            this.ws.onopen = function () {
                console.log("建立 websocket 连接...");
                self.userSetAll();
            };
            this.ws.onmessage = function(event){
                //服务端发送的消息
                console.log(event);
                let info=event.data;
                let type=event.data.substring(0,4);
                let data=info.slice(4);
                console.log(type);
                let text;
                switch (type) {
                    case "data":
                        break;
                    case "winM":
                        self.winnerMove(data);
                        break;
                    case "move":
                        self.userMove(data);
                        break;
                    case "msg0":
                        // message.success(data);
                        text=self.state.text;
                        text.unshift(data);
                        self.setState({
                            text:text
                        });
                        break;
                    case "ok01":
                        self.setState({
                            seat1:JSON.parse(data).seat
                        });
                        break;
                    case "ok02":
                        self.setState({
                            seat2:JSON.parse(data).seat
                        });
                        break;
                    case "map0":
                        let data1=JSON.parse(data);
                        self.setState({
                            x:data1.x+0,
                            y:data1.y+0,
                            map:data1.map,
                            seat1:data1.seat1,
                            seat2:data1.seat2,
                            step:data1.step
                        },()=>{
                            if(data1.again){
                                self.checkNum(5,5);
                                self.setState({
                                    win:false
                                })
                            }
                        });
                        // self.moveToMouseSLOther(JSON.parse(data).endY,JSON.parse(data).endX);
                        break;
                    case "seta":
                        self.flashRoom();
                        // self.moveToMouseSLOther(JSON.parse(data).endY,JSON.parse(data).endX);
                        break;
                    case "out1":
                        if(self.state.seat1.username===data){
                            self.setState({
                                seat1:{
                                    username: "",
                                    status:0
                                }
                            })
                        }else if(self.state.seat2.username===data){
                            self.setState({
                                seat2:{
                                    username: "",
                                    status:0
                                }
                            })
                        }
                        console.log("delete",data);
                        break;
                    default:
                        // message.success(data);
                        text=self.state.text;
                        text.unshift(data);
                        self.setState({
                            text:text
                        });
                }
            };
            this.ws.onclose = function(){
                console.log('用户['+username+'] 已经离开房间!');
                console.log("关闭 websocket 连接...");
            }
        }

    };

    /**
     * 向服务端发送消息
     */
    userSend=()=>{
        this.setState({
            msg:""
        });
        if(this.ws){
            if(this.state.msg!==""){
                this.ws.send("msg0"+this.state.name+":"+this.state.msg);
            }
        }
    };
    /**
     * 地图同步至自己
     */
    flashRoom0=()=>{
        if(this.ws){
            let state = this.state;
            this.ws.send("map0"+JSON.stringify({
                x:state.x,
                y:state.y,
                map:state.map,
                seat1:state.seat1,
                seat2:state.seat2,
                step:state.step
            }));
        }
    };
    /**
     * 地图同步至位置上的人
     */
    flashRoom=()=>{
        if(this.state.seat===1||(this.state.seat1.username===""&&this.state.seat===2)) {
            this.flashRoom0();
        }
    };
    /**
     * 发送广播同步信号
     */
    userSetAll=()=>{
        if(this.ws){
            this.ws.send("seta");
        }
    };
    /**
     * 退出房间
     */
    userExit= () => {
        if (this.ws) {
            this.ws.close();
            this.ws=null;
            this.setState({
                seat2:{
                    username: "",
                    status:0
                },
                seat1:{
                    username: "",
                    status:0
                },
                seat:0
            })
        }
    };
    /**
     * 根据主角位置以及地图数组情况显示地图上的图片
     * @param value
     * @param x
     * @param y
     */
    getImg=(value,x,y)=>{
        if(this.state.x===x&&this.state.y===y){
            return spider;
        }
        if(value===this.state.seat&&this.state.seat!==0){
            return beijing;
        }
        switch (value) {
            case 0:
                return beijing;
            case 1:
                return mosquitoesMine;
            case 2:
                return beeMine;
            case -1:
                return spiderNet;
            default:
                return beijing;
        }
    };
    /**
     * 加入位置1
     */
    join1=()=>{
        if(this.state.name===""){
            message.error("请先登录");
        }else if (this.state.seat1.username!==""){
            message.error("位置上有人咯");
        }else if(this.state.seat!==2){
            if(this.ws){
                let state = this.state;
                this.ws.send("map0"+JSON.stringify({
                    x:state.x,
                    y:state.y,
                    map:state.map,
                    seat1:{
                        username:this.state.name,
                        status:0
                    },
                    seat2:state.seat2,
                    step:this.state.step
                }));
            }
            this.setState({
                seat:1,
                win:false,
            })

        }else {
            if(this.ws){
                let state = this.state;
                this.ws.send("map0"+JSON.stringify({
                    x:state.x,
                    y:state.y,
                    map:state.map,
                    seat2:{
                        username:"",
                        status:0
                    },
                    seat1:{
                        username:this.state.name,
                        status:0
                    },
                    step:this.state.step
                }));
            }
            this.setState({
                seat:1,
                win:false,
            })
        }
    };
    /**
     * 加入位置2
     */
    join2=()=>{
        if(this.state.name===""){
            message.error("请先登录");
        }else if (this.state.seat2.username!==""){
            message.error("位置上有人咯");
        }else if(this.state.seat!==1){
            if(this.ws){
                let state = this.state;
                this.ws.send("map0"+JSON.stringify({
                    x:state.x,
                    y:state.y,
                    map:state.map,
                    seat1:state.seat1,
                    seat2:{
                        username:this.state.name,
                        status:0
                    },
                    step:this.state.step
                }));
            }
            this.setState({
                seat:2,
                win:false,
            })
        }else {
            if(this.ws){
                let state = this.state;
                this.ws.send("map0"+JSON.stringify({
                    x:state.x,
                    y:state.y,
                    map:state.map,
                    seat1:{
                        username:"",
                        status:0
                    },
                    seat2:{
                        username:this.state.name,
                        status:0
                    },
                    step:this.state.step
                }));
            }
            this.setState({
                seat:2,
                win:false,
            })
        }
    };
    /**
     * 准备
     */
    ready=()=>{
        let seat;
        switch (this.state.seat) {
            case 1:

                seat=this.state.seat1;
                if(seat.status===1){
                    return;
                }else if(this.state.seat2.status===1){
                    this.mapStart();
                    return;
                }
                seat.status=1;
                if(this.ws){
                    this.ws.send("ok01"+JSON.stringify({
                        seat:seat
                    }));
                }
                break;
            case 2:
                seat=this.state.seat2;
                if(seat.status===1){
                    return;
                }else if(this.state.seat1.status===1){
                    this.mapStart();
                    return;
                }
                seat.status=1;
                if(this.ws){
                    this.ws.send("ok02"+JSON.stringify({
                        seat:seat
                    }));
                }
                break;
            default:
                return;
        }
    };
    render() {
        let getImg=this.getImg;
        let readyNum=this.state.seat1.status+this.state.seat2.status;
        return (
            <div className={"demo3"}>
                <button onClick={this.userJoin}>进入房间</button>
                <button onClick={this.userExit}>离开房间</button>
                <button onClick={this.showModal}>{this.state.name===""?"登录":this.state.name}</button>
                <br/>
                <div style={{fontSize:20}}>Winner:{this.state.winner}</div>
                <div>游戏规则:用键盘⬆️⬇️⬅️➡️控制小蜘蛛，不要撞到炸弹(死亡)或者被蛛网围住(对手死亡)️</div>
                <div>双方玩家各自只能看到一半的地雷</div>️
                <button onClick={this.join1}>{this.state.step==="1"?"😊":""}{this.state.seat1.username===""?"空座位1":this.state.seat1.username}</button>
                <button onClick={this.ready}>准备{readyNum}/2</button>
                <button onClick={this.join2}>{this.state.seat2.username===""?"空座位2":this.state.seat2.username}{this.state.step==="2"?"😊":""}</button>
                <Modal
                    title="登录"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    okText={"登录/注册"}
                    onCancel={this.handleCancel}
                    cancelText={"返回"}
                >
                    <Input placeholder="username" value={this.state.username} onChange={this.usernameChange} />
                    <br/>
                    <br/>
                    <Input type="password" placeholder="password" value={this.state.password} onChange={this.passwordChange}/>
                </Modal>
                <div style={{fontSize:20}}>周围地雷数量:{this.state.num}</div>
                {
                    this.state.map.map((list,y)=>{
                        return <div
                            key={y}
                            style={{
                                textAlign:"center",
                                height:boxLen
                            }}
                        >
                            {
                                list.map((value, x)=>{
                                    return <img
                                        alt={"gelumu"}
                                        src={
                                            getImg(value,x,y)
                                        }
                                        // src={x!==this.state.x||y!==this.state.y?value!==0?value===this.state.seat?mosquitoDash:mosquitoFly:monster:fly}
                                        key={x}
                                        width={boxLen}
                                        height={boxLen}
                                        style={{
                                            borderRight:"1px solid #333",
                                            borderBottom:"1px solid #333"
                                        }}
                                    />
                                })
                            }
                        </div>
                    })
                }
                <br/>
                <Input
                    value={this.state.msg}
                    onChange={(e)=>{
                        this.setState({
                            msg:e.target.value,
                        })
                    }}
                    onPressEnter={this.userSend}
                    style={{
                        // left:window_innerWidth-400,
                        // height:24,
                        width:200,
                        // top:50,
                        // position:"absolute",
                    }}
                />

                <button
                    onClick={this.userSend}
                    style={{
                        // left:window_innerWidth-200,
                        // height:24,
                        // top:50,
                        // position:"absolute",
                    }}
                >
                    发言
                </button>
                <br/>
                <div
                    style={{
                        top:50,
                        overflowY:"scroll",
                        width:6*boxLen,
                        height:16*boxLen,
                        position:"absolute",
                    }}
                >
                    {this.state.text.map((value, index)=>{
                        return <div
                            style={{
                                textAlign:"left"
                            }}
                            key={index}
                        >
                            {value}
                        </div>
                    })}
                </div>
                <br/>
                {window_innerHeight>window_innerWidth?<div>
                    <button
                        style={{width:boxLen*2,height:boxLen*2}}
                        onClick={()=>{
                            this.onKeyDown({keyCode:38})
                        }}
                    >
                        上
                    </button>
                    <br/>
                    <button
                        style={{width:boxLen*2,height:boxLen*2,marginRight:boxLen*2}}
                        onClick={()=>{
                            this.onKeyDown({keyCode:37})
                        }}
                    >
                        左
                        ️</button>
                    <button
                        style={{width:boxLen*2,height:boxLen*2}}
                        onClick={()=>{
                            this.onKeyDown({keyCode:39})
                        }}
                    >
                        右
                    </button>
                    <br/>
                    <button
                        style={{width:boxLen*2,height:boxLen*2}}
                        onClick={()=>{
                            this.onKeyDown({keyCode:40})
                        }}
                    >
                        下
                    ️</button>
                </div>:""}


            </div>
        );
    }
}
const quickSort = (array) => {
    const sort = (arr, left = 0, right = arr.length - 1) => {
        if (left >= right) {//如果左边的索引大于等于右边的索引说明整理完毕
            return
        }
        let i = left
        let j = right
        const baseVal = arr[j] // 取无序数组最后一个数为基准值
        while (i < j) {//把所有比基准值小的数放在左边大的数放在右边
            while (i < j && arr[i] <= baseVal) { //找到一个比基准值大的数交换
                i++
            }
            arr[j] = arr[i] // 将较大的值放在右边如果没有比基准值大的数就是将自己赋值给自己（i 等于 j）
            while (j > i && arr[j] >= baseVal) { //找到一个比基准值小的数交换
                j--
            }
            arr[i] = arr[j] // 将较小的值放在左边如果没有找到比基准值小的数就是将自己赋值给自己（i 等于 j）
        }
        arr[j] = baseVal // 将基准值放至中央位置完成一次循环（这时候 j 等于 i ）
        sort(arr, left, j-1) // 将左边的无序数组重复上面的操作
        sort(arr, j+1, right) // 将右边的无序数组重复上面的操作
    }
    const newArr = array.concat() // 为了保证这个函数是纯函数拷贝一次数组
    sort(newArr)
    return newArr
}

