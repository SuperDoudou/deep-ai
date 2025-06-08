import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}

window.addEventListener('message', receiveMessage, false);

function receiveMessage(event: any) {
  console.log(event.data); // 处理接收到的消息
  const style = document.createElement('style');
  style.type = 'text/css';

  style.textContent = event.data
  document.head.appendChild(style)
}