import React, { Component } from 'react';
import fly from "@/img/feixing.gif";
import fly_gif from "@/img/shanxian-export.gif";
import fly_die from "@/img/fly-die-small.png";
import {Input,Modal,message} from "antd";
import global from "@/global";
import Fly from "@/pages/box/Fly";
import "@/css/Demo3.less";

// document.body.style.background = "#999999";

let window_innerWidth=window.innerWidth;
let window_innerHeight=window.innerHeight;
let flyList=new Map();
let timeList=new Map();

let mainFly = window_innerHeight>450?window.innerWidth>450?
    new Fly(parseInt(window_innerWidth/32), parseInt(window_innerHeight/24), 100, 100, 4, 0, 0):
    new Fly(parseInt(window_innerWidth/12), parseInt(window_innerHeight/16), 100, 100, 4, 0, 0):
    new Fly(parseInt(window_innerWidth/16), parseInt(window_innerHeight/12), 100, 100, 4, 0, 0);

//屏幕大小适配
window.requestAnimationFrame(
    ()=> {
        if (window_innerWidth !== window.innerWidth || window_innerHeight !== window_innerHeight) {
            window_innerWidth=window.innerWidth;
            window_innerHeight=window.innerHeight;
            if(window_innerWidth>450){
                if(window_innerHeight<450){
                    mainFly = new Fly(parseInt(window_innerWidth/16), parseInt(window_innerHeight/12), mainFly.left, mainFly.top, 4, 0, 0);

                }else {mainFly = new Fly(parseInt(window_innerWidth/32), parseInt(window_innerHeight/24), mainFly.left, mainFly.top, 4, 0, 0);
                }
            }else {
                mainFly = new Fly(parseInt(window_innerWidth/12), parseInt(window_innerHeight/16), mainFly.left, mainFly.top, 4, 0, 0);
            }
        }
    }
);

//禁止下拉
document.addEventListener('touchmove', function (event) {
    event.preventDefault();
}, false);

export default class Game2 extends Component {
     radius=(dx,dy)=> {
         return Math.sqrt(Math.pow(dy,2)+Math.pow(dx,2));
    };
    draw=()=>{
        this.setState({});
        this.myReq=window.requestAnimationFrame(()=>{
            this.draw();
        })
    };
    componentDidMount(){
        this.myReq=window.requestAnimationFrame(()=>{
            this.draw();
        });
        //键盘监听
        document.addEventListener("keydown", this.onKeyDown);
        //鼠标移动
        document.onmousemove=(e)=>{
            this.onMouseMove(e)
        };
        //鼠标按下
        document.onmousedown=()=>{
            this.moveToMouseSL(this.state.clientY,this.state.clientX);
            clearInterval(this.mouse_timer);
            this.mouse_timer = setInterval(() => {
                this.moveToMouseSL(this.state.clientY,this.state.clientX);
                }, 100)
        };
        //鼠标抬起
        document.onmouseup=()=>{
            clearInterval(this.mouse_timer);
            // this.moveToMouseSL();
            this.moveToMouseSL(this.state.clientY,this.state.clientX);

        };
        document.ontouchmove=(e)=>{
            this.onTouchMove(e);
            // this.moveToMouseSL();
            this.moveToMouseSL(this.state.clientY,this.state.clientX);

        };
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
        document.removeEventListener("keydown", this.onKeyDown);
        clearInterval(this.timer1);
        timeList.forEach(value => {
            clearInterval(value)
        });
        clearInterval(this.mouse_timer);
        window.cancelAnimationFrame(this.myReq);
    }

    //缓慢移动到鼠标位置
    moveToMouseSL=(endY,endX)=>{
        if(this.ws){
            // this.userSet(this.state.name,mainFly);
            this.userMove(this.state.name,endY,endX);
        }else {
            clearInterval(this.timer1);
            //计时器
            let thisY=mainFly.top;
            let thisX=mainFly.left;
            let len2=Math.pow(endY-thisY,2)+Math.pow(endX-thisX,2);
            let len=Math.sqrt(len2);
            let t=len/mainFly.v;
            let moveY=(endY-thisY)/t;
            let moveX=(endX-thisX)/t;
            if(moveX<0){
                mainFly.turnWay=180
            }else{
                mainFly.turnWay=0
            }
            this.timer1 = setInterval(() => {
                //console.log(t)//输出移动时间
                if(t<0){
                    clearInterval(this.timer1);
                }
                mainFly.top=mainFly.top+moveY;
                mainFly.left=mainFly.left+moveX;
                t--;
            }, 10)
        }

    };
    //其他人操控
    moveToMouseSLOther=(username,endY,endX)=>{
        let timer=timeList.get(username);
        clearInterval(timer);
        //计时器
        console.log(flyList);
        let mainFly2=flyList.get(username);
        let thisY=mainFly2.top;
        let thisX=mainFly2.left;
        let len2=Math.pow(endY-thisY,2)+Math.pow(endX-thisX,2);
        let len=Math.sqrt(len2);
        let t=len/mainFly2.v;
        let moveY=(endY-thisY)/t;
        let moveX=(endX-thisX)/t;
        if(moveX<0){
            mainFly2.turnWay=180
        }else{
            mainFly2.turnWay=0
        }
        timeList.set(username,setInterval(() => {
            // console.log(t)//输出移动时间
            if(t<0){
                clearInterval(timeList.get(username));
            }
            mainFly2.top=mainFly2.top+moveY;
            mainFly2.left=mainFly2.left+moveX;
            flyList.set(username,mainFly2);
            t--;
        }, 10))

    };
    // //移动到鼠标位置
    // moveToMouse=()=>{
    //     this.setState({
    //         top:this.state.clientY,
    //         left:this.state.clientX,
    //     })
    // };
    //鼠标移动时监听鼠标坐标
    onMouseMove=(e)=>{
        //console.log(e)
        this.setState({
            clientX:e.clientX,
            clientY:e.clientY,
        })
    };
    //鼠标移动时监听鼠标坐标
    onTouchMove=(e)=>{
        console.log(e.changedTouches[0]);
        this.setState({
            clientX:e.changedTouches[0].clientX,
            clientY:e.changedTouches[0].clientY,
        })
    };

    state = {
        name:"",
        userId:"",
        username:"",
        password:"",
        visible:false,
        scoreList:[],
        f_time:10,
        //鼠标位置
        clientX:100,
        clientY:100,
        //时间和计时器开关
        time: 0,
        score:0,
        on: false,
        log: [],
        //是否撞到障碍物
        touch:false,
        msg:"ha",

    };
    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = (e) => {
        console.log(e);
        this.login();
        this.setState({
            visible: false,
        });
    };
    handleCancel = (e) => {
        console.log("退出",e);
        this.setState({
            visible: false,
        });
    };
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
                if(this.state.name===""||this.state.name===data.data.username){
                    //什么事都没发生
                }else {
                    this.setState({
                        score:0,
                    })
                }
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
    usernameChange=(e)=>{
        this.setState({
            username:e.target.value,
        })
    };
    passwordChange=(e)=>{
        this.setState({
            password:e.target.value
        })
    };
    ws =null;
    //进入房间
    userJoin=()=>{
        let username=this.state.name;
        if(username===''){
            alert('请先登陆');
            return null;
        }
        let urlPrefix =global.wsHostUrl+'chat-room/';
        let url = urlPrefix + username;
        let self=this;
        this.ws = new WebSocket(url);
        this.ws.onopen = function () {
            console.log("建立 websocket 连接...");
            console.log(flyList);
            self.userSetAll(username,mainFly);
        };

        this.ws.onmessage = function(event){
            //服务端发送的消息
            console.log(event);
            let info=event.data;
            let type=event.data.substring(0,4);
            let data=info.slice(4);
            console.log(type);
            switch (type) {
                case "data":
                    mainFly=JSON.parse(data);
                    break;
                case "move":
                    self.moveToMouseSLOther(JSON.parse(data).username,JSON.parse(data).endY,JSON.parse(data).endX);
                    break;
                case "msg0":
                    message.success(data);
                    break;
                case "set1":
                    flyList.set(JSON.parse(data).username,JSON.parse(data).fly);
                    // self.moveToMouseSLOther(JSON.parse(data).endY,JSON.parse(data).endX);
                    break;
                case "seta":
                    self.userSet(username,flyList.get(username));
                    // self.moveToMouseSLOther(JSON.parse(data).endY,JSON.parse(data).endX);
                    break;
                case "out1":
                    let timer=timeList.get(data);
                    clearInterval(timer);
                    console.log("delete",data);
                    flyList.delete(data);
                    break;
                default:
                    message.success(data);
            }

        };
        this.ws.onclose = function(){
            console.log('用户['+username+'] 已经离开房间!');
            console.log("关闭 websocket 连接...");
        }
    };
    //客户端发送消息到服务器
    userSend=()=>{
        this.setState({
            msg:""
        });
        if(this.ws){
            this.ws.send("msg0"+this.state.name+":"+this.state.msg);
        }
    };
    userMove=(username,endY,endX)=>{
        if(this.ws){
            this.ws.send("move"+JSON.stringify({
                username:username,
                endY:endY,
                endX:endX
            }));
        }
    };
    userSetAll=(username,fly)=>{
        if(this.ws){
            flyList.set(username,fly);
            this.setState({
                on:true
            });
            this.ws.send("seta");
        }
    };
    userSet=(username,fly)=>{
        if(this.ws){
            this.ws.send("set1"+JSON.stringify({
                username:username,
                fly:fly
            }));
        }
    };
    // 退出房间
    userExit= async () => {
        if (this.ws) {
            this.ws.close();
            this.ws=null;
            let timer=timeList.get(this.state.name);
            clearInterval(timer);
            flyList=new Map();
            this.setState({
                on:false
            })
        }
    };

    render() {
        const showFlyList=[];
        flyList.forEach((value,key)=>{
            return showFlyList.push(
                <div
                    key={key}
                    style={{
                        width:value.width,
                        height:value.height,
                        left:value.left-value.width/2,
                        top:value.top-value.height/2,
                        position:"absolute",
                    }}
                >
                    {key}
                    <img

                        draggable={false}
                        alt={"geluomo"}
                        src={fly}
                        style={{
                            width:value.width,
                            height:value.height,
                            transform:"rotate("+value.deg+"deg) rotateY("+value.turnWay+"deg)",
                        }}
                    />
                </div>

            )
        });
        return (
            <div className={"demo3"}>
                <button onClick={this.userJoin}>进入房间</button>
                <button onClick={this.userExit}>离开房间</button>
                <button onClick={this.showModal}>{this.state.name===""?"登录":this.state.name}</button>
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
                <img
                    draggable={false}
                    alt={"geluomo"}
                    src={this.state.time!==0?this.state.f_time<2?fly_gif:fly:fly_die}
                    id="MainBox"
                    style={{
                        display:this.state.on?"none":"block",
                        width:mainFly.width,
                        height:mainFly.height,
                        left:mainFly.left-mainFly.width/2,
                        top:mainFly.top-mainFly.height/2,
                        position:"absolute",
                        transform:"rotate("+mainFly.deg+"deg) rotateY("+mainFly.turnWay+"deg)",
                    }}
                />
                {
                    showFlyList.map((value)=>{
                        return value
                    })

                }
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
            </div>
        );
    }
}

