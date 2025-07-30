import React, { forwardRef, useContext, useImperativeHandle, useState } from 'react';
import { GlobalAppContext } from '../GlobalStateProvider';
import VsCodeService from '../VsCodeService';
import AppMessage from '../AppMessage';

interface PromptConfigModalProps {
    onClose: () => void;
}

export const PromptConfigModal = forwardRef((props: PromptConfigModalProps, ref) => {
    const { onClose } = props;
    const appContext = useContext(GlobalAppContext);
    // 这里存的是弹窗的临时文案
    const [promptTemplate, setPromptTemplate] = useState(appContext.promptTemplate);

    useImperativeHandle(ref, () => ({
        getPromptTemplate: () => {
            debugger
            if (appContext.promptTemplate == null || appContext.promptTemplate == "") {
                return "";
            }
            return appContext.promptTemplate;
        }
    }))

    const handleSave = () => {
        appContext.updateGlobalContext("promptTemplate", promptTemplate);
        VsCodeService.updatePromptTemplate(promptTemplate);
        onClose();
    };

    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // 检查点击目标是否是最外层的 div
        if (e.target === e.currentTarget) {
            onClose();
        }
    };


    return (
        <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onClick={handleOutsideClick}
        >
            <div className="model-config-modal"
                onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
            >
                <h2 style={{ marginTop: 0 }}>提示词配置</h2>
                <textarea
                    id="chat_input_area"
                    value={promptTemplate}
                    onChange={(e) => { setPromptTemplate(e.target.value) }}
                />
                <button onClick={handleSave}>保存</button>
                <button onClick={onClose}>取消</button>
            </div>
        </div >
    );
})

export default PromptConfigModal;
