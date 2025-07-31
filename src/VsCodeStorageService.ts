import { ExtensionContext } from "vscode";
import { ModelItem } from "./chat/app/GlobalStateProvider";
import { WebviewInitData } from "./chat/webview/ChatWebview";
import VsCodeEventService from "./VsCodeEventService";
import { UpdateModelEvent, UpdatePromptTemplateEvent } from "./Constant";

class VsCodeStorageService {
    private static chatInitDataKey = 'chatInitData';
    private static _context: ExtensionContext;

    private static defaultInitData: WebviewInitData = {
        modelList: [],
        promptTemplate: "你是一个辅助编程的机器人，文件名是${fileName} 文件内容是${fileText}，请根据文件内容回答：${user_prompt}",
        filePath: "",
        fileText: ""
    }

    static init(context: ExtensionContext) {
        this._context = context;
        VsCodeEventService.registerEvent(new UpdateModelEvent().name,
            (e: UpdateModelEvent) => {
                let modelItems = e.resolveData();
                this.SetChatWebviewInitData({
                    ...this.GetChatWebviewInitData(),
                    modelList: modelItems
                });
            });

        VsCodeEventService.registerEvent(new UpdatePromptTemplateEvent().name,
            (e: UpdatePromptTemplateEvent) => {
                let promptTemplate = e.resolveData();
                this.SetChatWebviewInitData({
                    ...this.GetChatWebviewInitData(),
                    promptTemplate
                });
            });
    }

    public static GetChatWebviewInitData(): WebviewInitData {
        const initDataString = this._context.globalState.get<string>(this.chatInitDataKey);
        console.log(`get init data ${initDataString}`);
        if (initDataString) {
            return JSON.parse(initDataString) as WebviewInitData;
        }
        return this.defaultInitData;
    }

    public static SetChatWebviewInitData(data: WebviewInitData) {
        console.log(`set init data ${JSON.stringify(data)}`);
        this._context.globalState.update(this.chatInitDataKey, JSON.stringify(data));
    }


}

export default VsCodeStorageService;
