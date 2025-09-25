import * as vscode from 'vscode';
import { LLMService } from './LLMService';
import * as diff from 'diff-match-patch';
import { Base64 } from 'js-base64';

/**
 * 处理智能提示
 */
class CompletionHandler {
    const static getSubText = (text: string, range: vscode.Range) => {
        const startLine = Math.max(range.start.line - 10, 0);
        const endLine = Math.min(range.end.line + 10, text.split('\n').length);
        const lines = text.split('\n');
        return lines.slice(startLine, endLine).join('\n');
    }

    public static async handleCompletion(text: string, range: vscode.Range) {
        console.log("enter handleCompletion", text, range);
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const subText = this.getSubText(text, range);
        console.log("handle handleCompletion", text, subText);
        let prompt = `用户正在编辑文件 ${text}，正在修改${subText}部分，请优化这部分，只返回补全的代码，不要返回其他内容`;
        let totalAnswer = ""

        LLMService.chat(prompt, (reasoningContent, answer, isEnd) => {
            //
            // answer = "func main() {\n    fmt.Println(\"Hello, dou World!\")\n}"
            totalAnswer += answer;
            if (isEnd) {
                textToBase64ImageSVG(subText, answer, {}).then(base64Image => {
                    console.log("handleCompletion", totalAnswer);
                    let decorationType = vscode.window.createTextEditorDecorationType({
                        before: {
                            contentIconPath: vscode.Uri.parse(base64Image),
                            margin: '0 0 0 10px',
                            backgroundColor: "#333333",
                            width: '200px',
                            height: '100px',
                            textDecoration: `
                                    none;
                                    position: absolute;
                                    left: -0.5rem;
                                    top: 2rem;
                                    z-index: 1;
                                    pointer-events: none;
                                    background-size: 100% 100%;
                                    background-repeat: no-repeat; `
                        },
                        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
                        overviewRulerColor: "#ffffff",
                        overviewRulerLane: vscode.OverviewRulerLane.Right,

                        backgroundColor: "#333333",
                        opacity: "0.3",
                    });
                    editor.setDecorations(decorationType, [range]);
                })

                // editor.edit(editBuilder => {
                //     editBuilder.replace(wordRange, answer);
                // });
            }
        });
    }
}

export async function textToBase64ImageSVG(
    oldText: string,
    newText: string,
    options: {
        width?: number;
        height?: number;
        fontSize?: number;
        fontFamily?: string;
        color?: string;
        backgroundColor?: string;
    } = {}
): Promise<string> {
    // 默认配置
    const {
        fontSize = 16,
        fontFamily = 'Consolas, Courier New, monospace',
        color = '#aaaaaa',
        backgroundColor = '#222222'
    } = options;
    const base64OldText = Base64.encode(oldText);
    const base64NewText = Base64.encode(newText);
    const response = await fetch('http://deep-app.top:8095/code2Image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "newCode": base64OldText,
            "oldCode": base64NewText
        })
    }).catch(err => {
        console.log("code2Image err", err);
    });
    if (!response) {
        return "";
    }
    const text = await response.text();
    console.log("code2Image", text);
    return text;
}

function htmlEscape(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function genSvg(original: string, modified: string): string {
    original = `<div class="svg-container">
            <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
                <!-- 主标题 -->
                <text class="text" x="400" y="50" text-anchor="middle" font-size="32" font-weight="bold">`
    modified = `<div class="svg1-container">
            <svg viewBox="0 0 800 300" xmlns="http://www.w3.333org/2000/svg">

                <!-- 主标题 -->

                <text class="text" x="400" y="50" text-anchor="mid888
                
                99dle" font-size="32" font-weight="bold">`
    // 计算original的缩进符号

    const fontSize = 14
    const lineHeight = fontSize * 1.7
    const textOffset = 5
    const dmp = new diff.diff_match_patch();
    let diffs = dmp.diff_main(original, modified);
    dmp.diff_cleanupSemantic(diffs);
    // dmp.diff_cleanupSemantic(diffs);
    let svgString: string = "";
    let lineStart = true;
    let lineNum = 0;

    for (let i = 0; i < diffs.length; i++) {
        let part = diffs[i];
        let type = part[0];
        let text = htmlEscape(part[1]);
        let beforeText = i > 0 ? htmlEscape(diffs[i - 1][1]) : ""
        if (beforeText.endsWith("\n")) {
            lineStart = true;
        }

        let texts = text.split("\n");
        for (let j = 0; j < texts.length; j++) {
            if (j > 0) {
                lineStart = true;
            }
            if (lineStart) {
                if (svgString.length > 0) {
                    svgString += `</text>`;
                }

                svgString += `<text fill="#cccccc" class="text" font-size="${fontSize}" x="${textOffset}" y="${fontSize * 1.3 + lineNum * lineHeight}">`;
                lineNum++;
                lineStart = false;
            }
            if (type === diff.DIFF_EQUAL) {
                svgString += texts[j]
                continue;
            }
            if (type === diff.DIFF_INSERT) {
                svgString += `<tspan fill="green">${texts[j]}</tspan>`;

            }
        }
    }
    svgString += `</text>`;
    svgString = `<svg width="800" height="${lineNum * lineHeight}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="800" height="${lineNum * lineHeight}" style="fill:#333333;"/>` + svgString + `</svg>`
    return svgString;
}


export function showInlinePopup() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('没有活动的文本编辑器');
        return;
    }

    // 获取当前光标位置
    const position = editor.selection.active;

    // 创建装饰类型fafasdf
    console.log("position", position);

    const decorationType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: "这是一个内联弹窗\\n这是第二行",
            backgroundColor: 'rgba(200, 200, 200, 0.3)',
            border: '1px solid',
            borderColor: 'rgba(200, 200, 200, 0.7)',
            borderRadius: '4px',
            margin: '0 0 0 10px',
            padding: '2px 5px'
        },
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });

    // 设置装饰范围
    const range = new vscode.Range(position, position.translate(2, 1));
    editor.setDecorations(decorationType, [{
        range,
        renderOptions: { after: {} }
    }]);

    // 5秒后自动消失
    setTimeout(() => {
        decorationType.dispose();
    }, 5000);
}

export default CompletionHandler;

