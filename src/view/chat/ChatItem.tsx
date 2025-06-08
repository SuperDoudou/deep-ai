import React from 'react';

interface ChatItemProps {
    name: string;// 用户名
    isRobot: boolean;
    avatar: string;
    message: string;
}

function ChatItem({ name, isRobot, avatar, message }: ChatItemProps) {
    return (
        <div id="chat-item">
            {
                isRobot ? (
                    <div className='chat-item-robot'>
                        <img className='chat-item-user-avatar' src={avatar} alt="用户头像" />
                        <div className='chat-item-user-block'></div>
                        <h4 className='chat-item-user-name'>{name}</h4>
                    </div>
                ) : (
                    <div className='chat-item-user'>
                        <h4 className='chat-item-user-name'>{name}</h4>
                        <div className='chat-item-user-block'></div>
                        <img className='chat-item-user-avatar' src={avatar} alt="用户头像" />
                    </div>
                )
            }
            <div className="chat-item-content">
                {message}
            </div>
        </div>
    );
}

export default ChatItem;