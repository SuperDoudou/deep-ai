import { ModelItem } from "../chat/app/GlobalStateProvider";
import { LLMService } from "../extension_handler/LLMService";
import VsCodeStorageService from "../VsCodeStorageService";
import { ExtensionService, Stream } from "./idl/extensionService";
import { LLMStream } from "./idl/extensionServiceModel";


export class ExtensionServiceImpl implements ExtensionService {



    public static instante: ExtensionServiceImpl;
    public static getInstance(): ExtensionServiceImpl {
        if (!this.instante) {
            this.instante = new ExtensionServiceImpl();
        }
        return this.instante;
    }


    async chat({ prompt }: { prompt: string }): Promise<Stream> {
        let stream = new LLMStream();
        LLMService.chat(prompt, (reasoningContent: string, content: string, isEnd: boolean) => {
            stream.addData(reasoningContent, content, isEnd);
        });
        return stream;
    };

    async getEditorContext(): Promise<{
        filePath: string
        fileText: string
    }> {
        return {
            filePath: 'demo path',
            fileText: 'demo text'
        }
    }

    async getChatPromptTemplate(): Promise<string> {
        return VsCodeStorageService.getInstance().getChatKey("promptTemplate");
    }

    async updateChatPromptTemplate({ promptTemplate }: { promptTemplate: string; }): Promise<void> {
        VsCodeStorageService.getInstance().setChatKey("promptTemplate", promptTemplate);
        return
    }

    async getModelList(): Promise<ModelItem[]> {
        return VsCodeStorageService.getInstance().getModelList();
    }
    async setModelList({ modelList }: { modelList: ModelItem[]; }) {
        return VsCodeStorageService.getInstance().setModelList(modelList);
    }

}