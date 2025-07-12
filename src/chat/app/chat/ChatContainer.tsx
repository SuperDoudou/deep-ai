import React, { useEffect, useRef, useState } from 'react';
import InputArea from './InputArea';
import ChatItem from './ChatItem';
import svg from '../../../resources/robot.svg'
import App from '../App';
import AppMessage from '../AppMessage';
import Utils from '../Utils';
import { Base64 } from 'js-base64';
import { ContextAreaInfo } from './ContextArea';
import { LLMService } from './LLMService';

const testHelloString = "YGBganNvbgp7CgkiY29tcGlsZXJPcHRpb25zIjogewoJCSJtb2R1bGUiOiAiTm9kZTE2IiwKCQkidGFyZ2V0IjogIkVTMjAyMiIsCgkJImxpYiI6IFsKCQkJIkVTMjAyMiIsCgkJCSJET00iLAoJCQkiRE9NLkl0ZXJhYmxlIgoJCV0sCgkJInNvdXJjZU1hcCI6IHRydWUsCgkJInJvb3REaXIiOiAic3JjIiwKCQkianN4IjogInJlYWN0IiwKCQkic3RyaWN0IjogdHJ1ZQoJfQp9Cg=="



class MessageItem {
    public name: string = ""; // 对话的用户昵称
    public isRobot: boolean = true; // 是否是机器人
    public avatar: string = ""; // 对话的用户头像
    public message: string = ""; // 对话的消息内容
    public reasoningContent: string = ""; // 对话的思考内容
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
    const llmServiceRef = useRef(null)
    useEffect(() => {
        let randMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
        let messageItem = new MessageItem(randMessage.name, randMessage.isRobot, randMessage.avatar,
            randMessage.message, randMessage.reasoningContent, randMessage.contextAreaInfo)
        messageItem.name = randMessage.name
        messageItem.isRobot = randMessage.isRobot
        messageItem.avatar = randMessage.avatar
        messageItem.message = Base64.decode(testHelloString)

        pushMessagesList(messageItem)
    }, [])


    useEffect(() => {
        let dom = document.getElementById('chat_items')
        dom.scrollTo({
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



    const onInputMessage = (message: string, contextAreaInfo: ContextAreaInfo, promptTemplate: string) => {

        console.log(`get input message ${message}`)
        let messageItem = new MessageItem(mockUser.name, false, mockUser.avatar, message, "", contextAreaInfo)
        pushMessagesList(messageItem)
        let answerMessageItem = new MessageItem(mockUser.name, true, mockUser.avatar, "", "", contextAreaInfo)
        answerMessageItem.status = "answering"
        pushMessagesList(answerMessageItem)
        setSendingMessage(true)
        llmServiceRef.current?.sendText(message, contextAreaInfo, promptTemplate,
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

    const mockUser = { name: '企鵝豆豆', avatar: Utils.svgToDataURL(svg) }


    const mockMessages: MessageItem[] = [
        new MessageItem('用户1', true, Utils.svgToDataURL(svg), '你好，这是第一条消息', '这是第一条消息的思考过程', {
            fileName: "",
            fileText: "",
        }),
        new MessageItem('用户2', true, Utils.svgToDataURL(svg), '今天的会议安排如何？', '这是第一条消息的思考过程222', {
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
                            name={item.name}
                            isRobot={item.isRobot}
                            avatar={item.avatar}
                            message={item.message}
                            reasoning={item.reasoningContent}
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
                <LLMService ref={llmServiceRef}></LLMService>
            </div>

        </>
    );
}

export default ChatContainer;