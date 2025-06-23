import * as vscode from 'vscode';
import VsCodeEventService from '../VsCodeEventService';
import { DeepAiEvent, UpdateCurrentEditorTextEvent } from '../Constant';
import * as path from 'path';
import LineActionCodeLensProvider from './LineActionCodeLensProvider';
import * as diff from 'diff-match-patch';
interface ChangeInfo {
    id: string;
    originalRange: vscode.Range;// 老文件对应的改动点
    modifiedRange: vscode.Range;// 新文件对应的改动点
    originalLines: string[];
    modifiedLines: string[];
    type: 'add' | 'del' | 'modify'; // 明确类型定义
}

// 高亮显示要修改的行
class EditorService {
    private static changeStates = new Map<string, Map<string, 'applied' | 'rejected'>>();

    public static calculateChanges(original: string, modified: string): ChangeInfo[] {
        // 计算original的缩进符号
        



        original = original + '\n';

        const dmp = new diff.diff_match_patch();
        dmp.Match_Threshold = 1;
        const chars = dmp.diff_linesToChars_(original, modified);
        const lineText1 = chars.chars1;
        const lineText2 = chars.chars2;
        const lineArray = chars.lineArray;
        let diffs = dmp.diff_main(lineText1, lineText2, false);
        dmp.diff_charsToLines_(diffs, lineArray);
        // dmp.diff_cleanupSemantic(diffs);

        const changes: ChangeInfo[] = [];
        let changeIndex = 0;
        let originalLineNum = 0;
        let modifiedLineNum = 0;

        for (let i = 0; i < diffs.length; i++) {
            let part = diffs[i];
            let type = part[0];
            let text = part[1];
            const lines = text.split('\n');
            lines.pop(); // 移除最后的空行
            if (type === diff.DIFF_DELETE) {
                // 删除类型变更
                changes.push({
                    id: `del-${changeIndex++}`,
                    originalRange: new vscode.Range(
                        new vscode.Position(originalLineNum, 0),
                        new vscode.Position(originalLineNum + lines.length, 0)
                    ),
                    modifiedRange: new vscode.Range(
                        new vscode.Position(modifiedLineNum, 0),
                        new vscode.Position(modifiedLineNum + lines.length, 0)
                    ),
                    originalLines: lines,
                    modifiedLines: [],
                    type: 'del'
                });
                originalLineNum += lines.length;
            }
            else if (type === diff.DIFF_INSERT) {
                // 新增类型变更
                changes.push({
                    id: `add-${changeIndex++}`,
                    originalRange: new vscode.Range(
                        new vscode.Position(originalLineNum, 0),
                        new vscode.Position(originalLineNum + lines.length, 0)
                    ),
                    modifiedRange: new vscode.Range(
                        new vscode.Position(modifiedLineNum, 0),
                        new vscode.Position(modifiedLineNum + lines.length, 0)
                    ),
                    originalLines: [],
                    modifiedLines: lines,
                    type: 'add'
                });
                modifiedLineNum += lines.length;
            }
            else {
                originalLineNum += lines.length;
                modifiedLineNum += lines.length;
            }
        }

        return changes;
    }

    public static addDiffCodeLenses(originalUri: vscode.Uri, originalContent: string, modifiedContent: string) {
        const editors = vscode.window.visibleTextEditors;
        if (editors.length < 2) { return; }

        // 找到右侧编辑器（修改后的版本）
        const rightEditor = editors.find(e =>
            e.document.uri.scheme === 'deep-ai-diff'
            //  && e.viewColumn === vscode.ViewColumn.Two
        );

        if (!rightEditor) { return; }

        const changes = EditorService.calculateChanges(originalContent, modifiedContent);
        const uri = originalUri.toString();
        const fileStates = EditorService.changeStates.get(uri) || new Map();

        // 为每个变更创建CodeLens
        changes.forEach(change => {
            const state = fileStates.get(change.id);
            const isApplied = state === 'applied';
            const isRejected = state === 'rejected';
            LineActionCodeLensProvider.codeLensProviderInstance.addSuggestion(change.modifiedRange.start.line, "nnn", "ooo")
            // 应用装饰器显示状态
            // const decorationType = vscode.window.createTextEditorDecorationType({
            //     isWholeLine: true,
            //     backgroundColor: isApplied ? 'rgba(76, 175, 80, 0.1)' :
            //         isRejected ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 193, 7, 0.1)',
            //     border: isApplied ? '1px solid rgba(76, 175, 80, 0.3)' :
            //         isRejected ? '1px solid rgba(244, 67, 54, 0.3)' :
            //             '1px solid rgba(255, 193, 7, 0.3)',
            //     borderLeft: isApplied ? '3px solid rgba(76, 175, 80, 0.8)' :
            //         isRejected ? '3px solid rgba(244, 67, 54, 0.8)' :
            //             '3px solid rgba(255, 193, 7, 0.8)'
            // });

            // rightEditor.setDecorations(decorationType, [change.range]);
        });
    }

    private static getFileExtension(filename: string): string {
        // 处理边界情况：空字符串、无点号、点号在开头/结尾
        if (!filename.includes('.')) { return ''; }

        // 找到最后一个点号的位置
        const lastDotIndex = filename.lastIndexOf('.');

        // 确保点号不在字符串开头或结尾
        if (lastDotIndex === 0 || lastDotIndex === filename.length - 1) { return ''; }

        return filename.slice(lastDotIndex + 1);
    }

    // 生成修改建议内容
    public static generateModifiedContent(original: string): string {
        // 这里使用简单的替换作为示例
        return original
            .replace(/console\.log\(/g, 'logger.info(')
            .replace(/var /g, 'let ')
            .replace(/function ([^(]+)\(/g, 'const $1 = (')
            .replace(/\)\s*{/g, ') => {')
            + '\n\n// 添加的安全检查函数\nfunction safeAccess(obj, path) {\n  return path.split(\'.\').reduce((acc, part) => acc && acc[part], obj);\n}';
    }

    private static modifiedContent = "";
    public static init() {
        let updateCurrentEditorText = new UpdateCurrentEditorTextEvent();
        // 注册内容提供者
        vscode.workspace.registerTextDocumentContentProvider('deep-ai-diff', {
            provideTextDocumentContent: (uri) => {
                const originalUri = vscode.Uri.parse(new URLSearchParams(uri.query).get('original') || '');
                return EditorService.modifiedContent;
            }
        });
        VsCodeEventService.registerEvent(updateCurrentEditorText.name,
            (messageEvent) => {
                let event: UpdateCurrentEditorTextEvent = DeepAiEvent.fromEventName(messageEvent.name, messageEvent.data);

                LineActionCodeLensProvider.codeLensProviderInstance.clearSuggestions();
                console.log(`get information22 ${event.resolveData()}`);
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showErrorMessage('没有活动的文本编辑器');
                    return;
                }

                const document = editor.document;
                const filePath = document.uri.fsPath;
                const originalContent = document.getText();

                // 生成修改建议
                const data = event.resolveData();
                EditorService.modifiedContent = data.fileText;
                // 创建虚拟文档URI
                let type = EditorService.getFileExtension(document.uri.path);
                const virtualUri = document.uri.with({
                    scheme: 'deep-ai-diff',
                    path: document.uri.path + '.modified' + Date.now() + (type === "" ? "" : "." + type),
                    query: `original=${encodeURIComponent(document.uri.toString())}`
                });



                // 打开diff视图
                vscode.commands.executeCommand('vscode.diff',
                    document.uri,
                    virtualUri,
                    `比较: ${path.basename(filePath)}`
                );

                // 计算差异并添加按钮
                // setTimeout(() => EditorService.addDiffButtons(document.uri, originalContent, modifiedContent), 500);
                setTimeout(() => EditorService.addDiffCodeLenses(virtualUri, originalContent, EditorService.modifiedContent), 500);
            }
        );
    }

}
export default EditorService;