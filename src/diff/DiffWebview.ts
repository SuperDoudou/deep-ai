import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionEnv } from '../Constant';
import { Base64 } from 'js-base64';
import VsCodeEventService from '../VsCodeEventService';

export class DiffWebview {

    private static panels: vscode.WebviewPanel[] = [];
    public static disposeAll() {
        for (let panel of this.panels) {
            panel.dispose();
        }
    }

    private static async getHtml(webview: vscode.Webview, filePath: string, originalContent: string, modifiedContent: string): Promise<string> {
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
		<div id="root" filePath="${filePath}" originalContent="${originalContent}" modifiedContent="${modifiedContent}" ></div>
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

    public static show(filePath: string, originalContent: string, modifiedContent: string) {
        let showFilePath = filePath
        originalContent = Buffer.from(originalContent).toString('base64');
        modifiedContent = Buffer.from(modifiedContent).toString('base64');
        filePath = Buffer.from(filePath).toString('base64');
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
        this.panels.push(panel);
        this.getHtml(panel.webview, filePath, originalContent, modifiedContent).then(html => {

            panel.webview.html = html;
        });

        // 处理从Webview发送的消息
        panel.webview.onDidReceiveMessage(message => {
            VsCodeEventService.onEvent(message);
        });
    }
}