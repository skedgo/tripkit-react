import FavouriteTrip from "../model/favourite/FavouriteTrip";
import LocalStorageItemArray from "./LocalStorageItemArray";
import Location from "../model/Location";
import Favourite from "../model/favourite/Favourite";
import TKUserProfile from "../model/options/TKUserProfile";
declare class FavouritesData extends LocalStorageItemArray<Favourite> {
    private static _instance;
    private static _recInstance;
    static get instance(): FavouritesData;
    static get recInstance(): FavouritesData;
    private limit?;
    protected deserialize(itemJson: any): Favourite[];
    save(update: FavouriteTrip[]): void;
    add(elem: Favourite): void;
    getFavouriteTrips(): FavouriteTrip[];
    getLocations(): Location[];
    static getFavOptionsPart(options: TKUserProfile): any;
}
export default FavouritesData;
