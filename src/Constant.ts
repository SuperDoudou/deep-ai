import { ModelItem } from "./chat/app/GlobalStateProvider";
import { WebviewInitData } from "./chat/webview/ChatWebview";
import { Base64 } from 'js-base64';

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
        if (name === "acceptCurrentEditorText") {
            e = new AcceptCurrentEditorTextEvent();
        }
        if (name === "initDiff") {
            e = new InitDiffEvent();
        }
        if (name === "initChat") {
            e = new InitChatEvent();
        }
        if (name === "updateModel") {
            e = new UpdateModelEvent();
        }
        if (name === "updatePromptTemplate") {
            e = new UpdatePromptTemplateEvent();
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
                fileText
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

export class InitChatEvent implements DeepAiEvent {
    name: string = "initChat";
    from: string = "vscode";
    description: string = "vscode 向 chat webview 发送当前编辑器文本";
    data: string = "";
    injectData: (initData: WebviewInitData) => void =
        (initData: WebviewInitData) => {
            this.data = JSON.stringify(initData);
        };
    resolveData: () => WebviewInitData =
        () => {
            return JSON.parse(Base64.decode(this.data));
        };
}


export class UpdateModelEvent implements DeepAiEvent {
    name: string = "updateModel";
    from: string = "chat";
    description: string = "chat webview 向 vscode 发送当前模型";
    data: string = "";
    injectData: (models: ModelItem[]) => void =
        (models: ModelItem[]) => {
            this.data = JSON.stringify(models);
        };
    resolveData: () => ModelItem[] =
        () => {
            return JSON.parse(this.data);
        };
}



export class UpdatePromptTemplateEvent implements DeepAiEvent {
    name: string = "updatePromptTemplate";
    from: string = "chat";
    description: string = "chat webview 向 vscode 发送当前prompt";
    data: string = "";
    injectData: (prompt: string) => void =
        (prompt: string) => {
            this.data = prompt;
        };
    resolveData: () => string =
        () => {
            return this.data;
        };
}