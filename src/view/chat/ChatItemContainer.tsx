import React, { useEffect, useState } from 'react';
import InputArea from './InputArea';
import ChatItem from './ChatItem';
import svg from '../../resources/robot.svg'
import App from '../App';
import AppMessage from '../AppMessage';
import LLMService from './LLMService';
import Utils from '../Utils';
import { Base64 } from 'js-base64';
import { ContextAreaInfo } from './ContextArea';

const testHelloString = "5Lul5LiL5piv5LiA5Liq566A5Y2V55qEIEphdmEgXCJIZWxsbywgV29ybGQhXCIg56iL5bqP77yaCgpgYGBqYXZhCnB1YmxpYyBjbGFzcyBIZWxsb1dvcmxkIHsKICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBtYWluKFN0cmluZ1tdIGFyZ3MpIHsKICAgICAgICBTeXN0ZW0ub3V0LnByaW50bG4oXCJIZWxsbywgV29ybGQhXCIpOwogICAgfQp9CmBgYAoKIyMjIOivtOaYju+8mgoxLiAqKuaWh+S7tuWQjSoq77ya5bCG5LiK6L+w5Luj56CB5L+d5a2Y5Zyo5ZCN5Li6IGBIZWxsb1dvcmxkLmphdmFgIOeahOaWh+S7tuS4reOAggoyLiAqKue8luivkSoq77ya5Zyo57uI56uv5oiW5ZG95Luk5o+Q56S656ym5Lit77yM5a+86Iiq5Yiw5L+d5a2Y6K+l5paH5Lu255qE55uu5b2V77yM54S25ZCO6L+Q6KGM5Lul5LiL5ZG95Luk77yaCiAgIGBgYAogICBqYXZhYyBIZWxsb1dvcmxkLmphdmEKICAgYGBgCiAgIOi/meWwhueUn+aIkOS4gOS4qiBgSGVsbG9Xb3JsZC5jbGFzc2Ag5paH5Lu244CCCjMuICoq6L+Q6KGMKirvvJrlnKjnu4jnq6/miJblkb3ku6Tmj5DnpLrnrKbkuK3vvIzov5DooYzku6XkuIvlkb3ku6TvvJoKICAgYGBgCiAgIGphdmEgSGVsbG9Xb3JsZAogICBgYGAKICAg5L2g5bqU6K+l5Lya55yL5Yiw6L6T5Ye677yaCiAgIGBgYAogICBIZWxsbywgV29ybGQhCiAgIGBgYAoKIyMjIOazqOaEj+S6i+mhue+8mgotIOehruS/neS9oOW3sue7j+WuieijheS6hiBKYXZhIERldmVsb3BtZW50IEtpdCAoSkRLKeOAggotIOehruS/nSBgamF2YWAg5ZKMIGBqYXZhY2Ag5ZG95Luk5Zyo5L2g55qE57O757uf6Lev5b6E5Lit44CCCi0g56Gu5L+d5paH5Lu25ZCN5ZKM57G75ZCN5a6M5YWo5LiA6Ie077yM"



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
        let messageItem = new MessageItem(randMessage.name, randMessage.isRobot, randMessage.avatar,
            randMessage.message, randMessage.reasoningContent)
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



    const onInputMessage = (message: string, contextAreaInfo: ContextAreaInfo) => {

        console.log(`get input message ${message}`)
        let messageItem = new MessageItem(mockUser.name, false, mockUser.avatar, message, "")
        pushMessagesList(messageItem)

        let answerMessageItem = new MessageItem(mockUser.name, true, mockUser.avatar, "", "")
        pushMessagesList(answerMessageItem)
        LLMService.sendText(message, contextAreaInfo,
            (m) => {
                answerMessageItem.setReasoningContent(m);
                setCount(count => count + 1)
            },
            (m) => {
                answerMessageItem.setMessage(m);
                setCount(count => count + 1)
            })

    }

    const mockUser = { name: '企鵝豆豆', avatar: Utils.svgToDataURL(svg) }


    const mockMessages: MessageItem[] = [
        new MessageItem('用户1', true, Utils.svgToDataURL(svg), '你好，这是第一条消息', '这是第一条消息的思考过程'),
        new MessageItem('用户2', true, Utils.svgToDataURL(svg), '今天的会议安排如何？', '这是第一条消息的思考过程222'),
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
                            reasoning={item.reasoningContent}>
                        </ChatItem>
                    ))}
                </div>
                <InputArea onSendMessage={onInputMessage}></InputArea>
            </div>

        </>
    );
}

export default ChatContainer;