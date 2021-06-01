"use strict";

// 0.Review.js 实现最基本的下面替代
// const element = <h1 title="foo">Hello</h1> //没babel 还写不了jsx
// const container = document.getElementById("root")
// ReactDOM.render(element, container)

// build my own React
var elememt = {
    type: "h1",
    props: {
        title: "foo",
        children: "Hello"
    }
};

var container = document.getElementById("root0");

var node = document.createElement(elememt.type);
node["title"] = elememt.props.title;
var text = document.createTextNode("");
text["nodeValue"] = elememt.props.children;
node.appendChild(text);
container.appendChild(node);