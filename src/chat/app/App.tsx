import React, { useEffect } from 'react';
import "./App.css"
import InputArea from './chat/InputArea';
import ChatItem from './chat/ChatItem';
import ChatContainer from './chat/ChatItemContainer';
import AppMessage from './AppMessage';
import GlobalStateProvider from './GlobalStateProvider';

function App() {

  AppMessage.init();

  return (
    <div id="app_root">
      <GlobalStateProvider>
        <ChatContainer></ChatContainer>
      </GlobalStateProvider>
    </div>

  );
}

export default App;

