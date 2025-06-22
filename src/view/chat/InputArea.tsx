import React, { useEffect, useRef, useState } from 'react';
import { ContextArea, ContextAreaInfo } from './ContextArea';
import AppMessage from '../AppMessage';

function InputArea({ onSendMessage }: { onSendMessage: (message: string, contextAreaInfo: ContextAreaInfo) => void }) {

    const [inputMessage, setInputMessage] = useState('');
    const contextAreaRef = useRef<typeof ContextArea>(null);

    const handleInputChange = (e: any) => {
        let data = e.target.value;
        if (data == "\n") {
            data = "";
        }
        setInputMessage(data);
    };

    const getDocInfo = () => {

        return;
    };



    const handleInputSend = (e: any) => {
        let contextAreaInfo = contextAreaRef.current?.getDocInfo()
        console.log(`fileName${contextAreaInfo.fileName} fileTexts:${contextAreaInfo.fileText}`)
        let prompt = `文件名是： ${contextAreaInfo.fileName},文件内容是：${contextAreaInfo.fileText},${inputMessage}`
        onSendMessage(inputMessage, contextAreaInfo);
    };

    return (
        <div id="chat_input_part">
            <ContextArea ref={contextAreaRef}></ContextArea>
            <textarea
                id="chat_input_area"
                value={inputMessage}
                onChange={(e) => handleInputChange(e)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        if (inputMessage == '') {
                            return;
                        }
                        setInputMessage('');
                        handleInputSend(e)
                    }
                }}
            />
            <button id="chat_input_button" onClick={handleInputSend}>send</button>
        </div>
    );
}

export default InputArea;