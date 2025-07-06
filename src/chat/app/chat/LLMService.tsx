import OpenAI from "openai";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { ContextAreaInfo } from "./ContextArea";
import { useContext } from "react";
import { GlobalAppContext } from "../GlobalStateProvider";
import ModelConfigModal from "./ModelConfigModal";

export const LLMService = forwardRef((props, ref) => {

    const appContext = useContext(GlobalAppContext);

    const clientMap = new Map<string, OpenAI>();

    useImperativeHandle(ref, () => ({
        sendText: async (message: string, contextAreaInfo: ContextAreaInfo,
            chunkCallBack: (reasoningContent: string, answer: string, isEnd: boolean) => void) => {
            // 检查是否已存在 OpenAI 客户端实例
            let model = appContext.modelList.filter(m => m.selected)[0];
            if (!model) {
                console.error("No model selected");
                return;
            }
            let openai: OpenAI;
            if (!clientMap.has(model.baseUrl + model.apiKey + model.modelName)) {
                // 创建新的 OpenAI 客户端实例并存储到 Map 中
                try {
                    openai = new OpenAI({
                        apiKey: model.apiKey,
                        baseURL: model.baseUrl,
                        dangerouslyAllowBrowser: true, // 允许在浏览器中使用
                    })
                } catch (error) {
                    console.error("Failed to create OpenAI client:", error);
                    chunkCallBack("", "Failed to create OpenAI client", true);
                    return;
                }
                clientMap.set(model.baseUrl + model.apiKey + model.modelName, openai);
            } else {
                openai = clientMap.get(model.baseUrl + model.apiKey + model.modelName)!;
            }


            let prompt = `文件名是： ${contextAreaInfo.fileName},文件内容是：${contextAreaInfo.fileText},生成的代码需要参考文件的缩进符号，指令是：${message}`
            console.log('prompt', prompt, appContext)
            let stream: any;
            try {
                stream = await openai.chat.completions.create({
                    model: "deepseek-r1-distill-llama-70b",  // 此处以 deepseek-r1 为例，可按需更换模型名称。
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    stream: true,  // 开启流式输出。
                });
            } catch (error) {
                console.error("Failed to create chat completion:", error);
                chunkCallBack("", "Failed to create chat completion", true);
                return;
            }
            let reasoningContent = '';
            let answerContent = '';
            let isAnswering = false;
            for await (const chunk of stream) {
                if (!chunk.choices?.length) {
                    console.log('\nUsage:');
                    console.log(chunk.usage);
                    continue;
                }

                const delta = chunk.choices[0].delta;

                // 处理思考过程
                if (delta.reasoning_content) {
                    reasoningContent += delta.reasoning_content;
                    chunkCallBack(reasoningContent, answerContent, false);
                }
                // 处理正式回复
                else if (delta.content) {
                    if (!isAnswering) {
                        console.log('\n' + '='.repeat(20) + '完整回复' + '='.repeat(20) + '\n');
                        isAnswering = true;
                    }
                    answerContent += delta.content;
                    chunkCallBack(reasoningContent, answerContent, false);
                }
            }
            console.log("message end")
            chunkCallBack(reasoningContent, answerContent, true);
        },
    }));

    return (<></>)

})