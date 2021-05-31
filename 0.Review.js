// const element = <h1 title="foo">Hello</h1> //没babel 还写不了jsx
// const container = document.getElementById("root")
// ReactDOM.render(element, container)

// build my own React
const elememt = {
    type: "h1",
    props: {
        title: "foo",
        children: "Hello"
    }
}

const container = document.getElementById("root")

const node = document.createElement(elememt.type)
node["title"] = elememt.props.title
const text = document.createTextNode("")
text["nodeValue"] = elememt.props.children
node.appendChild(text)
container.appendChild(node)
