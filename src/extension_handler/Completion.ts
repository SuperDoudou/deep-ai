import * as vscode from 'vscode';
import { LLMService } from './LLMService';

/**
 * 处理智能提示
 */
class CompletionHandler {
    public static async handleCompletion(event: vscode.TextDocumentChangeEvent) {
        console.log("enter handleCompletion", event);
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        console.log("filter handleCompletion", event);
        vscode.window.activeTextEditor?.selections;
        let text = event.contentChanges[0].text;
        let range = event.contentChanges[0].range;

        let prompt = `请根据代码${text}，补全的代码，只返回补全的代码，不要返回其他内容`;


        LLMService.chat(prompt, (reasoningContent, answer, isEnd) => {
            //
            answer = "func main() {\n    fmt.Println(\"Hello, dou World!\")\n}"

            if (isEnd) {
                let decorationType = vscode.window.createTextEditorDecorationType({
                    after: {
                        contentIconPath: vscode.Uri.parse(textToBase64ImageSVG(answer, {
                        })),
                        margin: '0 0 0 10px',
                        backgroundColor: "#ffffff",
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

                    backgroundColor: "#ffffff",
                    opacity: "1",
                });
                editor.setDecorations(decorationType, [range]);
                // editor.edit(editBuilder => {
                //     editBuilder.replace(wordRange, answer);
                // });
            }
        });
    }
}


export function textToBase64ImageSVG(
    text: string,
    options: {
        width?: number;
        height?: number;
        fontSize?: number;
        fontFamily?: string;
        color?: string;
        backgroundColor?: string;
    } = {}
): string {
    // 默认配置
    const {
        fontSize = 16,
        fontFamily = 'Consolas, Courier New, monospace',
        color = '#aaaaaa',
        backgroundColor = '#222222'
    } = options;


    let lines = text.split('\n');


    // 创建SVG
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" >
      <rect width="100%" 
        height="100%" 
        fill="${backgroundColor}" 
        stroke="#ffffff" 
        stroke-width="1" />

      ${lines.map((line, index) => `
        <rect 
        x="${5 + fontSize / 2 * (line.match(/^\s*/)?.[0].length || 0)}"
        y="${5 + (index + 1) * 20}" 
        width="${line.length * fontSize / 2}" 
        height="${fontSize}" 
        fill="#333333" />

        <text 
        x="${5 + fontSize / 2 * (line.match(/^\s*/)?.[0].length || 0)}"
        y="${5 + (index + 1) * 20}" 
        font-family="${fontFamily}" 
        font-size="${fontSize}" 
        fill="${color}" 
        text-anchor="start" 
        dominant-baseline="center"
      >
        ${line}
      </text>`)}
    </svg>
  `;
    console.log("svg", svg);

    // 转换为Base64
    if (typeof window !== 'undefined') {
        // 浏览器环境
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } else {
        // Node.js环境
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }
}

// 使用示例
const base64Image = textToBase64ImageSVG('TypeScript Rocks!', {
    fontSize: 20,
    color: '#3366ff',
    backgroundColor: '#f8f8f8'
});
console.log(base64Image);


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
            borderRadius: '4px', sdf
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