
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


export class ChangeVisibleTextEditorsEvent implements DeepAiEvent {
    name: string = "changeVisibleTextEditors";
    from: string = "vscode";
    description: string = "vscode 向 webview 发送当前编辑器文本";
    data: string = "";
    injectData: (filePath: string, fileText: string) => void =
        (filePath: string, fileText: string) => {
            this.data = JSON.stringify({
                filePath,
                fileText,
            });
        };
    resolveData: () => { filePath: string, fileText: string } =
        () => {
            return JSON.parse(this.data);
        };
}