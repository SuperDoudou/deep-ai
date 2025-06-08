console.log("in webview yeye");

window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    console.log("in webview " + message);
});
const iframe = document.getElementById('webview-patch-iframe');
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