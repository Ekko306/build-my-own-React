"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// 2. The render Function ，完成了createElement和render函数，可以基本实现渲染


// build my own React
function createElement(type, props) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
    }

    var a = {
        type: type,
        props: _extends({}, props, {
            children: children.map(function (child) {
                return (typeof child === "undefined" ? "undefined" : _typeof(child)) === "object" ? child : createTextElement(child);
            })
        })
    };
    console.log(a);
    return a;
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    };
}

function render(element, container) {
    var dom = element.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);

    var isProperty = function isProperty(key) {
        return key !== "children";
    };
    Object.keys(element.props).filter(isProperty).forEach(function (name) {
        dom[name] = element.props[name];
    });

    // 递归 render里还会render
    element.props.children.forEach(function (child) {
        return render(child, dom);
    });
    container.appendChild(dom);
}

var Didact = {
    createElement: createElement,
    render: render

    /** @jsx Didact.createElement */
};var element = Didact.createElement(
    "div",
    { id: "foo", name: "my" },
    Didact.createElement(
        "a",
        null,
        "bar"
    ),
    Didact.createElement("b", null)
);
var container = document.getElementById("root2");
Didact.render(element, container);