console.log("in diff webview yeye");
const iframe = document.getElementById('webview-diff-iframe');
const vscode = acquireVsCodeApi();
// type InnerMessage = {
// 	from: string; // extension|webview|react
// 	eventName: string; // 事件名称，如：getCurrentFileName
// 	data: string; // 数据，如：文件名
// };

/**
 * 

 */

window.addEventListener('message', event => {
    message = {
        from: event.data.from + "|webview", // vscode|webview|react
        name: event.data.name, // 事件名称，如：getCurrentFileName
        data: event.data.data // 数据，如：文件名
    };

    console.log("[webview html] revieve event from " + event.data.from + " message:" + JSON.stringify(message));
    if (event.data.from.startsWith("vscode")) {
        if (iframe) {
            iframe.contentWindow.postMessage(message, "http://localhost:3001");
        }
        return;
    }
    if (event.data.from.startsWith("react")) {
        // 发送消息到插件
        vscode.postMessage(message);
        return;
    }



});

if (iframe) {
    const root = document.getElementById('root');
    const originalContent = root?.getAttribute('originalContent') || "";
    const modifiedContent = root?.getAttribute('modifiedContent') || "";
    const filePath = root?.getAttribute('filePath') || "";
    iframe.onload = function () {
        const data = {
            name: 'initDiff',
            data: JSON.stringify({
                filePath,
                originalContent,
                modifiedContent,
            }),
        };
        console.log(`[diff] post message to react, ${data.name}, ${data.data}`);
        iframe.contentWindow.postMessage(data, '*'); // 最好指定具体origin而不是'*'
    };
    // f: HTMLElement = iframe
    // f.onload(() => {
    // message = Array.from(document.styleSheets)
    //     .map(sheet => {
    //         try {
    //             return Array.from(sheet.cssRules).map(rule => {
    //                 // rule.cssText => html { scrollbar-color: var(--vscode-scrollbarSlider-background) var(--vscode-editor-background); 
    //                 const replacedString = rule.cssText.replace(/var\(([^)]+)\)/g, (match, varName) => {
    //                     return getComputedStyle(iframe).getPropertyValue(varName.substring(1)) || match; // 如果变量不在 map 里，保留原样
    //                 });
    //                 return replacedString + " "
    //             }).join('');

    //         } catch (e) {
    //             return '';
    //         }
    //     })
    //     .join('');
    // iframe.contentWindow.postMessage(message, "http://localhost:3000");
    // })
}