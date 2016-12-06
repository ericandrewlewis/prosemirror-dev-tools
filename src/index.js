const {Schema, DOMParser} = require("prosemirror-model")
const {EditorState} = require("prosemirror-state")
const {schema} = require("prosemirror-schema-basic")
const {addListNodes} = require("prosemirror-schema-list")
const {addTableNodes} = require("prosemirror-schema-table")
const {MenuBarEditorView} = require("prosemirror-menu")
const {exampleSetup} = require("prosemirror-example-setup")
const JSONTree = require('react-json-tree').default
const React = require('react')
const ReactDOM = require('react-dom')
const Dock = require('react-dock')
const debounce = require('debounce');

const demoSchema = new Schema({
  nodes: addListNodes(addTableNodes(schema.nodeSpec, "block+", "block"), "paragraph block*", "block"),
  marks: schema.markSpec
})

let state = EditorState.create({doc: DOMParser.fromSchema(demoSchema).parse(document.querySelector("#content")),
                                plugins: exampleSetup({schema: demoSchema})})

class ActionLogger {
  constructor() {
    this.actions = []
    this.render = debounce(this.render, 50)
  }
  recordAction(action) {
    this.actions = Array.from(this.actions)
    if (this.actions.length > 20) {
      this.actions = this.actions.slice(0, 20)
    }
    this.actions.unshift(action)
    this.render()
  }
  render() {
    ReactDOM.render(
      React.DOM.div(
        {
          style: {
            fontFamily: 'monaco, Consolas, Lucida Console, monospace',
          }
        },
        React.createElement(Dock, { position: 'right', isVisible: true, dimMode: 'none'},
          this.actions.map((action) => {
            return React.createElement(JSONTree, {
              key: action.time,
              data: action
            })
          })
        )
      ),
      document.getElementById('log')
    )
  }
}
const logger = new ActionLogger()
logger.render()

let view = window.view = new MenuBarEditorView(document.querySelector(".full"), {
  state,
  onAction: action => {
    view.updateState(view.editor.state.applyAction(action))
    logger.recordAction(action)
  }
})

console.log('yes')
