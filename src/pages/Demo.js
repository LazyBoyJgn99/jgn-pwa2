import React,{Component} from 'react';
import {Link} from 'react-router-dom'

export default class Demo extends Component{

    render(){
        return <div>
            Demo1aa
            <Link to={"/index2"}>1</Link>
        </div>
    }
}

