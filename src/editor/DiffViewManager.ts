import path from 'path';
import * as vscode from 'vscode';

export class DiffViewManager {
    private static readonly viewType = 'customDiffView';
    private static readonly diffPanels = new Map<string, vscode.WebviewPanel>();

    public static showMultiVersionDiff(versions: {
        left: vscode.Uri,
        leftText: string,
        right: vscode.Uri,
        rightText: string,
        base?: vscode.Uri
    }) {
        const panelKey = `${versions.left.toString()}_${versions.right.toString()}`;

        if (DiffViewManager.diffPanels.has(panelKey)) {
            DiffViewManager.diffPanels.get(panelKey)!.reveal();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            DiffViewManager.viewType,
            `Diff: ${path.basename(versions.left.path)} ↔ ${path.basename(versions.right.path)}`,
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // 动态生成对比界面
        panel.webview.html = this.generateDiffHtml(versions, versions.leftText, versions.rightText);


        panel.onDidDispose(() => DiffViewManager.diffPanels.delete(panelKey));
        DiffViewManager.diffPanels.set(panelKey, panel);
    }

    private static generateDiffHtml(versions: any, leftValue: string, rightValue: string) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .diff-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    height: 100vh;
                    overflow: hidden;
                }
                .diff-editor {
                    height: 100%;
                    border-right: 1px solid var(--vscode-editorGroup-border);
                }
                .version-selector {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 100;
                }
            </style>
        </head>
        <body>
            <div class="diff-container">
                <div class="diff-editor" id="left-editor"></div>
                <div class="diff-editor" id="right-editor"></div>
            </div>
            
            <div class="version-selector">
                <button onclick="switchVersion('left')">← Switch Left</button>
                <button onclick="switchVersion('right')">Switch Right →</button>
            </div>

            <script>
                // 使用Monaco Editor实现差异高亮
                require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
                require(['vs/editor/editor.main'], () => {
                    const leftEditor = monaco.editor.create(document.getElementById('left-editor'), {
                        value: ${leftValue},
                        language: 'js',
                        readOnly: true,
                        renderSideBySide: false
                    });

                    const rightEditor = monaco.editor.create(document.getElementById('right-editor'), {
                        value: ${rightValue},
                        language: 'js',
                        readOnly: true,
                        renderSideBySide: false
                    });

                    // TODO: 实现差异计算和高亮
                });

                function switchVersion(side) {
                    vscode.postMessage({ command: 'switchVersion', side });
                }
            </script>
        </body>
        </html>`;
    }
}