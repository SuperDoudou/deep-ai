import { ReqMessage, RespMessage } from "./idl/extensionService"
import { isStreamMethod, LLMChunk, LLMStream, MessageStream } from "./idl/extensionServiceModel";

class SteamMessage {
  private chunks: any[] = []
  private addChunk(chunk: any) {
    this.chunks.push(chunk)
  }
}
class ModuleAppMessage {

  private static respMap: Map<string, (resp: any) => void> = new Map()
  private static streamRespMap: Map<string, MessageStream> = new Map()

  public static sendRequest = (toServiceName: string, method: string, req: any, stream?: boolean): Promise<any> => {
    const message: ReqMessage = {
      fromServiceName: "ChatService",
      toServiceName,
      methodName: method,
      callId: Date.now().toString() + "|" + Math.random().toString(),
      req,
    }
    if (window.parent) {
      // dev mode
      console.log("post message to parent", message)
      window.parent.postMessage(message, "*"); // 替换为目标来源
    } else {
      // prod mode
      // @ts-ignore
      vscode?.postMessage(message);
    }
    const key = `${toServiceName}-${method}-${message.callId}`;
    return new Promise((resolve, reject) => {
      this.respMap.set(key, resolve)
    });
  };

  public static init() {
    window.addEventListener('message', (event) => {
      // 验证来源域名
      let innerMessage: RespMessage = JSON.parse(JSON.stringify(event.data)) as RespMessage;
      const key = `${innerMessage.fromServiceName}-${innerMessage.methodName}-${innerMessage.callId}`;

      const resolve = this.respMap.get(key)
      const isStream = isStreamMethod(innerMessage.fromServiceName, innerMessage.methodName)
      if (resolve) {
        if (isStream) {
          let stream = this.streamRespMap.get(key)
          if (!stream) {
            stream = new MessageStream()
            this.streamRespMap.set(key, stream)
            resolve(stream);
          }
          stream.addData(innerMessage.resp, innerMessage.sequenceId, innerMessage.end || false)
          
        } else {

          this.respMap.delete(key);
          resolve(innerMessage.resp);
        }
      }
    });

  }
}
export default ModuleAppMessage;

