import * as vscode from 'vscode';
import path from 'node:path';
import { register } from 'node:module';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "my-vscode-extendsion" is now active!');
	registeCommand(context);
	registeViewContainer(context);



}

export function deactivate() { }

function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview | null) {
	let isProduction = context.extensionMode === vscode.ExtensionMode.Production;
	let srcUrl = '';
	let jsUrl = '';
	const filePath = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'static/js/main.js'));
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
		<script>
			const iframe = document.getElementById('webview-patch-iframe');
			iframe.onload = function() {
				message = Array.from(document.styleSheets)
					.map(sheet => {
						try {
							return Array.from(sheet.cssRules).map(rule => {
								// rule.cssText => html { scrollbar-color: var(--vscode-scrollbarSlider-background) var(--vscode-editor-background); 
								const replacedString = rule.cssText.replace(/var\(([^)]+)\)/g, (match, varName) => {
									return getComputedStyle(iframe).getPropertyValue(varName.substring(1)) || match; // 如果变量不在 map 里，保留原样
								});    
								return replacedString+ " "
							}).join('');
							
						} catch (e) {
							return '';
						}
					})
					.join('');
                iframe.contentWindow.postMessage(message, "http://localhost:3000");
			};
		</script>
	</body>
  </html>`;
}

function registeCommand(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('deep-ai.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from my-vscode-extendsion!');

		const panel = vscode.window.createWebviewPanel(
			'React',
			'React App',
			vscode.ViewColumn.One,
			{
				retainContextWhenHidden: true, // 保证 Webview 所在页面进入后台时不被释放
				enableScripts: true, // 运行 JS 执行
			}
		);


		panel.webview.html = getWebviewContent(context, panel.webview);

		// const updateWebview = () => {
		// 	panel.webview.html = getWebviewContent(srcUrl);
		// };
		// updateWebview();
		// const interval = setInterval(updateWebview, 1000);

		// panel.onDidDispose(
		// 	() => {
		// 		clearInterval(interval);
		// 	},
		// 	null,
		// 	context.subscriptions,
		// );
	});
	context.subscriptions.push(disposable);
}
function registeViewContainer(context: vscode.ExtensionContext) {
	const provider = new ChatViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider("deep-ai-view", provider));
}

class ChatViewProvider implements vscode.WebviewViewProvider {

	private _context: vscode.ExtensionContext;
	constructor(private context: vscode.ExtensionContext) {
		this._context = context;
	}

	public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken,) {

		webviewView.webview.html = getWebviewContent(this.context, webviewView.webview);
		webviewView.webview.options = {
			enableScripts: true
		}
		webviewView.onDidDispose(
			() => {

			},
			null,
			this.context.subscriptions,
		);

	}
}
