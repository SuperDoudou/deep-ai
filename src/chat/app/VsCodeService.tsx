import { ChatAcceptCurrentEditorTextEvent, UpdateCurrentEditorTextEvent, UpdateModelEvent, UpdatePromptTemplateEvent } from "../../Constant";
import AppMessage from "../../moduleService/ModuleAppMessage";
import { ModelItem } from "./GlobalStateProvider";

class VsCodeService {

    public static updateTextEditor(uniqueKey: string, text: string) {
        let event = new UpdateCurrentEditorTextEvent()
        event.injectData(uniqueKey, "", text)
    }

    public static acceptTextEditor(filePath: string) {
        let event = new ChatAcceptCurrentEditorTextEvent()
        // event.injectData("")
    }

    public static updateModel(modelItems: ModelItem[]) {
        let event = new UpdateModelEvent()
        event.injectData(modelItems)
    }

}
export default VsCodeService;
