import * as vscode from 'vscode';

class EditorUtils {
    public static changeModifyFileIndentation(editor: vscode.TextEditor, fileText: string): string {
        // 获取原始文件缩进风格
        const originalIndent = EditorUtils.analyzeIndentation(editor.document.getText());

        // 分析修改内容的缩进模式
        const modifiedIndent = EditorUtils.analyzeIndentation(fileText);

        // 当缩进风格不一致时进行转换
        if (originalIndent !== modifiedIndent) {
            const indentRegex = new RegExp(`^(${modifiedIndent})+`, 'gm');
            return fileText.replace(indentRegex, (match) => {
                // 计算原始缩进应重复的次数
                const count = Math.floor(match.length / modifiedIndent.length);
                return originalIndent.repeat(count);
            });
        }
        return fileText;
    }

    // 新增缩进分析辅助方法
    private static analyzeIndentation(content: string): string {
        const spaceIndentRegex = /^( +)/gm;
        const tabIndentRegex = /^(\t+)/gm;

        let spaceCounts = new Map<number, number>();
        let tabCount = 0;

        // 统计空格缩进
        let spaceMatch;
        while ((spaceMatch = spaceIndentRegex.exec(content)) !== null) {
            const count = spaceMatch[1].length;
            spaceCounts.set(count, (spaceCounts.get(count) || 0) + 1);
        }

        // 统计制表符缩进
        let tabMatch;
        while ((tabMatch = tabIndentRegex.exec(content)) !== null) {
            tabCount += tabMatch[1].length;
        }

        // 确定主要缩进类型
        if (tabCount > 0) return '\t';

        let minCount = 10;
        let popularIndent = '    ';
        for (const [count, num] of spaceCounts) {
            if (count < minCount) {
                minCount = count;
                popularIndent = ' '.repeat(count);
            }
        }
        return popularIndent;
    }
}
export default EditorUtils;