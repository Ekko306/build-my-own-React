"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// 8. 用useState实现 state


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
    updateDom(dom, {}, fiber.props);
    return dom;
}

var isEvent = function isEvent(key) {
    return key.startsWith("on");
};
var isProperty = function isProperty(key) {
    return key !== "children" && !isEvent(key);
};
var isNew = function isNew(prev, next) {
    return function (key) {
        return prev[key] !== next[key];
    };
};
var isGone = function isGone(prev, next) {
    return function (key) {
        return !(key in next);
    };
};
function updateDom(dom, prevProps, nextProps) {
    // Remove old or changed event listeners
    Object.keys(prevProps).filter(isEvent).filter(function (key) {
        return !(key in nextProps) || isNew(prevProps, nextProps)(key);
    }).forEach(function (name) {
        var eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
    });

    // Remove old properties
    Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(function (name) {
        dom[name] = "";
    });
    // Set new or changed properties
    Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(function (name) {
        dom[name] = nextProps[name];
    });

    // Add event listeners
    Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(function (name) {
        var eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
    // Todo add nodes to dom
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }
    var domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent;
    }
    var domParent = domParentFiber.dom;

    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber, domParent);
        // domParent.removeChild(fiber.dom)
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}

function render(element, container) {
    // TODO set next unit of work
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}

var nextUnitOfWork = null;
var wipRoot = null;
var currentRoot = null;
var deletions = null;

function workLoop(deadline) {
    var shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    var isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    // // TODO add dom node
    // if (!fiber.dom) {
    //     fiber.dom = createDom(fiber)
    // }
    // // TODO create new fibers
    // const elements = fiber.props.children
    // reconcileChildren(fiber, elements)

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

function updateFunctionComponent(fiber) {
    //TODO
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    var children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}

var wipFiber = null;
var hookIndex = null;
function useState(initial) {
    var oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
    var hook = {
        state: oldHook ? oldHook.state : initial,
        queue: []
    };

    var actions = oldHook ? oldHook.queue : [];
    actions.forEach(function (action) {
        hook.state = action(hook.state);
    });

    var setState = function setState(action) {
        hook.queue.push(action);
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    };
    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }
    reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {
    var index = 0;
    var oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    var prevSibling = null;

    while (index < elements.length || oldFiber != null) {
        var _element = elements[index];
        var newFiber = null;

        // TODO compare oldFiber to element
        var sameType = oldFiber && _element && _element.type == oldFiber.type;
        if (sameType) {
            // TODO update the node
            newFiber = {
                type: oldFiber.type,
                props: _element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE"
            };
        }
        if (_element && !sameType) {
            // TODO add this node
            newFiber = {
                type: _element.type,
                props: _element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT"
            };
        }
        if (oldFiber && !sameType) {
            // TODO delete the oldFiber's node
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }

        // 这个干啥的？
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0) {
            wipFiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
}

var Didact = {
    createElement: createElement,
    render: render,
    useState: useState

    /** @jsx Didact.createElement */
};function Counter() {
    var _Didact$useState = Didact.useState(1),
        _Didact$useState2 = _slicedToArray(_Didact$useState, 2),
        state = _Didact$useState2[0],
        setState = _Didact$useState2[1];

    return Didact.createElement(
        "h1",
        { onClick: function onClick() {
                return setState(function (c) {
                    return c + 1;
                });
            }, style: "user-select: none" },
        "Count: ",
        state
    );
}
var element = Didact.createElement(Counter, null);
var container = document.getElementById("root8");
Didact.render(element, container);