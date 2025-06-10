import React, { useEffect, useState } from 'react';
import AppMessage from '../AppMessage';

function ContextArea() {

    const [fileName, setFileName] = useState('demo.docx');


    useEffect(() => {
        AppMessage.addEventListener('changeVisibleTextEditors', (data) => {
            console.log(`get file name ${data}`)
            // data 是一个文件路径，获取到文件名
            let tempList = data.split('/')
            let temp = tempList[tempList.length - 1]
            tempList = data.split('\\')
            temp = tempList[tempList.length - 1]
            setFileName(temp)
        })

    }, []);

    return (
        <div id="chat-context-area">
            {fileName}
        </div>
    );
}

export default ContextArea;