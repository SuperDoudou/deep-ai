import React, { useEffect } from 'react';
import "./App.css"
import InputArea from './chat/InputArea';
import ChatItem from './chat/ChatItem';
import ChatContainer from './chat/ChatItemContainer';
import { DeepAiEvent } from '../Constant';
import { fromBase64 } from 'js-base64';

type InnerMessage = {
  from: string; // extension|webview|react
  eventName: string; // 事件名称，如：getCurrentFileName
  data: string; // 数据，如：文件名
};


class AppMessage {

  private static listenerMap: Map<string, ((data: string) => void)[]> = new Map();

  /**
   * 
   * @param eventName 
   * @param callback 
   */
  public static addEventListener = (eventName: string, callback: (data: string) => void) => {
    let list = this.listenerMap.get(eventName)
    if (!list) {
      list = [callback];
      this.listenerMap.set(eventName, list);
    } else {
      list.push(callback)
    }
  }

  public static init = () => {
    window.addEventListener('message', (event) => {
      // 验证来源域名
      let innerMessage: InnerMessage = JSON.parse(JSON.stringify(event.data)) as InnerMessage;
      if (innerMessage.from == undefined || innerMessage.from.startsWith("react")) {
        // 不处理
        return
      }
      console.log(`get message in react from ${innerMessage.from}, ${innerMessage.eventName}, ${innerMessage.data}`);
      AppMessage.messageHandler(innerMessage);
    });
  }

  //
  public static messageHandler(innerMessage: InnerMessage) {
    let list = this.listenerMap.get(innerMessage.eventName)
    list?.forEach(callback => {
      callback(innerMessage.data)
    });

  }

  public static sendMessage = (event: DeepAiEvent) => {
    this.sendMessageToParent(event.name, event.resolveData())
  }


  private static sendMessageToParent = (eventName: string, data: string) => {
    console.log(`发送消息`)
    const message = {
      from: "react",
      eventName: eventName,
      data: data
    };
    window.parent.postMessage(message, "*"); // 替换为目标来源
  }
}

export default AppMessage;


