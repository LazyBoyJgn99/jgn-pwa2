import React, { Component,Suspense } from 'react';
import {Layout,Row,Col,Tooltip,Menu, Breadcrumb} from 'antd';
import {HashRouter , Route, Link} from 'react-router-dom';
import asyncComponent from './AsyncComponent';
// import Game from "./pages/Game";
// import Demo from "./pages/Demo"
const Demo = asyncComponent(() => import("./pages/Demo"));
const Game = asyncComponent(() => import("./pages/Game"));
const Game2 = asyncComponent(() => import("./pages/Game2"));
const Game3 = asyncComponent(() => import("./pages/Game3"));

class App extends Component {
    componentDidMount(){
        // this.goToIndex();
    };
    goToIndex=()=>{
        document.getElementById("goToIndex").click();
    };
    goToDemo1=()=>{
        document.getElementById("goToDemo1").click();
    };
    render() {
        return (
            <div className="App" id="App">
                <HashRouter>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Layout>
                            <Layout.Header className="header">
                                <div className="logo" />
                                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['0']}>
                                    <Menu.Item key="1"><Link to={"/index"}>page1</Link></Menu.Item>
                                    <Menu.Item key="2"><Link to={"/game2"}>page2</Link></Menu.Item>
                                    <Menu.Item key="3"><Link to={"/game3"}>page3</Link></Menu.Item>
                                </Menu>
                            </Layout.Header>
                            <Layout >
                                {/*<Breadcrumb style={{ margin: '16px 0' }}>*/}
                                {/*    <Breadcrumb.Item>Home</Breadcrumb.Item>*/}
                                {/*    <Breadcrumb.Item>List</Breadcrumb.Item>*/}
                                {/*    <Breadcrumb.Item>App</Breadcrumb.Item>*/}
                                {/*</Breadcrumb>*/}
                                <Layout.Content
                                    className="site-layout-background"
                                    style={{
                                        padding: 0,
                                        margin: 0,
                                        minHeight: 280,
                                    }}
                                >
                                    <Route path={"/index"} component={Game} />
                                    <Route path={"/game2"} component={Game2} />
                                    <Route path={"/game3"} component={Game3} />
                                </Layout.Content>
                            </Layout>
                        </Layout>
                        <Link to={"/index"} id={"goToIndex"}/>
                        <Link to={"/Demo1"} id={"goToDemo1"}/>
                        <div
                            style={{
                                position:"absolute",
                                width:window.innerWidth,
                                top:window.innerHeight-50,
                                textAlign:"center"
                            }}
                        >
                            <div

                            >
                                @Author-
                                <Tooltip  title={"QQ626723063"}>
                                    JGN
                                </Tooltip>
                                -
                                <Tooltip  title={"QQ978539156"}>
                                    MilK
                                </Tooltip>
                                -
                                <Tooltip  title={"QQ823561237"}>
                                    SC
                                </Tooltip>

                            </div>
                            <a
                                onClick={()=>{
                                    window.open("http://beian.miit.gov.cn/publish/query/indexFirst.action")
                                }}
                            >
                                浙ICP备18049534号-1
                            </a>
                        </div>
                    </Suspense>
                </HashRouter>
            </div>
        );
    }

}

export default App;

