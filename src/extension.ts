import * as vscode from 'vscode';
import path from 'node:path';
import { register } from 'node:module';
import ChatViewProvider from './webview/webview';

var provider: ChatViewProvider;
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "my-vscode-extendsion" is now active!');
	registeCommand(context);
	registeViewContainer(context);
	registeEvent(context);
}

export function deactivate() { }
function registeCommand(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('deep-ai.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from my-vscode-extendsion!');
	});
	context.subscriptions.push(disposable);

	let getDocDisposable = vscode.commands.registerCommand('deep-ai.getDoc', () => {
		vscode.window.showInformationMessage('Enter get Doc');
	});
	context.subscriptions.push(getDocDisposable);
}
function registeViewContainer(context: vscode.ExtensionContext) {
	provider = new ChatViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider("deep-ai-view", provider));
}


function registeEvent(context: vscode.ExtensionContext) {
	vscode.window.onDidChangeVisibleTextEditors(
		() => {
			provider.emitEvent('changeVisibleTextEditors', vscode.window.activeTextEditor?.document.fileName);
			setTimeout(() => {
				vscode.window.visibleTextEditors.forEach((editor) => {
					console.log(`fileName ${vscode.window.activeTextEditor?.document.fileName}`);
				});
			}, 0);
		},
	);
	// console.log(vscode.workspace.workspaceFolders);// 获得当前工作的workspace信息
	// console.log(vscode.window.activeTextEditor?.document.uri.fsPath);// 获得当前打开的文档的路径
	// console.log(vscode.window.activeTextEditor?.document.getText());// 获得当前打开的文档的内容
}

