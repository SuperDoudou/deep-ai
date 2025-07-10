import React, { forwardRef, useContext, useEffect, useImperativeHandle, useState } from 'react';
import AppMessage from '../AppMessage';
import { JSX } from 'react/jsx-runtime';
import { ChangeVisibleTextEditorsEvent } from '../../../Constant';
import { GlobalAppContext } from '../GlobalStateProvider';

export interface ContextAreaInfo {
    fileName: string;
    fileText: string;

}
export const ContextArea = forwardRef((props, ref) => {

    const [fileName, setFileName] = useState('empty');

    const [fileText, setFileText] = useState('empty');

    const appContext = useContext(GlobalAppContext);

    const filterFilePath = (filePath: string|null):string => {
        if(filePath == null){
            return 'demo'
        }
        let tempList = filePath.split('/')
        let temp = tempList[tempList.length - 1]
        tempList = filePath.split('\\')
        temp = tempList[tempList.length - 1]
        return temp
    }
    useEffect(() => {

        AppMessage.addEventListener(new ChangeVisibleTextEditorsEvent().name, (data) => {
            let event = new ChangeVisibleTextEditorsEvent()
            event.data = data
            let { filePath, fileText } = event.resolveData()
            console.log(`get file name ${filePath}`)
            console.log(`get file text ${fileText}`)


            setFileName(filterFilePath(filePath))
            setFileText(fileText)
        })


    }, []);

    useImperativeHandle(ref, () => ({
        getDocInfo: () => {
            return {
                fileName: fileName == 'empty' ? filterFilePath(appContext.initFilePath) : fileName,
                fileText: fileText == 'empty' ? appContext.initFileText : fileText,
            } as ContextAreaInfo
        },
    }));

    return (
        <div id="chat-context-area">
            <div className='chat-context-area-file'>
                <div style={{
                    paddingRight: "2px",
                    color: "rgb(168, 255, 96)",
                }}>#</div>
                {fileName == 'empty' ? filterFilePath(appContext.initFilePath) : fileName}
            </div>
        </div>
    );
});