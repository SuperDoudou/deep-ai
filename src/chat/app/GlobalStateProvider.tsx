import React, { useEffect, useState } from "react";
import { createContext } from 'react';
import VsCodeService from "./VsCodeService";
import AppMessage from "../../moduleService/ModuleAppMessage";
import { InitChatEvent } from "../../Constant";
import { ExtensionServiceInterface } from "./ExtensionServiceInterface";

export interface ModelItem {
  id: number
  baseUrl: string;
  apiKey: string;
  modelName: string;
  selected: boolean;
}
export interface GlobalContext {
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
      setState(prev => {
        let newState = { ...prev, [key]: value }
        return newState
      });
    },
    initFilePath: null,
    initFileText: null,
  });


  useEffect(() => {
    console.log(`init global data`)
    ExtensionServiceInterface.getInstance().getModelList().then(modelList => {
      console.log(`init model list`, modelList)
      setState(prev => {
        return {
          ...prev,
          modelList
        }
      })
    })

     ExtensionServiceInterface.getInstance().getChatPromptTemplate().then(promptTemplate => {
      console.log(`init promptTemplate`, promptTemplate)
      setState(prev => {
        return {
          ...prev,
          promptTemplate
        }
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
