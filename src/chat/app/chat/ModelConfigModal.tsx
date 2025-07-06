import React, { useContext, useState } from 'react';
import { GlobalAppContext } from '../GlobalStateProvider';
import VsCodeService from '../VsCodeService';

// 定义保存配置的回调函数类型
type SaveConfigCallback = (apiKey: string, baseUrl: string, modelName: string) => void;

interface ModelConfigModalProps {
    onClose: () => void;
}

function ModelConfigModal({ onClose }: ModelConfigModalProps) {
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [modelName, setModelName] = useState('');
    const appContext = useContext(GlobalAppContext);
    const handleSave = () => {
        let maxId = 1
        appContext.modelList.forEach(m => {
            if (m.id > maxId) {
                maxId = m.id
            }
        })
        let newModelList = [
            ...appContext.modelList,
            {
                id: maxId + 1,
                apiKey: apiKey,
                baseUrl: baseUrl,
                modelName: modelName,
                selected: false
            }
        ]
        appContext.updateGlobalContext("modelList", newModelList);
        VsCodeService.updateModel(newModelList)

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
                <h2 style={{ marginTop: 0 }}>添加model</h2>


                <div className='model-config-item'>
                    <div className='model-config-label'>Base URL:</div>
                    <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
                        className='model-config-input' />
                </div>
                <div className='model-config-item'>
                    <div className='model-config-label'>API Key:</div>
                    <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className='model-config-input' />
                </div>
                <div className='model-config-item'>
                    <div className='model-config-label'>Model Name:</div>
                    <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} className='model-config-input' />
                </div>

                <button onClick={handleSave}>保存</button>
                <button onClick={onClose}>取消</button>
            </div>
        </div >
    );
};

export default ModelConfigModal;
