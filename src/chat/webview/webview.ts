import * as vscode from 'vscode';
import path from 'node:path';
import { register } from 'node:module';
import { DeepAiEvent, ExtensionEnv } from '../../Constant';
import VsCodeEventService from '../../VsCodeEventService';

type InnerMessage = {
	from: string; // extension|webview|react
	eventName: string; // 事件名称，如：getCurrentFileName
	data: string; // 数据，如：文件名
};


class ChatViewProvider implements vscode.WebviewViewProvider {

	private _context: vscode.ExtensionContext;
	private _view?: vscode.WebviewView;

	public getView() {
		return this._view;
	}
	constructor(private context: vscode.ExtensionContext) {
		this._context = context;
	}

	public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken,) {

		webviewView.webview.html = getWebviewContent(this.context, webviewView.webview);
		webviewView.webview.options = {
			enableScripts: true
		};
		webviewView.webview.onDidReceiveMessage(
			(message: DeepAiEvent) => {
				if (message.from.startsWith("vscode")) {
					return;
				}
				console.log(`[webview provider] on event ${message.from}, ${message.name}, ${message.data}`);
				VsCodeEventService.onEvent(message);
			}
		);
		this._view = webviewView;
		webviewView.onDidDispose(
			() => { },
			null,
			this.context.subscriptions,
		);

	}

	// public emitEvent(eventName: string, data: string) {
	// 	console.log('[webview provider] emit event', eventName, data);
	// 	let m: InnerMessage = {
	// 		from: eventName.,
	// 		eventName: eventName,
	// 		data: data
	// 	};
	// 	this._view?.webview.postMessage(m);
	// }
}


function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview | null) {
	let isProduction = ExtensionEnv.isProduction === true;
	let srcUrl = '';
	let jsUrl = '';
	let webviewInitUrl = '';
	const filePath = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'static/js/main.js'));
	const webviewInitPath = vscode.Uri.file(path.join(context.extensionPath, 'dist/chat/webview', 'webview_init.js'));
	if (webview) {
		webviewInitUrl = webview.asWebviewUri(webviewInitPath).toString();
	}
	if (isProduction) {
		if (webview) {
			jsUrl = webview.asWebviewUri(filePath).toString();
		}
	} else {
		srcUrl = 'http://localhost:3000';
		// srcUrl = panel.webview.asWebviewUri(filePath).toString();
	}
	//  <script defer="defer" src="${srcUri}"></script>

	//<iframe sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads" src="${srcUri}"></iframe>
	/*<iframe
  id="webview-patch-iframe"
  frameborder="0"
  sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads"
  allow="cross-origin-isolated; autoplay; clipboard-read; clipboard-write"
  src="${srcUri}"
></iframe>*/
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


export default ChatViewProvider;