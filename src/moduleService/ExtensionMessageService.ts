import { emit } from "process"
import ChatViewProvider from "../chat/webview/ChatWebview"
import Stream, { ReqMessage, RespMessage } from "./idl/extensionService"
import { isStreamMethod, LLMStream } from "./idl/extensionServiceModel";
import { ExtensionServiceImpl } from "./ExtensionServiceImpl";

class ReqMessageImpl implements ReqMessage {
    fromServiceName: string = "";
    toServiceName: string = "";
    methodName: string = "";
    callId: string = ""; // 用于标识请求和响应的对应关系
    req: any = null;
    stream?: boolean | undefined;
}
class RespMessageImpl implements RespMessage {
    fromServiceName: string = "";
    toServiceName: string = "";
    methodName: string = "";
    callId: string = ""; // 用于标识请求和响应的对应关系
    sequenceId: number = 0;
    resp: any = null;
    end?: boolean | undefined;
    stream?: boolean | undefined;
}
export class ExtensionMessageService {
    private static chatViewProvider: ChatViewProvider;

    public static setChatViewProvider(chatViewProvider: ChatViewProvider) {
        this.chatViewProvider = chatViewProvider;
    }
    private static instance: ExtensionMessageService;

    private constructor() { }

    public static getInstance(): ExtensionMessageService {
        if (!this.instance) {
            this.instance = new ExtensionMessageService();
        }
        return this.instance;
    }

    public handleMessage(message: ReqMessage) {
        let extensionServiceImpl = ExtensionServiceImpl.getInstance();
        const methodName = message.methodName as keyof ExtensionServiceImpl;
        if (typeof extensionServiceImpl[methodName] !== 'function') {
            throw new Error(`Method ${message.methodName} does not exist on ExtensionServiceImpl`);
        }
        console.log(`handleMessage`, message)
        extensionServiceImpl[methodName](message.req).then((resp: any) => {
            if (isStreamMethod(message.toServiceName, message.methodName)) {
                console.log(`handleMessage stream`, resp)
                let sequenceId = 0;
                (async () => {
                    for await (const chunk of resp) {
                          console.log(`handleMessage chunk`, chunk)
                        let respMessage = new RespMessageImpl();
                        respMessage.fromServiceName = "ExtensionService";
                        respMessage.toServiceName = message.fromServiceName;
                        respMessage.methodName = message.methodName;
                        respMessage.callId = message.callId;
                        respMessage.sequenceId = sequenceId++;
                        respMessage.resp = chunk;
                        this.emitEvent(respMessage);
                    }
                    let respMessage = new RespMessageImpl();
                    respMessage.fromServiceName = "ExtensionService";
                    respMessage.toServiceName = message.fromServiceName;
                    respMessage.methodName = message.methodName;
                    respMessage.callId = message.callId;
                    respMessage.sequenceId = sequenceId++;
                    respMessage.end = true;
                    respMessage.resp = null;
                    this.emitEvent(respMessage);
                })();
            } else {
                let respMessage = new RespMessageImpl();
                respMessage.fromServiceName = "ExtensionService";
                respMessage.toServiceName = message.fromServiceName;
                respMessage.methodName = message.methodName;
                respMessage.callId = message.callId;
                respMessage.sequenceId = 0;
                respMessage.resp = resp;
                this.emitEvent(respMessage);
            }
        });
        //

    }

    public emitEvent(respMessage: RespMessage) {
        ExtensionMessageService.chatViewProvider.getView()?.webview.postMessage(respMessage);
    }
}
