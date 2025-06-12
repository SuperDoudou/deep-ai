import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';


interface ChatItemProps {
    name: string;// 用户名
    isRobot: boolean;
    avatar: string;
    message: string;
    reasoning: string;
}

interface MessageBlock {
    type: string; // 消息类型，如 text, code
    language?: string; // 消息语言，如 JavaScript, Python
    content: string; // 消息内容
}


function ChatItem({ name, isRobot, avatar, message, reasoning }: ChatItemProps) {

    let parseMessage = (message: string): MessageBlock[] => {
        let tempResult: MessageBlock[] = [];
        // 解析消息，将其拆分为不同的消息块
        // 这里只是一个简单的示例，实际应用中需要根据具体情况进行解析
        message.split("```").forEach((block, index) => {
            if (index % 2 === 0) {
                tempResult.push({ type: "text", content: block });
            } else {
                let [language, ...content] = block.split("\n");
                tempResult.push({ type: "code", language: language.trim(), content: content.join("\n") });
            }
        });
        return tempResult;
    }
    let messageBlocks = parseMessage(message)
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
            <div className="chat-item-reasoning-content">
                {reasoning}
            </div>
            <div className="chat-item-content">
                {/* 遍历消息块，根据类型渲染不同的消息 */}
                {messageBlocks.map((block, index) => {
                    if (block.type === "text") {
                        return <p key={index}>{block.content}</p>;
                    }
                    else if (block.type === "code") {
                        return (
                            <SyntaxHighlighter
                                language="javascript"
                                className="custom-scroll"
                                style={atomDark}
                                wrapLines={true}
                                customStyle={{
                                    paddingLeft: '0px',
                                    marginLeft: '0px',
                                    overflow: 'auto', // 

                                }}  >
                                {block.content}
                            </SyntaxHighlighter>
                        )
                    }
                })}


            </div>
        </div>
    );
}

export default ChatItem;