import { AcceptCurrentEditorTextEvent, UpdateCurrentEditorTextEvent, UpdateModelEvent } from "../../Constant";
import AppMessage from "./AppMessage";
import { ModelItem } from "./GlobalStateProvider";

class VsCodeService {

    public static updateTextEditor(text: string) {
        let event = new UpdateCurrentEditorTextEvent()
        event.injectData("", text)
        AppMessage.sendMessage(event)
    }

    public static acceptTextEditor(filePath: string) {
        let event = new AcceptCurrentEditorTextEvent()
        // event.injectData("")
        AppMessage.sendMessage(event)
    }

    public static updateModel(modelItems: ModelItem[]){
        let event = new UpdateModelEvent()
        event.injectData(modelItems)
    }
}
export default VsCodeService;
