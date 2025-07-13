import { ChatAcceptCurrentEditorTextEvent, UpdateCurrentEditorTextEvent, UpdateModelEvent, UpdatePromptTemplateEvent } from "../../Constant";
import AppMessage from "./AppMessage";
import { ModelItem } from "./GlobalStateProvider";

class VsCodeService {

    public static updateTextEditor(uniqueKey: string, text: string) {
        let event = new UpdateCurrentEditorTextEvent()
        event.injectData(uniqueKey, "", text)
        AppMessage.sendMessage(event)
    }

    public static acceptTextEditor(filePath: string) {
        let event = new ChatAcceptCurrentEditorTextEvent()
        // event.injectData("")
        AppMessage.sendMessage(event)
    }

    public static updateModel(modelItems: ModelItem[]) {
        let event = new UpdateModelEvent()
        event.injectData(modelItems)
        AppMessage.sendMessage(event)
    }

    public static updatePromptTemplate(promptTemplate: string) {
        let event = new UpdatePromptTemplateEvent() 
        event.injectData(promptTemplate)
        AppMessage.sendMessage(event)
    }
}
export default VsCodeService;
