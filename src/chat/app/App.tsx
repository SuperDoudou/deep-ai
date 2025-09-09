import React, { useEffect } from 'react';
import "./App.css"
import ChatContainer from './chat/ChatContainer';
import AppMessage from '../../moduleService/ModuleAppMessage';
import GlobalStateProvider from './GlobalStateProvider';
import { ChatLoadedEvent } from '../../Constant';
import { ExtensionServiceInterface } from './extensionServiceInterface';
import ModuleAppMessage from '../../moduleService/ModuleAppMessage';
function App() {

  const chat = async () => {
    const extensionServiceInterface = ExtensionServiceInterface.getInstance()
    // extensionServiceInterface.getEditorContext().then(resp => {
    //   console.log("企鹅豆豆到此一游" + JSON.stringify(resp))
    // })
    const p = extensionServiceInterface.chat({ prompt: "1和2哪个大" })
    await p.then(async stream => {
      for await (const chunk of stream) {
        console.log("" + JSON.stringify(chunk))
      }
    })
  }
  useEffect(() => {
    ModuleAppMessage.init()
    chat();
  }, [])

  return (
    <div id="app_root">
      <GlobalStateProvider>
        <ChatContainer></ChatContainer>
      </GlobalStateProvider>
    </div>

  );
}

export default App;

