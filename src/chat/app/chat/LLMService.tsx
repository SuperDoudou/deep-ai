import OpenAI from "openai";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { ContextAreaInfo } from "./ContextArea";
import { useContext } from "react";
import { GlobalAppContext, GlobalContext } from "../GlobalStateProvider";
import ModelConfigModal from "./ModelConfigModal";

export class LLMService {

    public static appContext: GlobalContext;

    public static clientMap = new Map<string, OpenAI>();

    public static getClient = (baseUrl: string, apiKey: string, modelName: string): OpenAI | undefined => {
        let openai: OpenAI;
        if (!this.clientMap.has(baseUrl + apiKey + modelName)) {
            // 创建新的 OpenAI 客户端实例并存储到 Map 中
            try {
                openai = new OpenAI({
                    apiKey: apiKey,
                    baseURL: baseUrl,
                    dangerouslyAllowBrowser: true, // 允许在浏览器中使用
                })
            } catch (error) {
                console.error("Failed to create OpenAI client:", error);

                return;
            }
            this.clientMap.set(baseUrl + apiKey + modelName, openai);
        } else {
            openai = this.clientMap.get(baseUrl + apiKey + modelName)!;
        }
        return openai
    }


    public static sendText = async (message: string,
        contextAreaInfo: ContextAreaInfo,
        promptTemplate: string,
        chunkCallBack: (reasoningContent: string, answer: string, isEnd: boolean) => void) => {

        let model = this.appContext.modelList.filter(m => m.selected)[0];
        if (!model) {
            chunkCallBack("", "No model selected", true);
            return;
        }

        let openAiClient = this.getClient(model.baseUrl, model.apiKey, model.modelName);
        if (!openAiClient) {
            chunkCallBack("", "Failed to create OpenAI client", true);
            return;
        }


        let prompt = promptTemplate.replace("${user_prompt}", message)
        prompt = prompt.replace("${fileText}", contextAreaInfo.fileText)
        prompt = prompt.replace("${fileName}", contextAreaInfo.fileName)
        let stream: any;
        try {
            stream = await openAiClient.chat.completions.create({
                model: model.modelName,  // 此处以 deepseek-r1 为例，可按需更换模型名称。
                messages: [
                    { role: "user", content: prompt }
                ],
                stream: true,  // 开启流式输出。
            });
        } catch (error) {
            chunkCallBack("", "Failed to create chat completion", true);
            return;
        }
        let reasoningContent = '';
        let answerContent = '';
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
                answerContent += delta.content;
                chunkCallBack(reasoningContent, answerContent, false);
            }
        }
        console.log("message end")
        chunkCallBack(reasoningContent, answerContent, true);
    }

    public static applyCode = async (prompt: string,
        chunkCallBack: (reasoningContent: string, answer: string, isEnd: boolean) => void) => {

        let model = this.appContext.modelList.filter(m => m.selected)[0];
        if (!model) {
            chunkCallBack("", "No model selected", true);
            return;
        }

        let openAiClient = this.getClient(model.baseUrl, model.apiKey, model.modelName);
        if (!openAiClient) {
            chunkCallBack("", "Failed to create OpenAI client", true);
            return;
        }


        let stream: any;
        try {
            stream = await openAiClient.chat.completions.create({
                model: model.modelName,  // 此处以 deepseek-r1 为例，可按需更换模型名称。
                messages: [
                    { role: "user", content: prompt }
                ],
                stream: true,  // 开启流式输出。
            });
        } catch (error) {
            chunkCallBack("", "Failed to create chat completion", true);
            return;
        }
        let reasoningContent = '';
        let answerContent = '';
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
                answerContent += delta.content;
                chunkCallBack(reasoningContent, answerContent, false);
            }
        }
        console.log("message end")
        chunkCallBack(reasoningContent, answerContent, true);
    }
}