console.log("in webview yeye");
const iframe = document.getElementById('webview-patch-iframe');
const vscode = acquireVsCodeApi();
// type InnerMessage = {
// 	from: string; // extension|webview|react
// 	eventName: string; // 事件名称，如：getCurrentFileName
// 	data: string; // 数据，如：文件名
// };

/**
 * 
type InnerMessage = {
  from: string; // extension|webview|react
  eventName: string; // 事件名称，如：getCurrentFileName
  data: string; // 数据，如：文件名
};

 */

window.addEventListener('message', event => {
    message = {
        from: event.data.from + "|webview", // vscode|webview|react
        name: event.data.eventName, // 事件名称，如：getCurrentFileName
        data: event.data.data // 数据，如：文件名
    };
    console.log("[webview] revieve event" + JSON.stringify(message));
    // 发送消息到插件
    vscode.postMessage(message);
    // if (iframe) {
    //     iframe.contentWindow.postMessage(message, "http://localhost:3000");
    // }
});

if (iframe) {
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