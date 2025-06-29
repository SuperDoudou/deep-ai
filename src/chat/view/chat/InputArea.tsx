import React, { useEffect, useRef, useState } from 'react';
import { ContextArea, ContextAreaInfo } from './ContextArea';
import AppMessage from '../AppMessage';
import Utils from '../Utils';


const sendIcon = '<svg t="1750988574088" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11649" width="32" height="32"><path d="M915.515273 142.819385 98.213046 458.199122c-46.058539 17.772838-44.90475 43.601756 2.348455 57.622994l197.477685 58.594874 80.292024 238.91085c10.51184 31.277988 37.972822 37.873693 61.462483 14.603752l103.584447-102.611545 204.475018 149.840224c26.565749 19.467242 53.878547 9.222132 61.049613-23.090076l149.210699-672.34491C965.264096 147.505054 946.218922 130.971848 915.515273 142.819385zM791.141174 294.834331l-348.61988 310.610267c-6.268679 5.58499-11.941557 16.652774-12.812263 24.846818l-15.390659 144.697741c-1.728128 16.24808-7.330491 16.918483-12.497501 1.344894l-67.457277-203.338603c-2.638691-7.954906 0.975968-17.705389 8.022355-21.931178l442.114555-265.181253C812.67481 268.984974 815.674251 272.975713 791.141174 294.834331z" p-id="11650" fill="#bfbfbf"></path></svg>'
const stopIcon = '<svg t="1751190153540" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3240" width="32" height="32"><path d="M512 0c-282.784 0-512 229.216-512 512s229.216 512 512 512 512-229.216 512-512-229.216-512-512-512zM512 928c-229.76 0-416-186.24-416-416s186.24-416 416-416 416 186.24 416 416-186.24 416-416 416zM320 320l384 0 0 384-384 0z" fill="#e07a6c" p-id="3241"></path></svg>'
const modelIcon = '<svg t="1751192070791" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10783" width="32" height="32"><path d="M946.404126 229.711127L548.946963 8.967958a72.272696 72.272696 0 0 0-69.968844 0.127992l-399.761015 223.985627c-21.331965 11.9459-34.600446 34.088479-34.685775 57.76696L42.69678 735.875981a66.811713 66.811713 0 0 0 34.899094 58.406919l397.457163 220.700505a71.931384 71.931384 0 0 0 70.011508-0.127992l399.761015-224.028291c21.246637-11.9459 34.557783-34.045815 34.643111-57.724296L981.30322 288.118046a66.854377 66.854377 0 0 0-34.899094-58.449583z m-66.769049 41.213355l-363.32602 201.757721c-1.535901 0.853279-2.901147 1.834549-4.309057 2.773155-1.450574-0.938606-2.815819-1.962541-4.309057-2.773155L148.076685 273.015015l365.629872-205.298827 365.92852 203.208294zM114.542837 332.659188l357.865037 198.728581c1.749221 0.938606 2.986475 2.431844 3.882417 4.053074-0.085328 1.578565-0.298648 3.114467-0.298647 4.693032l0.767951 184.308173-0.853279 212.722351-362.728725-201.032434 1.365246-403.472777z m433.550847 602.32935l-0.853279-210.54649 0.767951-184.308173c0-1.535901-0.21332-3.114467-0.298647-4.693032 0.853279-1.621229 2.133196-3.114467 3.839753-4.053074l359.102291-199.411204-1.322582 400.230318-361.235487 202.781655z" fill="#bfbfbf" fill-opacity=".65" p-id="10784"></path></svg>'
function InputArea(
    { onSendMessage, onStopSendingMessage }:
        {
            onSendMessage: (message: string, contextAreaInfo: ContextAreaInfo) => void
            onStopSendingMessage: () => void
        }
) {

    const [inputMessage, setInputMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
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

    const stopSending = () => {
        setSendingMessage(false);
        onStopSendingMessage()
    }

    const handleInputSend = (e: any) => {
        setSendingMessage(true);
        let contextAreaInfo = contextAreaRef.current?.getDocInfo()
        console.log(`fileName${contextAreaInfo.fileName} fileTexts:${contextAreaInfo.fileText}`)
        let prompt = `文件名是： ${contextAreaInfo.fileName},文件内容是：${contextAreaInfo.fileText},${inputMessage}`
        onSendMessage(inputMessage, contextAreaInfo);
    };

    return (
        <div id="chat_input_part">

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
            <div id="chat_input_area_action">
                <div>
                    <ContextArea ref={contextAreaRef}></ContextArea>
                </div>
                <div id="chat_input_area_action_right">
                    <div id="chat_input_area_model_select">
                        <img className="chat_input_area_model_icon"
                            src={Utils.svgToDataURL(modelIcon)}
                            title='模型'
                            onClick={stopSending}></img>
                        <div>deepseek</div>
                    </div>
                    {
                        sendingMessage ?
                            <img className="chat_input_area_action_icon"
                                src={Utils.svgToDataURL(stopIcon)}
                                title='停止'
                                onClick={stopSending}></img> :
                            <img className="chat_input_area_action_icon"
                                src={Utils.svgToDataURL(sendIcon)}
                                title='发送'
                                onClick={handleInputSend}></img>

                    }
                </div>
            </div>
        </div>
    );
}

export default InputArea;