import LocalStorageItem from "./LocalStorageItem";
import TKUserProfile from "../model/options/TKUserProfile";

class OptionsData extends LocalStorageItem<TKUserProfile> {

    private static _instance: OptionsData;

    public static get instance(): OptionsData {
        if (!this._instance) {
            this._instance = new OptionsData(TKUserProfile,"OPTIONS");
        }
        return this._instance;
    }

}

export default OptionsData;