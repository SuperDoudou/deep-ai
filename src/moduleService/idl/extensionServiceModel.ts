export const isStreamMethod = (toServiceName: string, methodName: string) => {
    return toServiceName === 'ExtensionService' && methodName === 'chat';
}

export class LLMChunk {
    reasoningContent: string = ''
    content: string = ''
    constructor(data?: { reasoningContent: string, content: string }) {
        if (data) {
            this.reasoningContent = data.reasoningContent;
            this.content = data.content;
        }
    }
}
export class LLMStream {
    private reasoningContent: string[] = [];
    private content: string[] = [];
    private reasoningIndex: number = 0;
    private contentIndex: number = 0;
    private resolve!: (c: LLMChunk) => void;

    private waitingPromise: Promise<LLMChunk> = new Promise((resolve) => {
        this.resolve = resolve;
    });
    private isStreamClosed: boolean = false;

    constructor() {

    }

    // 实现 [Symbol.asyncIterator] 方法
    [Symbol.asyncIterator]() {
        // 重置状态，允许多次迭代
        this.reasoningIndex = 0;
        this.contentIndex = 0;
        this.isStreamClosed = false;

        return {
            // 实现 next 方法
            next: async (): Promise<{ value: LLMChunk; done: boolean }> => {
                if (this.isStreamClosed) {
                    return { value: new LLMChunk(), done: true };
                }

                // 模拟异步操作
                await this.waitingPromise;

                const reasoningContent = this.reasoningContent[this.reasoningIndex++];
                const content = this.content[this.contentIndex++];
                if (reasoningContent || content) {
                    return { value: new LLMChunk({ reasoningContent, content }), done: false };
                } else {
                    return { value: new LLMChunk(), done: true };
                }
            },

            // 实现 return 方法（用于提前终止迭代）
            return: async (): Promise<{ value: LLMChunk; done: boolean }> => {
                this.isStreamClosed = true;
                return { value: new LLMChunk(), done: true };
            }
        };
    }

    // 可以添加其他辅助方法
    addData(reasoningContent: string, content: string, isEnd: boolean): void {
        this.reasoningContent.push(reasoningContent);
        this.content.push(content);
        if (isEnd) {
            this.isStreamClosed = true;
        }
        this.resolve({ reasoningContent, content });
        this.waitingPromise = new Promise((resolve) => { this.resolve = resolve; });
    }

}

class MessageChunk {

}

export class MessageStream {
    private resolve!: (c: MessageChunk) => void;

    private chunkMap: Map<number, MessageChunk> = new Map()
    private sortedSequenceList: number[] = []

    private waitingPromise: Promise<MessageChunk> = new Promise((resolve) => {
        this.resolve = resolve;
    });
    private isStreamClosed: boolean = false;

    constructor() {

    }

    // 实现 [Symbol.asyncIterator] 方法
    [Symbol.asyncIterator]() {
        // 重置状态，允许多次迭代
        this.isStreamClosed = false;

        return {
            // 实现 next 方法
            next: async (): Promise<{ value: MessageChunk; done: boolean }> => {
                if (this.isStreamClosed) {
                    return { value: new MessageChunk(), done: true };
                }

                // 模拟异步操作
                await this.waitingPromise;

                for (;this.sortedSequenceList.length > 0;) {
                    const sequenceId = this.sortedSequenceList.shift()
                    if (sequenceId) {
                        const chunk = this.chunkMap.get(sequenceId)
                        if (chunk) {
                            this.chunkMap.delete(sequenceId)
                            return { value: chunk, done: false };
                        }
                    }
                }
                if (this.isStreamClosed) {
                    return { value: new MessageChunk(), done: true };
                }
                return { value: new MessageChunk(), done: false };
            },
            // 实现 return 方法（用于提前终止迭代）
            return: async (): Promise<{ value: LLMChunk; done: boolean }> => {
                this.isStreamClosed = true;
                return { value: new LLMChunk(), done: true };
            }
        };
    }

    // 可以添加其他辅助方法
    addData(t: MessageChunk, sequenceId: number, isEnd: boolean): void {
        this.chunkMap.set(sequenceId, t)
        this.sortedSequenceList.push(sequenceId)
        this.sortedSequenceList.sort((a, b) => a - b)

        if (isEnd) {
            this.isStreamClosed = true;
        }
        this.resolve(t);
        this.waitingPromise = new Promise((resolve) => { this.resolve = resolve; });
    }

}