import * as vscode from 'vscode';
import path from 'node:path';
import { register } from 'node:module';
import { ChangeVisibleTextEditorsEvent, ChatLoadedEvent, DeepAiEvent, ExtensionEnv, InitChatEvent } from '../../Constant';
import VsCodeEventService from '../../VsCodeEventService';
import { ModelItem } from '../app/GlobalStateProvider';
import VsCodeStorageService from '../../VsCodeStorageService';

export interface WebviewInitData {
	modelList: ModelItem[]
	promptTemplate: string
	filePath: string
	fileText: string
}

class ChatViewProvider implements vscode.WebviewViewProvider {

	private _context: vscode.ExtensionContext;
	private _view?: vscode.WebviewView;

	public getView() {
		return this._view;
	}
	constructor(private context: vscode.ExtensionContext) {
		console.log("ChatViewProvider constructor");
		this._context = context;
		VsCodeEventService.registerEvent(new ChatLoadedEvent().name, (event: ChatLoadedEvent) => {
			let initData = VsCodeStorageService.GetChatWebviewInitData();
			initData.filePath = vscode.window.activeTextEditor?.document.fileName || "";
			initData.fileText = vscode.window.activeTextEditor?.document.getText() || "";
			let e = new InitChatEvent();
			e.injectData(initData);
			VsCodeEventService.emitChatEvent(e);
		})
	}

	public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken,) {
		let initData = VsCodeStorageService.GetChatWebviewInitData();
		initData.filePath = vscode.window.activeTextEditor?.document.fileName || "";
		initData.fileText = vscode.window.activeTextEditor?.document.getText() || "";

		webviewView.webview.html = getWebviewContent(this.context, webviewView.webview);
		webviewView.webview.options = {
			enableScripts: true,
			enableCommandUris: true,
		};
		webviewView.webview.onDidReceiveMessage(
			(message: DeepAiEvent) => {
				if (message.from.startsWith("vscode")) {
					return;
				}
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
	let isProduction = ExtensionEnv.isProduction;
	let srcUrl = '';
	let jsUrl = '';
	let webviewInitUrl = '';
	const filePath = vscode.Uri.file(path.join(context.extensionPath, 'dist_react/chat', 'static/js/main.js'));
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
	let html = `<!doctype html>
  <html lang="en" style="height:100%">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title>webview-react</title>
		<script defer="defer" src="${jsUrl}"></script>
		<script defer="defer" src="${webviewInitUrl}"></script>
	</head>
	<body style="height:95%">`;
	if (isProduction) {
		html += `<div id="root" style="width: 100%;height:100%">i'm in</div>`;
	} else {
		html += `<iframe
			id="webview-patch-iframe"
			frameborder="0"
			sandbox="allow-same-origin allow-pointer-lock allow-scripts allow-downloads allow-forms"
			allow="cross-origin-isolated; autoplay; clipboard-read; clipboard-write;"
			style="width: 100%;height:100%"
			src="${srcUrl}">
		</iframe>`;
	}
	html += `</body>
  </html>`;
	console.log(html);
	return html;
}


export default ChatViewProvider;