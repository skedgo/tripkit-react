import LocalStorageItem from "./LocalStorageItem";
import TKUserProfile from "../model/options/TKUserProfile";
declare class OptionsData extends LocalStorageItem<TKUserProfile> {
    private static _instance;
    static get instance(): OptionsData;
}
export default OptionsData;
