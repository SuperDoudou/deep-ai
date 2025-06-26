import React, { useEffect } from 'react';
import "./App.css"
import { fromBase64 } from 'js-base64';
import { DeepAiEvent } from '../../Constant';



class AppMessage {

  private static listenerMap: Map<string, ((e: DeepAiEvent) => void)[]> = new Map();

  /**
   * 
   * @param eventName 
   * @param callback 
   */
  public static addEventListener = (event: DeepAiEvent, callback: (e: DeepAiEvent) => void) => {
    let list = this.listenerMap.get(event.name)
    if (!list) {
      list = [callback];
      this.listenerMap.set(event.name, list);
    } else {
      list.push(callback)
    }
  }

  public static init = () => {
    window.addEventListener('message', (event) => {

      // 验证来源域名
      let innerMessage: DeepAiEvent = JSON.parse(JSON.stringify(event.data)) as DeepAiEvent;
      let copyMessage = DeepAiEvent.fromEventName(innerMessage.name, innerMessage.data);
      if (copyMessage.from == undefined || copyMessage.from.startsWith("react")) {
        // 不处理
        return
      }
      console.log(`[diff] get message from ${copyMessage.from}, ${copyMessage.name}, ${copyMessage.data}`);

      AppMessage.messageHandler(copyMessage);
    });
  }

  //
  public static messageHandler(innerMessage: DeepAiEvent) {
    let list = this.listenerMap.get(innerMessage.name)
    list?.forEach(callback => {
      callback(innerMessage)
    });

  }

  public static sendMessage = (event: DeepAiEvent) => {
    this.sendMessageToParent(event.name, event.data)
  }


  private static sendMessageToParent = (eventName: string, data: string) => {
    console.log(`发送消息`)
    const message = {
      from: "react",
      name: eventName,
      data: data
    };
    window.parent.postMessage(message, "*"); // 替换为目标来源
  }
}

export default AppMessage;


