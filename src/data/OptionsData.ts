import Options from "../model/Options";
import LocalStorageItem from "./LocalStorageItem";

class OptionsData extends LocalStorageItem<Options> {

    private static _instance: OptionsData;

    public static get instance(): OptionsData {
        if (!this._instance) {
            this._instance = new OptionsData(Options,"OPTIONS");
        }
        return this._instance;
    }

}

export default OptionsData;