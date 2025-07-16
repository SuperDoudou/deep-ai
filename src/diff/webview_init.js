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

// window.addEventListener("message", (e) => {
//     window.dispatchEvent(new KeyboardEvent('keydown', JSON.parse(e.data)));
// }, false);

window.addEventListener('message', event => {
    message = {
        from: event.data.from + "|webview", // vscode|webview|react
        name: event.data.name, // 事件名称，如：getCurrentFileName
        data: event.data.data // 数据，如：文件名
    };

    if (event.data.from.startsWith("vscode")) {
        if (iframe) {
            iframe.contentWindow.postMessage(message, "http://localhost:3001");
        }
        return;
    }
    if (event.data.from.startsWith("diff")) {
        // 发送消息到插件
        vscode.postMessage(message);
        return;
    }
});

if (iframe) {
    const root = document.getElementById('root');
    iframe.onload = function () {
    };
}