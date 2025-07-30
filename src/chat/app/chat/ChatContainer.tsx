import React, { useEffect, useRef, useState } from 'react';
import InputArea from './InputArea';
import ChatItem from './ChatItem';
import App from '../App';
import AppMessage from '../AppMessage';
import Utils from '../Utils';
import { Base64 } from 'js-base64';
import { ContextAreaInfo } from './ContextArea';
import { LLMService } from './LLMService';

const testHelloString = "YGBganNvbgp7CgkiY29tcGlsZXJPcHRpb25zIjogewoJCSJtb2R1bGUiOiAiTm9kZTE2IiwKCQkidGFyZ2V0IjogIkVTMjAyMiIsCgkJImxpYiI6IFsKCQkJIkVTMjAyMiIsCgkJCSJET00iLAoJCQkiRE9NLkl0ZXJhYmxlIgoJCV0sCgkJInNvdXJjZU1hcCI6IHRydWUsCgkJInJvb3REaXIiOiAic3JjIiwKCQkianN4IjogInJlYWN0IiwKCQkic3RyaWN0IjogdHJ1ZQoJfQp9Cg=="
const robotIcon = '<svg t="1749285999252" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="21294" width="32" height="32"><path d="M665.6 0a51.2 51.2 0 0 1 51.2 51.2v102.4h51.2a102.4 102.4 0 0 1 102.4 102.4v358.4a102.4 102.4 0 0 1-102.4 102.4h-102.4v51.2h153.6a51.2 51.2 0 0 1 51.2 51.2v153.6a51.2 51.2 0 0 1-51.2 51.2H204.8a51.2 51.2 0 0 1-51.2-51.2v-153.6a51.2 51.2 0 0 1 51.2-51.2h153.6v-51.2h-102.4a102.4 102.4 0 0 1-102.4-102.4V256a102.4 102.4 0 0 1 102.4-102.4h76.8V51.2a51.2 51.2 0 0 1 51.2-51.2h281.6z m128 844.8H230.4v102.4h563.2v-102.4z m-179.2 25.6v51.2h-204.8v-51.2h204.8z m-256 0v51.2h-76.8v-51.2h76.8z m384 0v51.2h-76.8v-51.2h76.8z m-179.2-153.6h-102.4v51.2h102.4v-51.2zM51.2 281.6a51.2 51.2 0 0 1 51.2 51.2v153.6a51.2 51.2 0 1 1-102.4 0v-153.6a51.2 51.2 0 0 1 51.2-51.2z m921.6 0a51.2 51.2 0 0 1 51.2 51.2v153.6a51.2 51.2 0 1 1-102.4 0v-153.6a51.2 51.2 0 0 1 51.2-51.2z m-640 51.2a76.8 76.8 0 1 0 0 153.6 76.8 76.8 0 0 0 0-153.6z m358.4 0a76.8 76.8 0 1 0 0 153.6 76.8 76.8 0 0 0 0-153.6zM640 76.8h-230.4v76.8h230.4V76.8z" fill="#8a8a8a" p-id="21295"></path></svg>'


class MessageItem {
    public name: string = ""; // 对话的用户昵称
    public isRobot: boolean = true; // 是否是机器人
    public avatar: string = ""; // 对话的用户头像
    public message: string = ""; // 对话的消息内容
    public reasoningContent: string = ""; // 对话的思考内容
    public userPrompt: string = ""; // 对话的用户输入
    public contextAreaInfo: ContextAreaInfo = {
        fileName: "",
        fileText: "",
    };
    public status: "init" | "answering" | "stop" | "finish" = "init"; // 对话的状态
    public setMessage = (message: string) => {
        this.message = message;
    };
    public setReasoningContent = (reasoningContent: string) => {
        this.reasoningContent = reasoningContent;
    };
    constructor(name: string,
        isRobot: boolean,
        avatar: string,
        message: string,
        reasoningContent: string,
        contextAreaInfo: ContextAreaInfo) {

        this.name = name;
        this.isRobot = isRobot;
        this.avatar = avatar;
        this.message = message;
        this.reasoningContent = reasoningContent;
        this.contextAreaInfo = contextAreaInfo;
    }
};

function ChatContainer() {

    const [messagesList, setMessagesList] = useState<MessageItem[]>([])
    const [sendingMessage, setSendingMessage] = useState(false);

    const [count, setCount] = useState(0);
    useEffect(() => {
        let randMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
        let messageItem = new MessageItem(randMessage.name, randMessage.isRobot, randMessage.avatar,
            randMessage.message, randMessage.reasoningContent, randMessage.contextAreaInfo)
        messageItem.name = randMessage.name
        messageItem.isRobot = randMessage.isRobot
        messageItem.avatar = randMessage.avatar
        messageItem.message = randMessage.message; //Base64.decode(testHelloString)

        pushMessagesList(messageItem)
    }, [])


    useEffect(() => {
        let dom = document.getElementById('chat_items')
        dom?.scrollTo({
            top: dom.scrollHeight,
            behavior: 'smooth'
        });
    }, [count]

    )

    let pushMessagesList = (message: MessageItem) => {
        // debugger
        console.log(`push message ${message.message}`)
        setMessagesList(messagesList => {
            return messagesList.concat(message)
        })
        setCount(count => count + 1)
    };



    const onInputMessage = (userPrompt: string, contextAreaInfo: ContextAreaInfo, promptTemplate: string) => {

        console.log(`get input message ${userPrompt}`)
        let messageItem = new MessageItem(mockUser.name, false, mockUser.avatar, userPrompt, "", contextAreaInfo)
        pushMessagesList(messageItem)
        let answerMessageItem = new MessageItem(mockUser.name, true, mockUser.avatar, "", "", contextAreaInfo)
        answerMessageItem.status = "answering"
        answerMessageItem.userPrompt = userPrompt
        pushMessagesList(answerMessageItem)
        setSendingMessage(true)
        LLMService.sendText(userPrompt, contextAreaInfo, promptTemplate,
            (reasoningContent: string, answerContent: string, isEnd: boolean) => {
                if (answerMessageItem.status === "stop") {
                    return
                }
                answerMessageItem.setReasoningContent(reasoningContent);
                answerMessageItem.setMessage(answerContent);
                setCount(count => count + 1)
                if (isEnd) {
                    answerMessageItem.status = "finish"
                    setSendingMessage(false)
                }
            })
    }

    const onApplyCode = (code: string) => {
        console.log(`apply code ${code}`)
    }

    function onStopSendingMessage(): void {
        messagesList[messagesList.length - 1].status = "stop"
        setSendingMessage(false)
    }

    const mockUser = { name: '企鵝豆豆', avatar: Utils.svgToDataURL(robotIcon) }


    const mockMessages: MessageItem[] = [
        new MessageItem('用户1', true, Utils.svgToDataURL(robotIcon), '你好，我是DeepAI编程助手有什么可以帮您？', '我的思考过程', {
            fileName: "",
            fileText: "",
        }),
    ]



    return (
        <>
            <div id="chat_container">
                <div id="chat_items">
                    {messagesList.map((item, index) => (
                        <ChatItem key={index}
                            id={index}
                            name={item.name}
                            isRobot={item.isRobot}
                            avatar={item.avatar}
                            message={item.message}
                            reasoning={item.reasoningContent}
                            userPrompt={item.userPrompt}
                            contextAreaInfo={item.contextAreaInfo}>
                        </ChatItem>
                    ))}
                </div>
                <InputArea
                    onSendMessage={onInputMessage}
                    onApplyCode={onApplyCode}
                    onStopSendingMessage={onStopSendingMessage}
                    sendingMessage={sendingMessage}>
                </InputArea>
            </div>

        </>
    );
}

export default ChatContainer;