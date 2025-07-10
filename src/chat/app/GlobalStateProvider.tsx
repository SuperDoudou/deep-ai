import React, { useEffect, useState } from "react";
import { createContext } from 'react';
import VsCodeService from "./VsCodeService";
import AppMessage from "./AppMessage";
import { InitChatEvent } from "../../Constant";

export interface ModelItem {
  id: number
  baseUrl: string;
  apiKey: string;
  modelName: string;
  selected: boolean;
}
interface GlobalContext {
  modelList: ModelItem[];
  promptTemplate: string;
  initFilePath: string | null;
  initFileText: string | null;
  updateGlobalContext: (k: string, v: any) => void;
}
// 创建一个 Context 对象
export const GlobalAppContext = createContext<GlobalContext>({
  modelList: [],
  promptTemplate: "",
  updateGlobalContext: () => { },
  initFilePath: null,
  initFileText: null
});

function GlobalStateProvider({ children }: { children: any }) {
  const [state, setState] = useState<GlobalContext>({
    modelList: [],
    promptTemplate: "",
    updateGlobalContext: (key, value) => {
      setState(prev => ({ ...prev, [key]: value }));
    },
    initFilePath: null,
    initFileText: null,
    /*
          {
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: 'sk-528b8213b23f4f00b7ac836652985ee1',
        modelName: 'deepseek-r1-distill-llama-70b',
        selected: true,
      },
    */
  });


  useEffect(() => {
    console.log(`init global data`)
    AppMessage.addEventListener(new InitChatEvent().name, (data) => {
      let event = new InitChatEvent()
      event.data = data
      let initData = event.resolveData()
      console.log(initData)

      setState({
        ...state,
        modelList: initData.modelList,
        promptTemplate: initData.promptTemplate,
        initFilePath: initData.filePath,
        initFileText: initData.fileText,
      })
    })
  }, [])

  return (
    <GlobalAppContext.Provider value={state}>
      {children}
    </GlobalAppContext.Provider>
  );
}
export default GlobalStateProvider;
