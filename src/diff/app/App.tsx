import React, { useEffect, useState } from 'react';
import "./App.css"
import AppMessage from './AppMessage';
import DiffViewer from './DiffViewer';
import { InitDiffEvent } from '../../Constant';
import { Base64 } from 'js-base64';
function App() {

  const [filePath, setFilePath] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [modifiedContent, setModifiedContent] = useState("");
  
  AppMessage.init();
  AppMessage.addEventListener(new InitDiffEvent, (data) => {
    console.log(`App content1: ${data.resolveData()}`)
    setFilePath(Base64.decode(data.resolveData().filePath))
    setOriginalContent(Base64.decode(data.resolveData().originalContent))
    setModifiedContent(Base64.decode(data.resolveData().modifiedContent))
    
  })
  return (
    <div id="app_root">
      <DiffViewer filePath={filePath} originalContent={originalContent} modifiedContent={modifiedContent}></DiffViewer>

    </div>

  );
}

export default App;

