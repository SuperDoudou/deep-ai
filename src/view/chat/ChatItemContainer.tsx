import React, { useEffect, useState } from 'react';
import InputArea from './InputArea';
import ChatItem from './ChatItem';
import svg from '../../resources/robot.svg'
import App from '../App';
import AppMessage from '../AppMessage';
import LLMService from './LLMService';

class MessageItem {
    public name: string = "";
    public isRobot: boolean = true;
    public avatar: string = "";
    public message: string = "";
    public reasoningContent: string = "";
    public setMessage = (message: string) => {
        this.message = message;
    };
    public setReasoningContent = (reasoningContent: string) => {
        this.reasoningContent = reasoningContent;
    };
    constructor(name: string, isRobot: boolean, avatar: string, message: string, reasoningContent: string) {
        this.name = name;
        this.isRobot = isRobot;
        this.avatar = avatar;
        this.message = message;
        this.reasoningContent = reasoningContent;
    }
};

function ChatContainer() {

    const [messagesList, setMessagesList] = useState<MessageItem[]>([])

    const [count, setCount] = useState(0);

    useEffect(() => {
        LLMService.init()
        let randMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
        let messageItem = new MessageItem()
        messageItem.name = randMessage.name
        messageItem.isRobot = randMessage.isRobot
        messageItem.avatar = randMessage.avatar
        messageItem.message = '你好，这是第一条消息'
        pushMessagesList(messageItem)
    }, [])



    let pushMessagesList = (message: MessageItem) => {
        // debugger
        console.log(`push message ${message.message}`)
        setMessagesList(messagesList => {
            return messagesList.concat(message)
        })
    };

    let svgToDataURL = (svgString: string) => {
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }

    const onInputMessage = (message: string) => {
        console.log(`get input message ${message}`)
        let messageItem = new MessageItem(mockUser.name, false, mockUser.avatar, message, "")
        pushMessagesList(messageItem)

        let answerMessageItem = new MessageItem(mockUser.name, true, mockUser.avatar, "", "")
        pushMessagesList(answerMessageItem)
        LLMService.sendText(message,
            (m) => {
                answerMessageItem.setReasoningContent(m);
                setCount(count => count + 1)

                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            },
            (m) => {
                answerMessageItem.setMessage(m);
                setCount(count => count + 1)

                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            })
        AppMessage.sendMessageToParent()

    }

    const mockUser = { name: '企鵝豆豆', avatar: svgToDataURL(svg) }


    const mockMessages: MessageItem[] = [
        new MessageItem('用户1', true, svgToDataURL(svg), '你好，这是第一条消息', '这是第一条消息的思考过程'),
        new MessageItem('用户2', true, svgToDataURL(svg), '今天的会议安排如何？', '这是第一条消息的思考过程222'),
    ]


    return (
        <div id="chat_container">
            {messagesList.map((item, index) => (
                <ChatItem key={index}
                    name={item.name}
                    isRobot={item.isRobot}
                    avatar={item.avatar}
                    message={item.message}
                    reasoning={item.reasoningContent}>
                </ChatItem>
            ))}


            <InputArea onSendMessage={onInputMessage}></InputArea>

        </div>
    );
}

export default ChatContainer;