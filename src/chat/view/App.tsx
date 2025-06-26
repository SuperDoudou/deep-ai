import React, { useEffect } from 'react';
import "./App.css"
import InputArea from './chat/InputArea';
import ChatItem from './chat/ChatItem';
import ChatContainer from './chat/ChatItemContainer';
import AppMessage from './AppMessage';
function App() {

  AppMessage.init();

  return (
    <div id="app_root">

      <ChatContainer></ChatContainer>
    </div>

  );
}

export default App;

