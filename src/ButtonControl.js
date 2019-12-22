import React from "react";

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  render() {
    let className = "RichEditor-styleButton";
    if (this.props.active) {
      className += " RichEditor-activeButton";
    }
    return (
      <button
        className={`buttonControl ${className}`}
        onMouseDown={this.onToggle}
      >
        {this.props.label}
      </button>
    );
  }
}

export default StyleButton;
