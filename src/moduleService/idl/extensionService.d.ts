import { ModelItem } from "../../chat/app/GlobalStateProvider"

interface BaseMessage {
    fromServiceName: string
    toServiceName: string
    methodName: string
    callId: string // 用于标识请求和响应的对应关系
}
interface ReqMessage extends BaseMessage {
    req: any
}

interface RespMessage extends BaseMessage {
    sequenceId: number
    end?: boolean
    resp: any //单次调用的时候返回的是resp、流式调用的时候返回的是chunk
}

export interface Chunk {
    reasoningContent: string
    content: string
}

export interface Stream {
    [Symbol.asyncIterator](): {
        next: () => Promise<{ value: Chunk; done: boolean }>;
        return: () => Promise<{ value: Chunk; done: boolean }>;
    }
}
export interface ExtensionService {
    chat: ({ }: { prompt: string }) => Promise<Stream>;
    getEditorContext: () => Promise<{
        filePath: string
        fileText: string
    }>
    updateChatPromptTemplate: ({ }: { promptTemplate: string }) => Promise<void>
    getModelList: () => Promise<ModelItem[]>
    setModelList: ({ }: { modelList: ModelItem[] }) => Promise<void>
}