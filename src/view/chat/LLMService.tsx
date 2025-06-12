import OpenAI from "openai";

class LLMService {
    private static openai: OpenAI;
    public static init = async () => {
        this.openai = new OpenAI(
            {
                // 若没有配置环境变量，请用阿里云百炼API Key将下行替换为：apiKey: "sk-xxx",
                apiKey: "",
                baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
                dangerouslyAllowBrowser: true,
            }
        );
    }

    public static sendText = async (message: string,
        updateReasoning: (reasoningContent: string) => void,
        updateAnswer: (answer: string) => void) => {

        const stream = await this.openai.chat.completions.create({
            model: "deepseek-r1-distill-llama-70b",  // 此处以 deepseek-r1 为例，可按需更换模型名称。
            messages: [
                { role: "user", content: message }
            ],
            stream: true,  // 开启流式输出。
        });
        let reasoningContent = '';
        let answerContent = '';
        let isAnswering = false;
        for await (const chunk of stream) {
            if (!chunk.choices?.length) {
                console.log('\nUsage:');
                console.log(chunk.usage);
                continue;
            }

            const delta = chunk.choices[0].delta;

            // 处理思考过程
            if (delta.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                console.log(`` + reasoningContent)
                updateReasoning(reasoningContent);
            }
            // 处理正式回复
            else if (delta.content) {
                if (!isAnswering) {
                    console.log('\n' + '='.repeat(20) + '完整回复' + '='.repeat(20) + '\n');
                    isAnswering = true;
                }
                answerContent += delta.content;
                console.log(`` + answerContent)
                updateAnswer(answerContent);
            }
        }
    }



}
export default LLMService;