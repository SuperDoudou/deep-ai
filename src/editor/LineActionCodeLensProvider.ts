import * as vscode from 'vscode';


class LineActionCodeLensProvider implements vscode.CodeLensProvider {
    public static codeLensProviderInstance = new LineActionCodeLensProvider();

    private suggestions: Map<number, { oldText: string, newText: string }> = new Map();
    private eventEmitter = new vscode.EventEmitter<void>();

    onDidChangeCodeLenses = this.eventEmitter.event;

    // 添加修改建议
    addSuggestion(lineNumber: number, oldText: string, newText: string) {
        this.suggestions.set(lineNumber, { oldText, newText });
        this.eventEmitter.fire(); // 触发更新
    }

    // 移除修改建议
    removeSuggestion(lineNumber: number) {
        this.suggestions.delete(lineNumber);
        this.eventEmitter.fire(); // 触发更新
    }

    // 提供CodeLens
    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const lenses: vscode.CodeLens[] = [];

        for (const [lineNumber, suggestion] of this.suggestions) {
            if (lineNumber >= document.lineCount) { continue; }

            const line = document.lineAt(lineNumber);
            const range = new vscode.Range(line.range.start, line.range.end);

            // 添加操作按钮
            lenses.push(
                new vscode.CodeLens(range, {
                    title: "✅接受修改",
                    command: "extension.acceptLineChange",
                    arguments: [lineNumber, suggestion.oldText, suggestion.newText]
                }),
                new vscode.CodeLens(range, {
                    title: "❌拒绝修改",
                    command: "extension.rejectLineChange",
                    arguments: [lineNumber]
                }),
            );

        }

        return lenses;
    }
}
export default LineActionCodeLensProvider;
