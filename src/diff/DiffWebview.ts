import * as vscode from 'vscode';
import * as path from 'path';
import { DiffLoadedEvent, ExtensionEnv, InitDiffEvent, UpdateModifiedTextEvent } from '../Constant';
import { Base64 } from 'js-base64';
import VsCodeEventService from '../VsCodeEventService';

export class DiffWebview {

    private static panels: Map<string, vscode.WebviewPanel> = new Map();
    public static disposeAll() {
        for (let [k, panel] of this.panels) {
            panel.dispose();
        }
    }

    private static async getHtml(webview: vscode.Webview): Promise<string> {
        let isProduction = ExtensionEnv.isProduction === true;

        let srcUrl = '';
        let jsUrl = '';
        let webviewInitUrl = '';
        const extensionFilePath = vscode.Uri.file(path.join(ExtensionEnv.extensionPath!, 'dist', 'static/js/main.js'));
        const webviewInitPath = vscode.Uri.file(path.join(ExtensionEnv.extensionPath!, 'dist/diff/webview', 'webview_init.js'));
        webviewInitUrl = webview.asWebviewUri(webviewInitPath).toString();
        if (isProduction) {
            jsUrl = webview.asWebviewUri(extensionFilePath).toString();
        } else {
            srcUrl = 'http://localhost:3001';
            // srcUrl = panel.webview.asWebviewUri(filePath).toString();
        }
        return `<!doctype html>
  <html lang="en" style="height:100%">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title>webview-react</title>
		<script defer="defer" src="${jsUrl}"></script>
		<script defer="defer" src="${webviewInitUrl}"></script>
	</head>
	<body style="height:95%">
		<div id="root" ></div>
		<iframe
			id="webview-diff-iframe"
			frameborder="0"
			sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads"
			allow="cross-origin-isolated; autoplay; clipboard-read; clipboard-write"
			style="width: 100%;height:100%"
			src="${srcUrl}">
		</iframe>
	</body>
  </html>`;
    }

    public static show(uniqueKey: string, filePath: string | null, originalContent: string | null, modifiedContent: string) {
        if (this.panels.has(uniqueKey)) {
            let panel = this.panels.get(uniqueKey);
            if (!panel) {
                return;
            }
            let event = new UpdateModifiedTextEvent();
            event.injectData(modifiedContent);
            VsCodeEventService.emitDiffEvent(event, panel.webview);
            return;
        }
        if (!filePath || !originalContent) {
            console.error('DiffWebview show error, filePath or originalContent is null');
            return;
        }
        let showFilePath = filePath;
        const panel = vscode.window.createWebviewPanel(
            'monacoWebview',
            'preview:' + showFilePath,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                // localResourceRoots: [
                //     vscode.Uri.file(path.join(context.extensionPath, 'node_modules'))
                // ]
            }
        );
        this.panels.set(uniqueKey, panel);
        this.getHtml(panel.webview).then(html => {
            panel.webview.html = html;
        });

        // 处理从Webview发送的消息
        panel.webview.onDidReceiveMessage(message => {
            if (message.name === new DiffLoadedEvent().name) {

                let event = new InitDiffEvent();
                event.injectData(filePath, originalContent, modifiedContent);
                VsCodeEventService.emitDiffEvent(event, panel.webview);
            }
            VsCodeEventService.onEvent(message);
        });
    }
}