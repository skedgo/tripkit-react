import FavouriteTrip from "../model/favourite/FavouriteTrip";
import LocalStorageItemArray from "./LocalStorageItemArray";
import Util from "../util/Util";
import Location from "../model/Location";
import Favourite from "../model/favourite/Favourite";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import TKUserProfile from "../model/options/TKUserProfile";

class FavouritesData extends LocalStorageItemArray<Favourite> {

    private static _instance: FavouritesData;
    private static _recInstance: FavouritesData;

    public static get instance(): FavouritesData {
        if (!this._instance) {
            this._instance = new FavouritesData(Favourite, "FAVOURITES");
        }
        return this._instance;
    }

    static get recInstance(): FavouritesData {
        if (!this._recInstance) {
            this._recInstance = new FavouritesData(Favourite, "RECENT");
            this._recInstance.limit = 20;
        }
        return this._recInstance;
    }

    private limit?: number;

    protected deserialize(itemJson: any): Favourite[] {
        return (itemJson as any[]).map((item: any) =>
            item.stop ? Util.jsonConvert().deserialize(item, FavouriteStop) :
                item.location ? Util.jsonConvert().deserialize(item, FavouriteLocation) :
                Util.jsonConvert().deserialize(item, FavouriteTrip)
        )
    }

    public save(update: FavouriteTrip[]) {
        super.save(this.limit ? update.slice(0, this.limit) : update);
    }

    public add(elem: Favourite): void {
        if (elem instanceof FavouriteTrip) {
            const favouriteTrip = (elem as FavouriteTrip);
            if (favouriteTrip.from.isCurrLoc()) {
                elem = Util.iAssign(favouriteTrip, {from: Location.createCurrLoc()})
            }
            if (favouriteTrip.to.isCurrLoc()) {
                elem = Util.iAssign(favouriteTrip, {to: Location.createCurrLoc()})
            }
        }
        super.add(elem);
    }

    public getFavouriteTrips(): FavouriteTrip[] {
        return this.get().filter((favourite: Favourite) => favourite instanceof FavouriteTrip) as FavouriteTrip[];
    }

    public getLocations(): Location[] {
        return this.get()
            .map((favouriteLoc: Favourite) => favouriteLoc instanceof FavouriteStop ? favouriteLoc.stop :
                (favouriteLoc as FavouriteTrip).to);
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

    public static getFavOptionsPart(options: TKUserProfile): any {
        const favPart: any = Object.assign({}, options);
        delete favPart._mapLayers;
        return favPart;
    }

}

export default FavouritesData;