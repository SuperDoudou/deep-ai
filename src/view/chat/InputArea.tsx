import React, { useState } from 'react';

function InputArea({ onSendMessage }: { onSendMessage: (message: string) => void }) {
    
    const [inputMessage, setInputMessage] = useState('');

    const handleInputChange = (e: any) => {

        onSendMessage(inputMessage);
    };

    return (
        <div id="chat_input_part">
            <textarea
                id="chat_input_area"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
            />
            <button id="chat_input_button" onClick={handleInputChange}>send</button>
        </div>
    );
}

export default InputArea;