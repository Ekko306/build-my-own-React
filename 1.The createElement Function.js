// const element = React.createElement(
//     "div",
//     {id: "foo"},
//     React.createElement("a", null, "bar"),
//     React.createElement("b")
// )
// const container = document.getElementById("root")
// ReactDOM.render(element, container)
// 实现createElement


// build my own React
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === "object" ? child : createTextElement(child)
            )
        }
    };
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        }
    }
}

const Didact = {
    createElement,
}

// // 设置jsx解析 就不用写Didact.createElement了 先没配置不用
// /** @jsx Didact.createElement */
// const element = (
//     <div id="foo">
//         <a>bar</a>
//         <b />
//     </div>
// )
const element = Didact.createElement(
    "div",
    { id: "foo" },
    Didact.createElement("a", null, "bar"),
    Didact.createElement("b")
)
const container = document.getElementById("root")
ReactDOM.render(element, container) //还不能用 因为不是React格式 还要下节手写render


