import React, { useState, useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { Status } from './Status';
import AppMessage from './AppMessage';
import { AcceptCurrentEditorTextEvent, DeepAiEvent, UpdateModifiedTextEvent } from '../../Constant';

function DiffViewer(props: { filePath: string, originalContent: string, modifiedContent: string }) {

    console.log(`DiffViewer ${props.filePath}, ${props.originalContent}, ${props.modifiedContent}`)
    let editorRef = useRef(null);
    let diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;

    useEffect(() => {
        let temp = monaco.editor.createDiffEditor(editorRef.current!, {
            theme: 'vs-dark',
            renderSideBySide: true,
            useInlineViewWhenSpaceIsLimited: false,
            // renderGutterMenu: false
        })
        temp.setModel({
            original: monaco.editor.createModel(props.originalContent, 'json'),
            modified: monaco.editor.createModel(props.modifiedContent, 'json')
        });
        diffEditor = temp;
        AppMessage.addEventListener(new UpdateModifiedTextEvent().name, (event: UpdateModifiedTextEvent) => {
            if (!diffEditor) {
                return;
            }
            let { modifiedText } = event.resolveData()
            console.log(`DiffViewer UpdateModifiedTextEvent ${modifiedText}`)
            diffEditor?.getModel()?.original.setValue(props.originalContent);
            diffEditor?.getModel()?.modified.setValue(modifiedText);
        })
    }, [])


    useEffect(() => {
        console.log(`DiffViewer UpdateOriginalTextEvent ${props.originalContent}`)
        diffEditor?.getModel()?.original.setValue(props.originalContent);
    }, [props.originalContent])

    let handleAcceptAll = () => {
        let event = new AcceptCurrentEditorTextEvent()
        event.injectData(props.filePath, diffEditor?.getModel()?.modified?.getValue() || "")
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
            <div style={
                {
                    cursor: 'pointer',
                }
            }
                onClick={handleAcceptAll}>
                ✅确认修改
            </div>
            <div>{props.filePath}</div>
            <div id="diff_editor" ref={editorRef} style={{ height: '90vh', width: '100%' }} />
        </div>
    );
};

export default DiffViewer;