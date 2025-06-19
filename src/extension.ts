import * as vscode from 'vscode';
import path from 'node:path';
import { register } from 'node:module';
import ChatViewProvider from './webview/webview';
import EditorDecoration from './editor/EditorDecoration';
import LineActionCodeLensProvider from './editor/LineActionCodeLensProvider';
import EditorService from './editor/EditorService';

var provider: ChatViewProvider;
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "my-vscode-extendsion" is now active!');
	// 注册CodeLens提供器
	initConfig(context)
	registeCodeLens(context);
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

	let textDecorationDisposable = vscode.commands.registerCommand('deep-ai.text', () => {
		vscode.window.showInformationMessage('decoration get text');
		EditorDecoration.highlightLine(vscode.window.activeTextEditor!, 1);
		EditorDecoration.addButtonToLine(vscode.window.activeTextEditor!, 1);
	});
	context.subscriptions.push(textDecorationDisposable);
}
function registeViewContainer(context: vscode.ExtensionContext) {
	provider = new ChatViewProvider(context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider("deep-ai-view", provider));
}


function registeEvent(context: vscode.ExtensionContext) {
	EditorService.init();
	vscode.window.onDidChangeVisibleTextEditors(
		() => {
			setTimeout(() => {
				provider.emitEvent('changeVisibleTextEditors', vscode.window.activeTextEditor?.document.fileName || "");
				vscode.window.visibleTextEditors.forEach((editor) => {
					// console.log(`fileName ${vscode.window.activeTextEditor?.document.fileName}`);
				});
			}, 0);
		},
	);

	// console.log(vscode.workspace.workspaceFolders);// 获得当前工作的workspace信息
	// console.log(vscode.window.activeTextEditor?.document.uri.fsPath);// 获得当前打开的文档的路径
	// console.log(vscode.window.activeTextEditor?.document.getText());// 获得当前打开的文档的内容
}

function registeCodeLens(context: vscode.ExtensionContext) {
	const selector: vscode.DocumentSelector = { scheme: 'deep-ai-diff' };
	const codeLensProvider = LineActionCodeLensProvider.codeLensProviderInstance;
	const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(selector, codeLensProvider);

	// const addSuggestionCommand = vscode.commands.registerCommand('extension.addLineSuggestion', () => {
	// 	const editor = vscode.window.activeTextEditor;
	// 	if (!editor) return;

	// 	const lineNumber = editor.selection.active.line;
	// 	const line = editor.document.lineAt(lineNumber);
	// 	const oldText = line.text;
	// 	const newText = oldText + "new haha";

	// 	codeLensProvider.addSuggestion(lineNumber, oldText, newText);
	// 	vscode.window.showInformationMessage(`已添加第${lineNumber + 1}行的修改建议`);
	// });

	context.subscriptions.push(
		codeLensProviderDisposable,
		// // showDiffCommand,
		// addSuggestionCommand
	);
}

function initConfig(context: vscode.ExtensionContext) {
	vscode.workspace.getConfiguration().update("diffEditor.codeLens", true, false);
}

