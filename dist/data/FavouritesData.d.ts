import FavouriteTrip from "../model/FavouriteTrip";
import Options from "../model/Options";
import LocalStorageItemArray from "./LocalStorageItemArray";
declare class FavouritesData extends LocalStorageItemArray<FavouriteTrip> {
    private static _instance;
    private static _recInstance;
    static readonly instance: FavouritesData;
    static readonly recInstance: FavouritesData;
    add(elem: FavouriteTrip): void;
    static getFavOptionsPart(options: Options): any;
}
export default FavouritesData;
