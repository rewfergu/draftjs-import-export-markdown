import React from "react";
import ReactDOM from "react-dom";
import MyEditor from "./MyEditor";
import "./styles.scss";

function App() {
  return (
    <div className="App">
      <h1>Draft JS Rich Text Editing</h1>
      <h2>Custom Block Style, Custom Inline Style, and Regex (e chars)</h2>
      <MyEditor />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
