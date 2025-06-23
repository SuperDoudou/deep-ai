import * as vscode from 'vscode';
import ChangeInfo, { ChangeContext } from './EditorConstant';


class LineActionCodeLensProvider implements vscode.CodeLensProvider {

    public static codeLensProviderInstance = new LineActionCodeLensProvider();

    private eventEmitter = new vscode.EventEmitter<void>();
    private changeContext: ChangeContext = {
        originalUri: vscode.Uri.parse(''),
        modifiedUri: vscode.Uri.parse(''),
        originalText: '',
        modifiedText: '',
        changes: []
    }
    onDidChangeCodeLenses = this.eventEmitter.event;

    clear() {
        this.changeContext = {
            originalUri: vscode.Uri.parse(''),
            modifiedUri: vscode.Uri.parse(''),
            originalText: '',
            modifiedText: '',
            changes: []
        }
        this.eventEmitter.fire(); // 触发更新
    }
    addChanges(changeContext: ChangeContext) {
        this.changeContext = changeContext;
        this.eventEmitter.fire(); // 触发更新
    }

    // 提供CodeLens
    provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
        const lenses: vscode.CodeLens[] = [];
        let hasPush = new Map<number, boolean>();
        for (const change of this.changeContext.changes) {
            const line = change.modifiedRange.start.line;
            // const range = new vscode.Range(line.range.start, line.range.end);

            let pushed = hasPush.get(line);
            if (pushed) {
                continue;
            } else {
                hasPush.set(line, true);
            }
            lenses.push(
                new vscode.CodeLens(new vscode.Range(
                    change.modifiedRange.start.line - 1,
                    0,
                    change.modifiedRange.end.line - 1,
                    0
                ), {
                    title: "✅接受修改",
                    command: "deep-ai.acceptLineChange",
                    arguments: [line, this.changeContext]
                }),
                new vscode.CodeLens(new vscode.Range(
                    change.modifiedRange.start.line - 1,
                    0,
                    change.modifiedRange.end.line - 1,
                    0
                ), {
                    title: "❌拒绝修改",
                    command: "deep-ai.rejectLineChange",
                    arguments: [line, this.changeContext]
                })
            );
        }
        return lenses;
    }
}
export default LineActionCodeLensProvider;
