import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import AppMessage from '../AppMessage';
import { ChangeVisibleTextEditorsEvent } from '../../Constant';
import { JSX } from 'react/jsx-runtime';

export interface ContextAreaInfo {
    fileName: string;
    fileText: string;

}
export const ContextArea = forwardRef((props, ref) => {

    const [fileName, setFileName] = useState('demo.docx');

    const [fileText, setFileText] = useState('');

    useEffect(() => {
        let event = new ChangeVisibleTextEditorsEvent()
        AppMessage.addEventListener(event.name, (data) => {
            event.data = data
            let { filePath, fileText } = event.resolveData()
            console.log(`get file name ${filePath}`)
            console.log(`get file text ${fileText}`)

            let tempList = filePath.split('/')
            let temp = tempList[tempList.length - 1]
            tempList = filePath.split('\\')
            temp = tempList[tempList.length - 1]
            setFileName(temp)
            setFileText(fileText)
        })

    }, []);

    useImperativeHandle(ref, () => ({
        getDocInfo: () => {
            return {
                fileText,
                fileName
            } as ContextAreaInfo
        },
    }));

    return (
        <div id="chat-context-area">
            #{fileName}
        </div>
    );
});