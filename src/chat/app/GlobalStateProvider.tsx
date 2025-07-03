import React, { useEffect, useState } from "react";
import { createContext } from 'react';
import VsCodeService from "./VsCodeService";

export interface ModelItem {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  selected: boolean;
}
interface GlobalContext {
  modelList: ModelItem[];
}
// 创建一个 Context 对象
export const GlobalAppContext = createContext<GlobalContext>({
  modelList: [],
});

function GlobalStateProvider({ children }: { children: any }) {
  const [state, setState] = useState<GlobalContext>({
    modelList: [
      {
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: 'sk-528b8213b23f4f00b7ac836652985ee1',
        modelName: 'deepseek-r1-distill-llama-70b',
        selected: true,
      },
    ],
  });

  useEffect(() => {
    VsCodeService.updateModel(state.modelList)
  }, [state.modelList])
  
  // 可以在这里定义要共享的值
  const value = {
    state,
    setState,
    // 其他方法或值
  };

  return (
    <GlobalAppContext.Provider value={state}>
      {children}
    </GlobalAppContext.Provider>
  );
}
export default GlobalStateProvider;
