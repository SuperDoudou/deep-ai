import { randomUUID } from 'crypto';
import { ExtensionService, Stream } from '../../moduleService/idl/extensionService';
import ModuleAppMessage from '../../moduleService/ModuleAppMessage';

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
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, "chat", { prompt }, true);
    }

    async getEditorContext(): Promise<{
        filePath: string
        fileText: string
    }> {
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, "getEditorContext", {});
    }

    async updateChatPromptTemplate({ promptTemplate }: { promptTemplate: string }): Promise<void> {
        return ModuleAppMessage.sendRequest(ExtensionServiceInterface.serviceName, "updateChatPromptTemplate", { promptTemplate });
    }

}