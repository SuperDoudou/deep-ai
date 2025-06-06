import React, { useState } from 'react';
import InputArea from './InputArea';
import ChatItem from './ChatItem';

type MessageItem = {
    name: string;
    avatar: string;
    message: string;
};

function ChatContainer() {

    const [messagesList, setMessagesList] = useState<MessageItem[]>([])


    const onInputMessage = (message: string) => {
        console.log(`get input message ${message}`)
        let temp = [...messagesList]
        temp.push({ name: mockUser.name, avatar: mockUser.avatar, message: message })
        setMessagesList(temp)

        setTimeout(() => {
            temp = [...messagesList]
            let randMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
            temp.push(randMessage)
            setMessagesList(temp)
        }, 2000);
    }

    const mockUser = { name: 'mockUser', avatar: '/user_avatar1.png' }


    const mockMessages: MessageItem[] = [
        { name: '用户1', avatar: '/avatar1.png', message: '你好，这是第一条消息' },
        { name: '用户2', avatar: '/avatar2.png', message: '今天的会议安排如何？' },
        { name: '用户3', avatar: '/avatar3.png', message: '请查看最新文档' },
        { name: '用户4', avatar: '/avatar4.png', message: '项目进度更新' },
        { name: '用户5', avatar: '/avatar5.png', message: '需要技术支持' },
        { name: '用户6', avatar: '/avatar6.png', message: '设计稿已提交' },
        { name: '用户7', avatar: '/avatar7.png', message: '服务器状态正常' },
        { name: '用户8', avatar: '/avatar8.png', message: '代码审查通过' },
        { name: '用户9', avatar: '/avatar9.png', message: '新功能测试完成' },
        { name: '用户10', avatar: '/avatar10.png', message: '下周工作计划' },
    ]


    return (
        <div id="chat_container">
            {messagesList.map((item, index) => (
                <ChatItem key={index} name={item.name} avatar={item.avatar} message={item.message}>
                </ChatItem>
            ))}


            <InputArea onSendMessage={onInputMessage}></InputArea>
        </div>
    );
}

export default ChatContainer;