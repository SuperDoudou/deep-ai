import * as vscode from 'vscode';
import VsCodeEventService from '../VsCodeEventService';
import { UpdateCurrentEditorTextEvent } from '../Constant';
import * as diff from 'diff';
import * as path from 'path';
import LineActionCodeLensProvider from './LineActionCodeLensProvider';
interface ChangeInfo {
    id: string;
    range: vscode.Range;
    originalLines: string[];
    modifiedLines: string[];
}

// 高亮显示要修改的行
class EditorService {
    private static changeStates = new Map<string, Map<string, 'applied' | 'rejected'>>();

    // 计算变更
    public static calculateChanges(original: string, modified: string): ChangeInfo[] {
        // 获取当前所有可见编辑器
        const diffEditors = vscode.window.visibleTextEditors.filter(e =>
            e.document.uri.scheme === 'deep-ai-diff' ||
            e.document.uri.scheme === 'file'
        );

        // 获取左侧（原始）和右侧（修改后）的编辑器
        const [leftEditor, rightEditor] = diffEditors;

        // 通过API获取差异范围（需要VSCode 1.70+）
        const diffRanges = (rightEditor as any)?.diffRanges?.[leftEditor.document.uri.toString()];





        const diffResult = diff.diffLines(original, modified, {
            newlineIsToken: true,    // 将换行符视为独立token
            ignoreWhitespace: false // 不忽略空白字符
        });

        const changes: ChangeInfo[] = [];
        let changeIndex = 0;

        // 使用最长匹配算法处理差异
        const patch = diff.createPatch('file', original, modified, '', '', { context: 0 });
        const hunks = patch.split('\n').filter(line => line.startsWith('@@'));

        hunks.forEach(hunk => {
            // 改进正则表达式匹配hunk元数据
            const hunkInfo = hunk.match(/@@ \-(\d+),?(\d*) \+(\d+),?(\d*) @@/);
            if (hunkInfo) {
                const newStartLine = parseInt(hunkInfo[3]) - 1;
                const lineCount = parseInt(hunkInfo[4]) || 1;  // 处理单行变更情况

                // 获取完整的修改行内容
                const modifiedLines = modified.split('\n')
                    .slice(newStartLine, newStartLine + lineCount)
                    .filter(line => !line.startsWith('-'));  // 过滤被删除的行

                const range = new vscode.Range(
                    new vscode.Position(newStartLine, 0),
                    new vscode.Position(newStartLine + modifiedLines.length, 0)
                );

                changes.push({
                    id: `change-${changeIndex++}`,
                    range,
                    originalLines: [],
                    modifiedLines
                });
            }
        });

        return changes;
    }


    public static addDiffCodeLenses(originalUri: vscode.Uri, originalContent: string, modifiedContent: string) {
        const editors = vscode.window.visibleTextEditors;
        if (editors.length < 2) return;

        // 找到右侧编辑器（修改后的版本）
        const rightEditor = editors.find(e =>
            e.document.uri.scheme === 'deep-ai-diff'
            //  && e.viewColumn === vscode.ViewColumn.Two
        );

        if (!rightEditor) return;

        const changes = EditorService.calculateChanges(originalContent, modifiedContent);
        const uri = originalUri.toString();
        const fileStates = EditorService.changeStates.get(uri) || new Map();

        // 为每个变更创建CodeLens
        changes.forEach(change => {
            const state = fileStates.get(change.id);
            const isApplied = state === 'applied';
            const isRejected = state === 'rejected';
            LineActionCodeLensProvider.codeLensProviderInstance.addSuggestion(change.range.start.line, "nnn", "ooo")
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

    public static generateMergedContent(original: string, modified: string, states: Map<string, 'applied' | 'rejected'>): string {
        const diffResult = diff.diffLines(original, modified);
        let result = '';
        let changeIndex = 0;

        diffResult.forEach(part => {
            if (part.added) {
                const state = states.get(changeIndex.toString()) || 'applied';
                if (state === 'applied') {
                    result += part.value;
                }
                changeIndex++;
            } else if (!part.removed) {
                result += part.value;
            }
        });

        return result;
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
    public static init() {

        let updateCurrentEditorText = new UpdateCurrentEditorTextEvent();
        VsCodeEventService.registerEvent(updateCurrentEditorText.name,
            (event) => {
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
                const modifiedContent = EditorService.generateModifiedContent(originalContent);

                // 创建虚拟文档URI
                let type = EditorService.getFileExtension(document.uri.path)
                const virtualUri = document.uri.with({
                    scheme: 'deep-ai-diff',
                    path: document.uri.path + '.modified' + (type === "" ? "" : "." + type),
                    query: `original=${encodeURIComponent(document.uri.toString())}`
                });

                // 注册内容提供者
                vscode.workspace.registerTextDocumentContentProvider('deep-ai-diff', {
                    provideTextDocumentContent: (uri) => {
                        const originalUri = vscode.Uri.parse(new URLSearchParams(uri.query).get('original') || '');
                        const fileStates = EditorService.changeStates.get(originalUri.toString()) || new Map();

                        // 如果已经保存了状态，使用合并后的内容
                        if (fileStates.size > 0) {
                            return EditorService.generateMergedContent(originalContent, modifiedContent, fileStates);
                        }

                        return modifiedContent;
                    }
                });

                // 打开diff视图
                vscode.commands.executeCommand('vscode.diff',
                    document.uri,
                    virtualUri,
                    `比较: ${path.basename(filePath)}`
                );

                // 计算差异并添加按钮
                // setTimeout(() => EditorService.addDiffButtons(document.uri, originalContent, modifiedContent), 500);
                setTimeout(() => EditorService.addDiffCodeLenses(virtualUri, originalContent, modifiedContent), 500);
            }
        );
    }

}
export default EditorService;
