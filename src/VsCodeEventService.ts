import { DeepAiEvent } from "./Constant";

class VsCodeEventService {

    private static listenerMap: Map<string, ((data: DeepAiEvent) => void)[]> = new Map();

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
        let list = this.listenerMap.get(event.name);
        let e = DeepAiEvent.fromEventName(event.name, event.data);
        list?.forEach(callback => {
            callback(e);
        });
    }
}

export default VsCodeEventService;
