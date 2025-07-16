import React, { useEffect } from 'react';
import "./App.css"
import { DeepAiEvent } from '../../Constant';



class AppMessage {

  private static listenerMap: Map<string, ((data: DeepAiEvent) => void)[]> = new Map();
  private static unhandleMessage: DeepAiEvent[] = []
  /**
   * 
   * @param eventName 
   * @param callback 
   */
  public static addEventListener = (eventName: string, callback: (e: DeepAiEvent) => void) => {
    let list = this.listenerMap.get(eventName)
    if (!list) {
      list = [callback];
      this.listenerMap.set(eventName, list);
      this.unhandleMessage.forEach(e => {
        if (e.name == eventName) {
          callback(e)
        }
      });
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
      console.log(`[react] get message from ${e.from}, ${e.name}, ${e.data}`);
      AppMessage.messageHandler(e);
    });

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

  //
  public static messageHandler(event: DeepAiEvent) {
    let list = this.listenerMap.get(event.name)
    if (list == null || list.length == 0) {
      AppMessage.unhandleMessage.push(event)
    }
    list?.forEach(callback => {
      callback(event)
    });

  }

  public static sendMessage = (event: DeepAiEvent) => {
    this.sendMessageToParent(event.name, event.data)
  }


  private static sendMessageToParent = (eventName: string, data: string) => {
    const message = {
      from: "chat",
      name: eventName,
      data: data
    };
    if (window.parent) {
      // dev mode
      window.parent.postMessage(message, "*"); // 替换为目标来源
    } else {
      // prod mode
      vscode.postMessage(message);
    }
  }
}

export default AppMessage;


