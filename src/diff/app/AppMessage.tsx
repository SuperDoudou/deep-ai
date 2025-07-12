import React, { useEffect } from 'react';
import "./App.css"
import { fromBase64 } from 'js-base64';
import { DeepAiEvent } from '../../Constant';



class AppMessage {

  private static listenerMap: Map<string, ((event: DeepAiEvent) => void)[]> = new Map();

  /**
   * 
   * @param eventName 
   * @param callback 
   */
  public static addEventListener = (eventName: string, callback: (event: DeepAiEvent) => void) => {
    let list = this.listenerMap.get(eventName);
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
      let innerMessage: DeepAiEvent = JSON.parse(JSON.stringify(event.data)) as DeepAiEvent;
      let e = DeepAiEvent.fromEventName(innerMessage.name, innerMessage.data)
      if (e.from == undefined || e.from.startsWith("react")) {
        // 不处理
        return
      }
      console.log(`[diff] get message from ${e.from}, ${e.name}, ${e.data}`);

      AppMessage.messageHandler(e);
    });
  }

  //
  public static messageHandler(event: DeepAiEvent) {
    let list = this.listenerMap.get(event.name)
    list?.forEach(callback => {
      callback(event)
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


