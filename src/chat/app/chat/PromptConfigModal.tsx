import React, { useContext, useState } from 'react';
import { GlobalAppContext } from '../GlobalStateProvider';
import VsCodeService from '../VsCodeService';


function PromptConfigModal({ onClose }: { onClose: () => void }) {
    const appContext = useContext(GlobalAppContext);
    const handleSave = () => {

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
                <button onClick={handleSave}>保存</button>
                <button onClick={onClose}>取消</button>
            </div>
        </div >
    );
};

export default PromptConfigModal;
