import { DeepAiEvent } from "./Constant";
import ChatViewProvider from "./chat/webview/ChatWebview";

class VsCodeEventService {

    private static chatViewProvider: ChatViewProvider;
    private static listenerMap: Map<string, ((data: DeepAiEvent) => void)[]> = new Map();

    public static setChatViewProvider(chatViewProvider: ChatViewProvider) {
        this.chatViewProvider = chatViewProvider;
    }
    public static registerEvent(eventName: string, callback: (event: DeepAiEvent) => void) {
        let list = this.listenerMap.get(eventName);
        if (!list) {
            list = [callback];
            this.listenerMap.set(eventName, list);
        } else {
            list.push(callback);
        }
    }

    public static onEvent(event: DeepAiEvent) {
        console.log('[vs code] on event', event);
        let list = this.listenerMap.get(event.name);
        let e = DeepAiEvent.fromEventName(event.name, event.data);
        list?.forEach(callback => {
            callback(e);
        });
    }

    public static emitEvent(event: DeepAiEvent) {
        console.log('[vs code] emit event', event);
        this.chatViewProvider.getView()?.webview.postMessage(event);
    }
}

export default VsCodeEventService;
