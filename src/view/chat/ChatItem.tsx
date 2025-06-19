import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Utils from '../Utils';
import VsCodeService from '../VsCodeService';


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

const languageIcon = '<svg t="1749741615755" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2626" width="32" height="32"><path d="M335 274.1c-14.1-14.1-36.9-14.1-50.9 0L75.4 482.7c-6.8 6.8-10.5 15.9-10.5 25.5s3.8 18.7 10.5 25.5L284 742.3c7 7 16.2 10.5 25.5 10.5s18.4-3.5 25.5-10.5c14.1-14.1 14.1-36.9 0-50.9L151.8 508.2 335 325.1c14-14.1 14-36.9 0-51zM949.5 482.7L740.9 274.1c-14.1-14.1-36.9-14.1-50.9 0-14.1 14.1-14.1 36.9 0 50.9l183.1 183.1-183.2 183.2c-14.1 14.1-14.1 36.9 0 50.9 7 7 16.2 10.5 25.5 10.5s18.4-3.5 25.5-10.5l208.6-208.6c14-14 14-36.8 0-50.9zM608.7 176.3c-19.1-5.4-39 5.7-44.4 24.8L391.1 812.5c-5.4 19.1 5.7 39 24.8 44.4 3.3 0.9 6.6 1.4 9.8 1.4 15.7 0 30.1-10.3 34.6-26.2l173.2-611.4c5.5-19.1-5.7-39-24.8-44.4z" p-id="2627" fill="#cdcdcd"></path></svg>'
const insertIcon = '<svg t="1749893062624" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6621" width="32" height="32"><path d="M682.666667 568.888889 68.266667 568.888889C28.444444 568.888889 0 585.955556 0 614.4l0 28.444444C0 665.6 28.444444 682.666667 68.266667 682.666667L682.666667 682.666667c39.822222 0 56.888889-11.377778 56.888889-39.822222l0-39.822222C739.555556 580.266667 722.488889 568.888889 682.666667 568.888889zM682.666667 796.444444 68.266667 796.444444C28.444444 796.444444 0 813.511111 0 841.955556l0 28.444444C0 893.155556 28.444444 910.222222 68.266667 910.222222L682.666667 910.222222c39.822222 0 56.888889-11.377778 56.888889-39.822222l0-39.822222C739.555556 807.822222 722.488889 796.444444 682.666667 796.444444zM0 170.666667l0 5.688889C0 176.355556 0 176.355556 0 170.666667 0 170.666667 0 170.666667 0 170.666667zM56.888889 227.555556l625.777778 0c39.822222 0 56.888889-22.755556 56.888889-56.888889s-17.066667-56.888889-56.888889-56.888889L56.888889 113.777778C22.755556 113.777778 0 142.222222 0 176.355556 0 210.488889 22.755556 227.555556 56.888889 227.555556zM950.044444 233.244444l-187.733333 119.466667c-28.444444 17.066667-28.444444 68.266667 0 85.333333l187.733333 119.466667c34.133333 22.755556 73.955556-5.688889 73.955556-45.511111L1024 278.755556C1024 238.933333 978.488889 216.177778 950.044444 233.244444z" p-id="6622" fill="#bfbfbf"></path></svg>'
const copyIcon = '<svg t="1749892978072" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4638" width="32" height="32"><path d="M704 202.666667a96 96 0 0 1 96 96v554.666666a96 96 0 0 1-96 96H213.333333A96 96 0 0 1 117.333333 853.333333V298.666667A96 96 0 0 1 213.333333 202.666667h490.666667z m0 64H213.333333A32 32 0 0 0 181.333333 298.666667v554.666666a32 32 0 0 0 32 32h490.666667a32 32 0 0 0 32-32V298.666667a32 32 0 0 0-32-32z" fill="#bfbfbf" p-id="4639"></path><path d="M277.333333 362.666667m32 0l298.666667 0q32 0 32 32l0 0q0 32-32 32l-298.666667 0q-32 0-32-32l0 0q0-32 32-32Z" fill="#bfbfbf" p-id="4640"></path><path d="M277.333333 512m32 0l298.666667 0q32 0 32 32l0 0q0 32-32 32l-298.666667 0q-32 0-32-32l0 0q0-32 32-32Z" fill="#bfbfbf" p-id="4641"></path><path d="M277.333333 661.333333m32 0l170.666667 0q32 0 32 32l0 0q0 32-32 32l-170.666667 0q-32 0-32-32l0 0q0-32 32-32Z" fill="#bfbfbf" p-id="4642"></path><path d="M320 138.666667h512A32 32 0 0 1 864 170.666667v576a32 32 0 0 0 64 0V170.666667A96 96 0 0 0 832 74.666667H320a32 32 0 0 0 0 64z" fill="#bfbfbf" p-id="4643"></path></svg>'

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
                if (!language || language.trim() === "") {
                    language = "text";
                }
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
            {
                reasoning && reasoning !== "" && (
                    <div className="chat-item-reasoning-content">
                        {reasoning}
                    </div>
                )

            }
            <div className="chat-item-content">
                {/* 遍历消息块，根据类型渲染不同的消息 */}
                {messageBlocks.map((block, index) => {
                    if (block.type === "text") {
                        return <p key={index}>{block.content}</p>;
                    }
                    else if (block.type === "code") {
                        return (
                            <div key={index}>
                                <div className="chat-item-language-block">

                                    <div className="chat-item-language-left">
                                        <img className="chat-item-language-icon"
                                            src={Utils.svgToDataURL(languageIcon)}></img>
                                        <div className="chat-item-language-name">{block.language}</div>
                                    </div>
                                    <div className="chat-item-language-right">
                                        <img className="chat-item-language-button"
                                            title='复制'
                                            src={Utils.svgToDataURL(copyIcon)}
                                            onClick={() => { Utils.copyTextToClipboard(block.content) }}></img>

                                        <img className="chat-item-language-button"
                                            src={Utils.svgToDataURL(insertIcon)}
                                            title='应用代码'
                                            onClick={() => {
                                                VsCodeService.updateTextEditor(block.content)
                                            }}></img>
                                    </div>
                                </div>
                                <SyntaxHighlighter
                                    language={block.language}  // 修改此处为动态语言类型
                                    className="custom-scroll"
                                    style={atomDark}
                                    wrapLines={true}
                                    customStyle={{
                                        paddingLeft: '0px',
                                        marginLeft: '0px',
                                        overflow: 'auto',
                                    }}  >
                                    {block.content}
                                </SyntaxHighlighter>
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    );
}

export default ChatItem;