"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// 4. Fiber.jsx 用workloop fiber改进渲染效率，还有Concurrent Mode概念
// https://reactjs.org/docs/concurrent-mode-intro.html


// build my own React
function createElement(type, props) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
    }

    return {
        type: type,
        props: _extends({}, props, {
            children: children.map(function (child) {
                return (typeof child === "undefined" ? "undefined" : _typeof(child)) === "object" ? child : createTextElement(child);
            })
        })
    };
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

// 更改以前的render逻辑
function createDom(fiber) {
    var dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);
    var isProperty = function isProperty(key) {
        return key !== "children";
    };
    Object.keys(fiber.props).filter(isProperty).forEach(function (name) {
        dom[name] = fiber.props[name];
    });
    return dom;
}
function render(element, container) {
    // TODO set next unit of work
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element]
        }
    };
}

var nextUnitOfWork = null;
function workLoop(deadline) {
    var shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    // TODO add dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom);
    }
    // TODO create new fibers
    var elements = fiber.props.children;
    var index = 0;
    var prevSibling = null;

    while (index < elements.length) {
        var _element = elements[index];
        var newFiber = {
            type: _element.type,
            props: _element.props,
            parent: fiber,
            dom: null
        };
        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
    // TODO return next unit of work
    if (fiber.child) {
        return fiber.child;
    }
    var nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

var Didact = {
    createElement: createElement,
    render: render

    /** @jsx Didact.createElement */
};var element = Didact.createElement(
    "div",
    { id: "foo" },
    Didact.createElement(
        "a",
        null,
        "bar"
    ),
    Didact.createElement("b", null)
);
var container = document.getElementById("root4");
Didact.render(element, container);