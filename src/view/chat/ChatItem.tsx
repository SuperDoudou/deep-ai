import React from 'react';

interface ChatItemProps {
    name: string;
    avatar: string;
    message: string;
}

function ChatItem({ name, avatar, message }: ChatItemProps) {
    return (
        <div className="chat-item">
            <img src={avatar} alt="用户头像" className="avatar" />
            <h4>{name}</h4>

            <div className="content">
                <p>{message}</p>
            </div>
        </div>
    );
}

export default ChatItem;