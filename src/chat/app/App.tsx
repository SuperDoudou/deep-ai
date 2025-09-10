import React, { useEffect } from 'react';
import "./App.css"
import ChatContainer from './chat/ChatContainer';
import AppMessage from '../../moduleService/ModuleAppMessage';
import GlobalStateProvider from './GlobalStateProvider';
import { ChatLoadedEvent } from '../../Constant';
import { ExtensionServiceInterface } from './ExtensionServiceInterface';
import ModuleAppMessage from '../../moduleService/ModuleAppMessage';
function App() {

  const AppInit = () => {
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    if (macosPlatforms.indexOf(platform) !== -1) {
      window.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.code === "KeyC") {
          document.execCommand("copy");
        } else if ((event.ctrlKey || event.metaKey) && event.code === "KeyX") {
          document.execCommand("cut");
        } else if ((event.ctrlKey || event.metaKey) && event.code === "KeyV") {
          document.execCommand("paste");
        } else if ((event.ctrlKey || event.metaKey) && event.code === "KeyA") {
          document.execCommand("selectAll");
        }
      });
    }
  }

  const chat = async () => {
    const extensionServiceInterface = ExtensionServiceInterface.getInstance()
    // extensionServiceInterface.getEditorContext().then(resp => {
    //   console.log("企鹅豆豆到此一游" + JSON.stringify(resp))
    // })
    // const p = extensionServiceInterface.chat({ prompt: "1和2哪个大" })
    // await p.then(async stream => {
    //   for await (const chunk of stream) {
    //     console.log("" + JSON.stringify(chunk))
    //   }
    // })
  }
  useEffect(() => {
    ModuleAppMessage.init()
    AppInit()
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

