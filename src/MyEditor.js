import React from "react";
import {
  CompositeDecorator,
  ContentState,
  convertFromHTML,
  Editor,
  EditorBlock,
  EditorState,
  RichUtils,
  getDefaultKeyBinding
} from "draft-js";
import marked from "marked";

import BlockStyleControls from "./BlockControls";
import InlineStyleControls from "./InlineControls";

import styleMap from "./styleMap";

import { stateToMarkdown } from "draft-js-export-markdown";
import { stateFromHTML } from "draft-js-import-html";

class Marquee extends React.Component {
  render() {
    const { block, contentState } = this.props;
    const gotEntity = block.getKey();
    return (
      <div className="marquee">
        <div className="wackifiedText">
          <EditorBlock {...this.props}>{this.props.children}</EditorBlock>
        </div>
      </div>
    );
  }
}
const rx = /e/g;
// const handleStrategy = () => {}
function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}
function handleStrategy(contentBlock, callback, contentState) {
  findWithRegex(rx, contentBlock, callback);
}
const HandleSpan = props => {
  return <span className="fudged">{props.children}</span>;
};

const compositeDecorator = new CompositeDecorator([
  {
    strategy: handleStrategy,
    component: HandleSpan
  }
]);

const markdown = `
# Hello World

<section class="container">
  <div class="single-column">
    <ul class="list">
      <li>moony <span style="font-weight: bold;">fish</span></li>
      <li>two <u>fish</u></li>
      <li>red fish</li>
      <li>bluefish</li>
    </ul>
  </div>
</section>
`;

const renderedMarkdown = marked(markdown);
console.log("rendered markdown", renderedMarkdown);

const sampleMarkup =
  "<b>Bold text</b>, <i>Italic text</i><br/ ><br />" +
  '<a href="http://www.facebook.com">Example link</a>';

const blocksFromHTML = convertFromHTML(renderedMarkdown);
console.log("content blocks", blocksFromHTML);
const state = ContentState.createFromBlockArray(
  blocksFromHTML.contentBlocks,
  blocksFromHTML.entityMap
);

export default class MyEditor extends React.Component {
  // empty editor
  // state = { editorState: EditorState.createEmpty(compositeDecorator) };

  // markdown string
  // state = { editorState: EditorState.createWithContent(stateFromMarkdown(markdown), compositeDecorator) }

  // converted html
  state = {
    editorState: EditorState.createWithContent(state, compositeDecorator)
  };

  // converted html with plugin
  // state = {
  //   editorState: EditorState.createWithContent(
  //     stateFromHTML(renderedMarkdown),
  //     compositeDecorator
  //   )
  // };
  exportContainer = React.createRef();
  focus = () => this.refs.editor.focus();
  onChange = editorState => this.setState({ editorState });

  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  };

  mapKeyToEditorCommand = e => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        4 /* maxDepth */
      );
      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };

  toggleBlockType = blockType => {
    console.log("togglin them block types", blockType);
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  };

  toggleInlineStyle = inlineStyle => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  };

  blockRenderer = contentBlock => {
    const type = contentBlock.getType();
    if (type === "wiggity") {
      return {
        component: Marquee,
        editable: true,
        props: {
          isThisWack: "yes it is wack"
        }
      };
    }
  };

  exportContent = () => {
    console.log("container", this.exportContainer.current);
    const markdown = stateToMarkdown(
      this.state.editorState.getCurrentContent()
    );
    this.exportContainer.current.innerText = markdown;
  };

  render() {
    const { editorState } = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = "RichEditor-editor";
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (
        contentState
          .getBlockMap()
          .first()
          .getType() !== "unstyled"
      ) {
        className += " RichEditor-hidePlaceholder";
      }
    }

    return (
      <div>
        <div className="RichEditor-root">
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />

          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />

          <div className={className} onClick={this.focus}>
            <Editor
              blockStyleFn={getBlockStyle}
              blockRendererFn={this.blockRenderer}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              keyBindingFn={this.mapKeyToEditorCommand}
              onChange={this.onChange}
              placeholder="Tell a story..."
              ref="editor"
              spellCheck={true}
            />
          </div>
          <button onClick={this.exportContent}>Export</button>
        </div>
        <div ref={this.exportContainer} />
      </div>
    );
  }
}

function getBlockStyle(block) {
  switch (block.getType()) {
    case "blockquote":
      return "RichEditor-blockquote";
    default:
      return null;
  }
}
