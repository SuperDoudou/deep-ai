import React, { useState, useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { Status } from './Status';
import AppMessage from './AppMessage';
import { AcceptCurrentEditorTextEvent } from '../../Constant';

function DiffViewer(props: { filePath: string, originalContent: string, modifiedContent: string }) {

    console.log(`DiffViewer ${props.filePath}, ${props.originalContent}, ${props.modifiedContent}`)
    let editorRef = useRef(null);
    let [diffEditor, setDiffEditor] = useState<monaco.editor.IStandaloneDiffEditor>();

    useEffect(() => {
        setDiffEditor(monaco.editor.createDiffEditor(editorRef.current!, {
            theme: 'vs-dark',
            renderSideBySide: true,
            useInlineViewWhenSpaceIsLimited: false,
            // renderGutterMenu: false
        }));
    }, [])
    useEffect(() => {
        console.log(`DiffViewer useEffect diffEditor=${diffEditor} ${props.originalContent}, ${props.modifiedContent}`)
        if (!diffEditor) {
            return;
        }
        diffEditor.setModel({
            original: monaco.editor.createModel(props.originalContent, 'json'),
            modified: monaco.editor.createModel(props.modifiedContent, 'json')
        });
    }, [diffEditor])

    let handleAcceptAll = () => {
        let event = new AcceptCurrentEditorTextEvent()
        
        // event.injectData(diffEditor?.getModel()?.modified)
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
            <div onClick={handleAcceptAll}>
                ✅采纳全部
            </div>
            <div>{props.filePath}</div>
            <div id="diff_editor" ref={editorRef} style={{ height: '90vh', width: '100%' }} />
        </div>
    );
};

export default DiffViewer;