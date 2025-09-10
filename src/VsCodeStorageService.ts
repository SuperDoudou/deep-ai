import { ExtensionContext } from "vscode";
import { ModelItem } from "./chat/app/GlobalStateProvider";
import { WebviewInitData } from "./chat/webview/ChatWebview";
import VsCodeEventService from "./VsCodeEventService";
import { UpdateModelEvent, UpdatePromptTemplateEvent } from "./Constant";

class VsCodeStorageService {
    private static chatDataKey = 'chatData';
    private static commonDataKey = 'commonData';
    private static _context: ExtensionContext;

    private static defaultInitData: WebviewInitData = {
        modelList: [],
        promptTemplate: "你是一个辅助编程的机器人，文件名是${fileName} 文件内容是${fileText}，请根据文件内容回答：${user_prompt}",
    };

    static init(context: ExtensionContext) {
        this._context = context;
    }

    public static GetChatWebviewInitData(): WebviewInitData {
        const initDataString = this._context.globalState.get<string>(this.chatDataKey);
        // console.log(`get init data ${initDataString}`);
        if (initDataString) {
            return JSON.parse(initDataString) as WebviewInitData;
        }
        return this.defaultInitData;
    }

    public static getModelList(): ModelItem[] {
        return this._context.globalState.get<ModelItem[]>(this.commonDataKey + "-" + "modelList") || [];
    }
    public static setModelList(modelList: ModelItem[]) {
        return this._context.globalState.update(this.commonDataKey + "-" + "modelList", modelList);
    }

    public static getChatKey(key: "promptTemplate"): string {
        return this._context.globalState.get<string>(this.chatDataKey + "-" + key) || "";
    }
    public static setChatKey(key: "promptTemplate", value: string) {
        this._context.globalState.update(this.chatDataKey + "-" + key, value);
    }

}

export default VsCodeStorageService;
