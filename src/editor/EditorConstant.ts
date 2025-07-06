import * as vscode from 'vscode';

interface ChangeInfo {
    id: string;
    originalRange: vscode.Range;// 老文件对应的改动点
    modifiedRange: vscode.Range;// 新文件对应的改动点
    originalLines: string[];
    modifiedLines: string[];
    type: 'add' | 'del' | 'modify'; // 明确类型定义
}

interface ChangeContext {
    originalUri: vscode.Uri,
    originalText: string,
    modifiedUri: vscode.Uri,
    modifiedText: string,
    changes: ChangeInfo[]
}

export { ChangeInfo, ChangeContext };
