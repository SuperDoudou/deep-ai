import React, { useEffect, useState } from 'react';
import "./App.css"
import AppMessage from './AppMessage';
import DiffViewer from './DiffViewer';
import { ChatLoadedEvent, DiffLoadedEvent, InitDiffEvent } from '../../Constant';
import { Base64 } from 'js-base64';
function App() {


  useEffect(() => {
    AppMessage.init();
    console.log(`Diff App useEffect`)
    AppMessage.sendMessage(new DiffLoadedEvent());
  }, [])

  return (
    <div id="app_root">
      <DiffViewer></DiffViewer>

    </div>

  );
}

export default App;

