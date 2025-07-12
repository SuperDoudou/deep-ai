import * as vscode from 'vscode';
import VsCodeEventService from '../VsCodeEventService';
import { AcceptCurrentEditorTextEvent, DeepAiEvent, UpdateCurrentEditorTextEvent } from '../Constant';
import * as path from 'path';
import LineActionCodeLensProvider from './LineActionCodeLensProvider';
import * as diff from 'diff-match-patch';
import { Uri } from 'vscode';
import { Base64 } from 'js-base64';
import EditorUtils from './EditorUtils';
import { ChangeContext, ChangeInfo } from './EditorConstant';
import { DiffWebview } from '../diff/DiffWebview';


// 高亮显示要修改的行
class EditorService {

    public static dealChange(line: number, accept: boolean, changeContext: ChangeContext) {
        const changes = changeContext.changes;

        // 查找所有匹配行号的变更（支持重叠变更）
        const matchedChanges = changes.filter(c =>
            c.modifiedRange.start.line <= line &&
            c.modifiedRange.end.line >= line
        );

        if (matchedChanges.length === 0) return;

        let content = changeContext.originalText.split('\n');
        let originalOffset = 0;
        // 按变更位置倒序处理（避免行号变化影响后续处理）
        matchedChanges.sort((a, b) => b.modifiedRange.start.line - a.modifiedRange.start.line)
            .forEach(change => {
                if (change.type === 'add' && accept) {
                    const insertPos = change.originalRange.end.line - 1 + originalOffset;
                    content.splice(insertPos, 0, ...change.modifiedLines);
                } else if (change.type === 'del') {
                    if (accept) {
                        content.splice(
                            change.originalRange.start.line - 1,
                            change.originalRange.end.line - change.originalRange.start.line
                        );
                        originalOffset -= change.originalRange.end.line - change.originalRange.start.line;
                    } else {
                        content.splice(
                            change.modifiedRange.start.line - 1,
                            0,
                            ...change.originalLines
                        );
                    }
                }
            });

        // 更新上下文内容
        changeContext.originalText = content.join('\n');
        changeContext.modifiedText = content.join('\n');

        // 写入文件并刷新视图
        vscode.workspace.fs.writeFile(changeContext.originalUri, Buffer.from(content.join('\n')));


        vscode.commands.executeCommand("workbench.action.closeActiveEditor");
        vscode.window.showTextDocument(changeContext.originalUri);
    }


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
        let originalLineNum = 1;
        let modifiedLineNum = 1;

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
                        new vscode.Position(modifiedLineNum, 0)
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
                        new vscode.Position(originalLineNum, 0)
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

    public static addDiffCodeLenses(originalUri: vscode.Uri, originalContent: string,
        modifiedUri: vscode.Uri, modifiedContent: string) {
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
        const changeContext: ChangeContext = {
            originalUri: originalUri,
            originalText: originalContent,
            modifiedUri: modifiedUri,
            modifiedText: modifiedContent,
            changes: changes
        };
        // 为每个变更创建CodeLens
        LineActionCodeLensProvider.codeLensProviderInstance.addChanges(changeContext);
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
        VsCodeEventService.registerEvent(new UpdateCurrentEditorTextEvent().name,
            (messageEvent: UpdateCurrentEditorTextEvent) => {
                const data = messageEvent.resolveData();
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    DiffWebview.show(data.uniqueKey, null, null, data.fileText);
                    return;
                }
                // data.fileText = Base64.decode("ewogICJjb21waWxlck9wdGlvbnMiOiB7CiAgICAibW9kdWxlIjogIk5vZGUxNiIsCiAgICAidGFyZ2V0IjogIkVTMjAyMiIsCiAgICAibGliIjogWyJFUzIwMjIiLCAiRE9NIiwgIkRPTS5JdGVyYWJsZSJdLAogICAgInNvdXJjZU1hcCI6IHRydWUsCiAgICAicm9vdERpciI6ICJzcmMiLAogICAgImpzeCI6ICJyZWFjdCIsCiAgICAic3RyaWN0IjogdHJ1ZSwKICAgICJub0ltcGxpY2l0UmV0dXJucyI6IHRydWUsCiAgICAibm9GYWxsdGhyb3VnaENhc2VzSW5Td2l0Y2giOiB0cnVlLAogICAgIm5vVW51c2VkUGFyYW1ldGVycyI6IHRydWUsCiAgICAib3V0RGlyIjogIi4vZGlzdCIsCiAgICAiYmFzZVVybCI6ICIuIiwKICAgICJwYXRocyI6IHsKICAgICAgIkAvKiI6IFsic3JjLyoiXQogICAgfSwKICAgICJlc01vZHVsZUludGVyb3AiOiB0cnVlLAogICAgInNraXBMaWJDaGVjayI6IHRydWUsCiAgICAiZm9yY2VDb25zaXN0ZW50Q2FzaW5nSW5GaWxlTmFtZXMiOiB0cnVlLAogICAgInN0cmljdE51bGxDaGVja3MiOiB0cnVlLAogICAgIm1vZHVsZVJlc29sdXRpb24iOiAiTm9kZU5leHQiLAogICAgInJlc29sdmVKc29uTW9kdWxlIjogdHJ1ZSwKICAgICJpc29sYXRlZE1vZHVsZXMiOiB0cnVlLAogICAgIm5vRW1pdE9uRXJyb3IiOiB0cnVlLAogICAgImluY3JlbWVudGFsIjogdHJ1ZSwKICAgICJ0c0J1aWxkSW5mb0ZpbGUiOiAic3JjLy50c2J1aWxkaW5mbyIKICB9LAogICJpbmNsdWRlIjogWyJzcmMvKiovKiJdLAogICJleGNsdWRlIjogWyJub2RlX21vZHVsZXMiXSwKICAiZXh0ZW5kcyI6ICIuL25vZGVfbW9kdWxlcy9AdHlwZXMvbm9kZS90c2NvbmZpZy5qc29uIgp9")
                // EditorService.modifiedContent = EditorUtils.changeModifyFileIndentation(editor, data.fileText);

                const document = editor.document;
                const filePath = document.uri.fsPath;
                const originalContent = document.getText();

                DiffWebview.show(data.uniqueKey, document.uri.path, originalContent, data.fileText);


            }
        );

        VsCodeEventService.registerEvent(new AcceptCurrentEditorTextEvent().name,
            (messageEvent) => {
                let event: AcceptCurrentEditorTextEvent = DeepAiEvent.fromEventName(messageEvent.name, messageEvent.data);
                let { filePath, fileText } = event.resolveData();
                //
                let filePathUri = vscode.Uri.file(filePath);
                vscode.workspace.fs.writeFile(filePathUri, Buffer.from(fileText));
                DiffWebview.disposeAll();
                vscode.workspace.openTextDocument(filePath);
            }
        );
    }

}
export default EditorService;