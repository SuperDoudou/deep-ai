import * as vscode from 'vscode';
import path from 'node:path';
import { register } from 'node:module';
import { DeepAiEvent, ExtensionEnv } from '../../Constant';
import VsCodeEventService from '../../VsCodeEventService';
import { ModelItem } from '../app/GlobalStateProvider';
import VsCodeStorageService from '../../VsCodeStorageService';

export interface WebviewInitData {
	modelList: ModelItem[]
	promptTemplate: string
}

class ChatViewProvider implements vscode.WebviewViewProvider {

	private _context: vscode.ExtensionContext;
	private _view?: vscode.WebviewView;
	private _initData: WebviewInitData;

	public getView() {
		return this._view;
	}
	constructor(private context: vscode.ExtensionContext) {
		this._context = context;
		this._initData = VsCodeStorageService.GetChatWebviewInitData();
	}

	public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken,) {

		webviewView.webview.html = getWebviewContent(this.context, webviewView.webview, this._initData);
		webviewView.webview.options = {
			enableScripts: true,
			enableCommandUris: true,
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


function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview | null, initData: WebviewInitData) {
	let isProduction = ExtensionEnv.isProduction === true;
	// let isProduction = true
	let srcUrl = '';
	let jsUrl = '';
	let webviewInitUrl = '';
	let initDataBase64 = Buffer.from(JSON.stringify(initData)).toString('base64');
	const filePath = vscode.Uri.file(path.join(context.extensionPath, 'dist_react', 'static/js/main.js'));
	const webviewInitPath = vscode.Uri.file(path.join(context.extensionPath, 'dist/chat/webview', 'webview_init.js'));
	if (webview) {
		webviewInitUrl = webview.asWebviewUri(webviewInitPath).toString();
	}
	if (isProduction) {
		if (webview) {
			jsUrl = webview.asWebviewUri(filePath).toString();
		}
	} else {
		// srcUrl = "https://www.baidu.com"
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
		<div id="root" initdata="${initDataBase64}"></div>
		<iframe
			id="webview-patch-iframe"
			frameborder="0"
			sandbox="allow-same-origin allow-pointer-lock allow-scripts allow-downloads allow-forms"
			allow="cross-origin-isolated; autoplay; clipboard-read; clipboard-write;"
			style="width: 100%;height:100%"
			src="${srcUrl}">
		</iframe>
	</body>
  </html>`;
}


export default ChatViewProvider;