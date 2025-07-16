import * as vscode from 'vscode';


// 高亮显示要修改的行
class EditorDecoration {
    private static buttonDecorations = new Map<vscode.TextEditor, vscode.TextEditorDecorationType>();
    private static editorButtons = new Map<vscode.TextEditor, { line: number, range: vscode.Range }[]>();


    public static highlightLine(editor: vscode.TextEditor, lineNumber: number) {
        const line = editor.document.lineAt(lineNumber);
        const range = new vscode.Range(line.range.start, line.range.end);

        // 创建装饰器
        const decorationType = vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            backgroundColor: 'rgba(255,255,0,0.2)',
            border: '1px solid yellow',
            borderWidth: '0 0 0 3px',
            borderColor: 'rgba(255,200,0,0.5)',
            overviewRulerColor: 'rgba(255,200,0,0.7)',
            overviewRulerLane: vscode.OverviewRulerLane.Full
        });

        // 应用装饰
        editor.setDecorations(decorationType, [range]);

        // 滚动到该行
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

        // 5秒后自动移除高亮
        setTimeout(() => {
            decorationType.dispose();
        }, 5000);

        return decorationType;
    }

    // 创建按钮装饰器类型
    public static createButtonDecorationType(): vscode.TextEditorDecorationType {
        return vscode.window.createTextEditorDecorationType({
            after: {
                margin: '0 0 0 10px',
                textDecoration: 'none'
            },
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        });
    }

    // 在指定行添加按钮
    public static addButtonToLine(editor: vscode.TextEditor, lineNumber: number) {
        const line = editor.document.lineAt(lineNumber);

        // 创建装饰器
        const decorationType = EditorDecoration.createButtonDecorationType();

        // 计算按钮位置（行尾）
        const buttonPosition = new vscode.Position(lineNumber, line.text.length);
        const buttonRange = new vscode.Range(buttonPosition, buttonPosition);

        // 创建装饰器选项
        const decoration: vscode.DecorationOptions = {
            range: buttonRange,
            renderOptions: {
                after: {
                    contentText: "✎ 修改",
                    color: new vscode.ThemeColor('button.foreground'),
                    backgroundColor: new vscode.ThemeColor('button.background'),
                    margin: '0 0 0 10px',
                    fontWeight: 'bold',
                }
            }
        };

        // 应用装饰器
        editor.setDecorations(decorationType, [decoration]);

        // 保存按钮信息
        const buttons = this.editorButtons.get(editor) || [];
        buttons.push({ line: lineNumber, range: buttonRange });
        this.editorButtons.set(editor, buttons);
        this.buttonDecorations.set(editor, decorationType);

        // // 高亮行
        // highlightLine(editor, lineNumber);

        // 更新状态栏
        this.updateStatusBar(editor, lineNumber);
    }

    // 更新状态栏按钮
    public static updateStatusBar(editor?: vscode.TextEditor, lineNumber?: number) {
        const acceptButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        const rejectButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);

        if (!editor || lineNumber === undefined) {
            acceptButton.hide();
            rejectButton.hide();
            return;
        }

        const buttons = this.editorButtons.get(editor) || [];
        const hasButton = buttons.some(b => b.line === lineNumber);

        if (hasButton) {
            acceptButton.text = "$(check) 接受修改";
            acceptButton.command = 'extension.acceptLineChange';
            acceptButton.tooltip = "接受当前行的修改建议";
            acceptButton.show();

            rejectButton.text = "$(x) 拒绝修改";
            rejectButton.command = 'extension.rejectLineChange';
            rejectButton.tooltip = "拒绝当前行的修改建议";
            rejectButton.show();
        } else {
            acceptButton.hide();
            rejectButton.hide();
        }
    }
}
export default EditorDecoration;
