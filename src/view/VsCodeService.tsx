import { UpdateCurrentEditorTextEvent } from "../Constant";
import AppMessage from "./AppMessage";

class VsCodeService {

    public static updateTextEditor(text: string) {
        let event = new UpdateCurrentEditorTextEvent()
        event.injectData("", text)
        AppMessage.sendMessage(event)
    }
}
export default VsCodeService;
