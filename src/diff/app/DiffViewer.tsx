import React, { useState, useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { Status } from './Status';
import AppMessage from './AppMessage';
import { DeepAiEvent, DiffAcceptCurrentEditorTextEvent, InitDiffEvent, UpdateModifiedTextEvent } from '../../Constant';
import { Base64 } from 'js-base64';

function DiffViewer() {
    const [filePath, setFilePath] = useState("")
    const [originalContent, setOriginalContent] = useState("")


    let editorRef = useRef(null);
    let [diffEditor, setDiffEditor] = useState<monaco.editor.IStandaloneDiffEditor>()

    useEffect(() => {
        let temp = monaco.editor.createDiffEditor(editorRef.current!, {
            theme: 'vs-dark',
            renderSideBySide: true,
            useInlineViewWhenSpaceIsLimited: false,
            // renderGutterMenu: false
        })
        temp.setModel({
            original: monaco.editor.createModel("origin", 'json'),
            modified: monaco.editor.createModel("modified", 'json')
        });
        setDiffEditor(temp);
        AppMessage.addEventListener(new UpdateModifiedTextEvent().name, (event: UpdateModifiedTextEvent) => {
            if (!temp) {
                return;
            }
            let { modifiedText } = event.resolveData()
            temp?.getModel()?.modified.setValue(modifiedText);
        })
        AppMessage.addEventListener(new InitDiffEvent().name, (event: InitDiffEvent) => {
            let { filePath, originalContent, modifiedContent } = event.resolveData()
            console.log(`Diff App InitDiffEvent ${filePath}, ${originalContent}`)
            setFilePath(filePath)
            setOriginalContent(originalContent)

            temp?.getModel()?.original.setValue(originalContent);
        })
    }, [])


    const handleAcceptAll = () => {
        debugger
        let event = new DiffAcceptCurrentEditorTextEvent()
        let modifiedText = diffEditor?.getModel()?.modified?.getValue() || ""
        event.injectData(filePath, modifiedText)
        console.log(`Diff App DiffAcceptCurrentEditorTextEvent ${filePath}, ${modifiedText}`)
        AppMessage.sendMessage(event)
    }
    return (
        <div style={{
            width: 'calc(100%)',
            display: 'flex',
            height: '100%',
            paddingTop: '40px',
            flexDirection: 'column',
        }}>
            <div style={
                {
                    cursor: 'pointer',
                }
            }
                onClick={() => handleAcceptAll()}>
                ✅确认修改
            </div>
            <div>{filePath}</div>
            <div id="diff_editor" ref={editorRef} style={{ height: '90vh', width: '100%' }} />
        </div>
    );
};

export default DiffViewer;