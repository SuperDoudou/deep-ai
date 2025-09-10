import { ExtensionContext } from "vscode";
import { ModelItem } from "./chat/app/GlobalStateProvider";
import { WebviewInitData } from "./chat/webview/ChatWebview";

class VsCodeStorageService {
    private chatDataKey = 'chatData';
    private commonDataKey = 'commonData';
    private static context: ExtensionContext;

    private defaultInitData: WebviewInitData = {
        modelList: [],
        promptTemplate: "你是一个辅助编程的机器人，文件名是${fileName} 文件内容是${fileText}，请根据文件内容回答：${user_prompt}",
    };
    private static instance: VsCodeStorageService;

    private constructor(context: ExtensionContext) {
        VsCodeStorageService.context = context
    }
    public static getInstance(): VsCodeStorageService {
        return this.instance;
    }
    public static init(context: ExtensionContext) {
        console.log("aa+" + this)
        console.log(`init storage service ${context}`)
        this.instance = new VsCodeStorageService(context);
    }

    public GetChatWebviewInitData(): WebviewInitData {
        const initDataString = VsCodeStorageService.context.globalState.get<string>(this.chatDataKey);
        // console.log(`get init data ${initDataString}`);
        if (initDataString) {
            return JSON.parse(initDataString) as WebviewInitData;
        }
        return this.defaultInitData;
    }

    public getModelList(): ModelItem[] {
        console.log("cc+" + this)
        return VsCodeStorageService.context.globalState.get<ModelItem[]>(this.commonDataKey + "-" + "modelList") || [];
    }
    public setModelList(modelList: ModelItem[]) {
        return VsCodeStorageService.context.globalState.update(this.commonDataKey + "-" + "modelList", modelList);
    }

    public getChatKey(key: "promptTemplate"): string {
        return VsCodeStorageService.context.globalState.get<string>(this.chatDataKey + "-" + key) || "";
    }
    public setChatKey(key: "promptTemplate", value: string) {
        VsCodeStorageService.context.globalState.update(this.chatDataKey + "-" + key, value);
    }

}

export default VsCodeStorageService;
