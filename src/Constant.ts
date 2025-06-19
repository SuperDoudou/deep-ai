
export class DeepAiEvent {
    public name: string = "";
    public from: string = "";// vscode|react
    public description: string = "";
    public data: string = "";
    public injectData: (...args: any[]) => any = () => { };
    public resolveData: (...args: any[]) => any = () => { };
    
    public static fromEventName(name: string, data: string) {
        let e: DeepAiEvent = new DeepAiEvent;
        if (name === "updateCurrentEditorText") {
            e = new UpdateCurrentEditorTextEvent();

        }
        e.data = data;
        return e;
    }
}

export class UpdateCurrentEditorTextEvent implements DeepAiEvent {
    name: string = "updateCurrentEditorText";
    from: string = "react";
    description: string = "webview 向 vscode 发送当前编辑器文本";
    data: string = "";
    injectData: (text: string) => void =
        (text: string) => {
            this.data = text;
        };
    resolveData: () => {} =
        () => {
            return this.data;
        };
}

