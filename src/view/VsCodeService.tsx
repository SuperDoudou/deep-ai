import { AcceptCurrentEditorTextEvent, UpdateCurrentEditorTextEvent } from "../Constant";
import AppMessage from "./AppMessage";

class VsCodeService {

    public static updateTextEditor(text: string) {
        let event = new UpdateCurrentEditorTextEvent()
        event.injectData("", text)
        AppMessage.sendMessage(event)
    }

    public static acceptTextEditor(filePath: string) {
        let event = new AcceptCurrentEditorTextEvent()
        event.injectData("")
        AppMessage.sendMessage(event)
    }
}
export default VsCodeService;
