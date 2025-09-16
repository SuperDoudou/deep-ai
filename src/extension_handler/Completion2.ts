import * as vscode from 'vscode';
import { LLMService } from './LLMService';

/**
 * 处理智能提示
 */
class CompletionHandler2 {
    static registerInlineComplete = () => {
        return vscode.languages.registerInlineCompletionItemProvider({
            pattern: '**/*.{go,ts,tsx,js,jsx}',
        }, {
            async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position,
                context: vscode.InlineCompletionContext, token: vscode.CancellationToken) {
                const lineText = document.lineAt(position).text;
                if (lineText === '') {
                    return [];
                }
                const respData = "This is inline completion \nprovider"
                const items: vscode.InlineCompletionItem[] = [];
                const completionItem = new vscode.InlineCompletionItem('');
                const content = '\n' + respData;
                completionItem.insertText = '\n' + respData;
                completionItem.range = new vscode.Range(position, position);
                items.push(completionItem);
                return items;
            }
        });
    }
}

export default CompletionHandler2;