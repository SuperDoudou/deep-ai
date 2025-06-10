import React, { useEffect, useState } from 'react';
import InputArea from './InputArea';
import ChatItem from './ChatItem';
import svg from '../../resources/robot.svg'
import App from '../App';
import AppMessage from '../AppMessage';
type MessageItem = {
    name: string;
    isRobot: boolean;
    avatar: string;
    message: string;
};

function ChatContainer() {

    const [messagesList, setMessagesList] = useState<MessageItem[]>([])

    useEffect(() => {
        let randMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
        pushMessagesList({
            name: randMessage.name,
            avatar: randMessage.avatar,
            isRobot: true,
            message: '你好，这是第一条消息'
        })
    }, [])

    let pushMessagesList = (message: MessageItem) => {
        // debugger
        console.log(`push message ${message.message}`)
        setMessagesList(messagesList => {
            let temp = [...messagesList]
            temp.push(message)
            return temp
        })
    };

    let svgToDataURL = (svgString: string) => {
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }

    const onInputMessage = (message: string) => {
        console.log(`get input message ${message}`)
        pushMessagesList({
            name: mockUser.name,
            isRobot: false,
            avatar: mockUser.avatar,
            message: message
        })

        AppMessage.sendMessageToParent()
        setTimeout(() => {
            let randMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
            pushMessagesList(randMessage)

        }, 2000);
    }

    const mockUser = { name: '企鵝豆豆', avatar: svgToDataURL(svg) }


    const mockMessages: MessageItem[] = [
        { name: '用户1', isRobot: true, avatar: svgToDataURL(svg), message: '你好，这是第一条消息' },
        { name: '用户2', isRobot: true, avatar: svgToDataURL(svg), message: '今天的会议安排如何？' },
        { name: '用户3', isRobot: true, avatar: svgToDataURL(svg), message: '请查看最新文档' },
        { name: '用户4', isRobot: true, avatar: svgToDataURL(svg), message: '项目进度更新' },
    ]


    return (
        <div id="chat_container">
            {messagesList.map((item, index) => (
                <ChatItem key={index} name={item.name} isRobot={item.isRobot} avatar={item.avatar} message={item.message}>
                </ChatItem>
            ))}


            <InputArea onSendMessage={onInputMessage}></InputArea>
        </div>
    );
}

export default ChatContainer;