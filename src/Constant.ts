
export class ExtensionEnv {
    public static isProduction: boolean | null = null;
    public static extensionPath: string | null = null;
}

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
        if (name === "changeVisibleTextEditors") {
            e = new ChangeVisibleTextEditorsEvent();
        }
        if (name === "acceptVisibleTextEditors") {
            e = new AcceptCurrentEditorTextEvent();
        }
        if (name === "initDiff") {
            e = new InitDiffEvent();
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
    injectData: (filePath: string, fileText: string) => void =
        (filePath: string, fileText: string) => {
            this.data = JSON.stringify({
                filePath,
                fileText,
            });
        };
    resolveData: () => { filePath: string, fileText: string } =
        () => {
            return JSON.parse(this.data) as {
                filePath: string,
                fileText: string,
            };
        };
}

export class AcceptCurrentEditorTextEvent implements DeepAiEvent {
    name: string = "acceptCurrentEditorText";
    from: string = "react";
    description: string = "webview 向 vscode 接受当前文本所有改动";
    data: string = "";
    injectData: (filePath: string, fileText: string) => void =
        (filePath: string, fileText: string) => {
            this.data = JSON.stringify({
                filePath,
            });
        };
    resolveData: () => { filePath: string, fileText: string } =
        () => {
            return JSON.parse(this.data) as {
                filePath: string,
                fileText: string
            };
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

export class InitDiffEvent implements DeepAiEvent {
    name: string = "initDiff";
    from: string = "vscode";
    description: string = "vscode 向 diff webview 发送当前编辑器文本";
    data: string = "";
    injectData: (filePath: string, originalContent: string, modifiedContent: string) => void =
        (filePath: string, originalContent: string, modifiedContent: string) => {
            this.data = JSON.stringify({
                filePath,
                originalContent,
                modifiedContent,
            });
        };
    resolveData: () => { filePath: string, originalContent: string, modifiedContent: string } =
        () => {
            return JSON.parse(this.data);
        };
}