import React, { useEffect, useState } from 'react';
import ContextArea from './ContextArea';
import AppMessage from '../AppMessage';

function InputArea({ onSendMessage }: { onSendMessage: (message: string) => void }) {

    const [inputMessage, setInputMessage] = useState('');

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

        getDocInfo()

        onSendMessage(inputMessage);
    };

    return (
        <div id="chat_input_part">
            <ContextArea ></ContextArea>
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