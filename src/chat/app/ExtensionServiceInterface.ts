import { randomUUID } from 'crypto';
import { ExtensionService, Stream } from '../../moduleService/idl/extensionService';
import ModuleAppMessage from '../../moduleService/ModuleAppMessage';
import { ModelItem } from './GlobalStateProvider';

export class ExtensionServiceInterface implements ExtensionService {
    [x: string]: any;
    private static serviceName: string = "ExtensionService";
    private static instance: ExtensionServiceInterface;

    private constructor() { }
 
    public static getInstance(): ExtensionServiceInterface {
        if (!this.instance) {
            this.instance = new ExtensionServiceInterface();
        }
        return this.instance;
    }



    async chat({ prompt }: { prompt: string }): Promise<Stream> {
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, this.chat.name, { prompt });
    }

    async getEditorContext(): Promise<{
        filePath: string
        fileText: string
    }> {
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, this.getEditorContext.name, {});
    }

    async getChatPromptTemplate(): Promise<string> {
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, this.getChatPromptTemplate.name, {});
    }
    
    async updateChatPromptTemplate({ promptTemplate }: { promptTemplate: string }): Promise<void> {
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, this.updateChatPromptTemplate.name, { promptTemplate });
    }


    async getModelList(): Promise<ModelItem[]> {
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, this.getModelList.name, {});
    }

    async setModelList({ modelList }: { modelList: ModelItem[] }): Promise<void> {
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, this.setModelList.name, { modelList });
    }
}