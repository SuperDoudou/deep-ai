import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionEnv } from '../Constant';

export class DiffWebview {

    private static async getHtml(webview: vscode.Webview): Promise<string> {

        let isProduction = ExtensionEnv.isProduction === true;

        let srcUrl = '';
        let jsUrl = '';
        let webviewInitUrl = '';
        const filePath = vscode.Uri.file(path.join(ExtensionEnv.extensionPath!, 'dist', 'static/js/main.js'));
        const webviewInitPath = vscode.Uri.file(path.join(ExtensionEnv.extensionPath!, 'dist/webview', 'webview_init.js'));
        webviewInitUrl = webview.asWebviewUri(webviewInitPath).toString();
        if (isProduction) {
            jsUrl = webview.asWebviewUri(filePath).toString();
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
		<div id="root"></div>
		<iframe
			id="webview-patch-iframe"
			frameborder="0"
			sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads"
			allow="cross-origin-isolated; autoplay; clipboard-read; clipboard-write"
			style="width: 100%;height:100%"
			src="${srcUrl}">
		</iframe>
	</body>
  </html>`;
    }

    public static show(context: vscode.ExtensionContext) {
        const panel = vscode.window.createWebviewPanel(
            'monacoWebview',
            'Monaco Editor',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                // localResourceRoots: [
                //     vscode.Uri.file(path.join(context.extensionPath, 'node_modules'))
                // ]
            }
        );

        this.getHtml(panel.webview).then(html => {
            panel.webview.html = html;
        });

        // 处理从Webview发送的消息
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'contentChange':
                    vscode.window.showInformationMessage(`Content changed: ${message.text.length} chars`);
                    break;
            }
        });
    }
}