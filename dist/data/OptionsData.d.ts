import Options from "../model/Options";
import LocalStorageItem from "./LocalStorageItem";
declare class OptionsData extends LocalStorageItem<Options> {
    private static _instance;
    static readonly instance: OptionsData;
}
export default OptionsData;
