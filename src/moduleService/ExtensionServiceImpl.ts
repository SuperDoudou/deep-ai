import { LLMService } from "../chat/app/chat/LLMService";
import { ExtensionLLMService } from "../extension_handler/LLMService";
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
        ExtensionLLMService.chat(prompt, (reasoningContent: string, content: string, isEnd: boolean) => {
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
}