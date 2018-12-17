import FavouriteTrip from "../model/FavouriteTrip";
import Options from "../model/Options";
import LocalStorageItemArray from "./LocalStorageItemArray";
import Util from "../util/Util";
import Location from "../model/Location";

class FavouritesData extends LocalStorageItemArray<FavouriteTrip> {

    private static _instance: FavouritesData;
    private static _recInstance: FavouritesData;

    public static get instance(): FavouritesData {
        if (!this._instance) {
            this._instance = new FavouritesData(FavouriteTrip,"FAVOURITES");
        }
        return this._instance;
    }

    static get recInstance(): FavouritesData {
        if (!this._recInstance) {
            this._recInstance = new FavouritesData(FavouriteTrip, "RECENT");
        }
        return this._recInstance;
    }

    public add(elem: FavouriteTrip): void {
        if (elem.from.isCurrLoc()) {
            elem = Util.iAssign(elem, {from: Location.createCurrLoc()})
        }
        if (elem.to.isCurrLoc()) {
            elem = Util.iAssign(elem, {to: Location.createCurrLoc()})
        }
        super.add(elem);
    }

    // private static getTestFavourites(): FavouriteTrip[] {
    //     return [
    //         FavouriteTrip.create(
    //             Location.create(LatLng.createLatLng(-33.8674899, 151.2048442), "Test loc 1", "lalala", ""),
    //             Location.create(LatLng.createLatLng(-33.9, 151.1), "Test loc 2", "lalala2", "")
    //         ),
    //         FavouriteTrip.create(
    //             Location.create(LatLng.createLatLng(-33.8674899, 151.2048442), "Test loc 1", "lalala", ""),
    //             Location.create(LatLng.createLatLng(-33.9, 151.1), "Test loc 2", "lalala2", "")
    //         )
    //     ];
    // }

    public static getFavOptionsPart(options: Options): any {
        const favPart: any = Object.assign({}, options);
        delete favPart._mapLayers;
        return favPart;
    }

}

export default FavouritesData;