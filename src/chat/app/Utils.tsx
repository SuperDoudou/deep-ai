class Utils {
    static copyTextToClipboard(content: string) {
        navigator.clipboard.writeText(content)
            .then(() => {
                console.log('内容已复制到剪贴板');
                // 可以在这里添加成功提示
            })
            .catch(err => {
                console.error('复制失败:', err);
                // 可以在这里添加错误提示
            });
    }
    public static svgToDataURL = (svgString: string) => {
        return "data:image/svg+xml," + encodeURIComponent(svgString);
    }
}
export default Utils;