import { ExtensionContext } from "vscode";
import { ModelItem } from "./chat/app/GlobalStateProvider";
import { WebviewInitData } from "./chat/webview/ChatWebview";
import VsCodeEventService from "./VsCodeEventService";
import { UpdateModelEvent } from "./Constant";

class VsCodeStorageService {
    private static chatInitDataKey = 'chatInitData';
    private static _context: ExtensionContext;

    static init(context: ExtensionContext) {
        this._context = context;
        VsCodeEventService.registerEvent(new UpdateModelEvent().name,
            (e: UpdateModelEvent) => {
                let modelItems = e.resolveData();
                this.SetChatWebviewInitData({
                    modelList: modelItems
                });
            });
    }

    public static GetChatWebviewInitData(): WebviewInitData {
        const modelItemsString = this._context.globalState.get<string>(this.chatInitDataKey);
        if (modelItemsString) {
            return JSON.parse(modelItemsString);
        }
        return {
            modelList: []
        };
    }

    public static SetChatWebviewInitData(data: WebviewInitData) {
        this._context.globalState.update(this.chatInitDataKey, JSON.stringify(data));
    }


}

export default VsCodeStorageService;
