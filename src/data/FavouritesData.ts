import FavouriteTrip from "../model/FavouriteTrip";
import {JsonConvert} from "json2typescript";
import {EventEmitter, EventSubscription} from "fbemitter";
import Options from "../model/Options";

class FavouritesData {

    private static _instance: FavouritesData;
    private static _recInstance: FavouritesData;

    private eventEmitter: EventEmitter = new EventEmitter();

    public static get instance(): FavouritesData {
        if (!this._instance) {
            this._instance = new FavouritesData( "FAVOURITES");
        }
        return this._instance;
    }

    static get recInstance(): FavouritesData {
        if (!this._recInstance) {
            this._recInstance = new FavouritesData("RECENT");
        }
        return this._recInstance;
    }


    constructor(LOCAL_STORAGE_KEY: string) {
        this.LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEY;
    }

    private readonly LOCAL_STORAGE_KEY: string;

    public addChangeListener(callback: (favourites: FavouriteTrip[]) => void): EventSubscription {
        return this.eventEmitter.addListener('change', callback);
    }

    private fireChangeEvent() {
        this.eventEmitter.emit('change', this.loadFromLS());
    }

    public get(): FavouriteTrip[] {
        return this.loadFromLS();
    }

    public add(favourite: FavouriteTrip, callback?: () => void) {
        const favourites = this.loadFromLS();
        const foundFavIndex = favourites.findIndex((element: FavouriteTrip) => favourite.getKey() === element.getKey());
        if (foundFavIndex !== -1) {
            favourites.splice(foundFavIndex, 1);
        }
        favourites.unshift(favourite);
        this.saveToLS(favourites);
        if (callback) {
            callback();
        }
        this.fireChangeEvent();
    }

    public remove(favourite: FavouriteTrip, callback?: () => void) {
        const favourites = this.loadFromLS();
        const foundFavIndex = favourites.findIndex((element: FavouriteTrip) => favourite.getKey() === element.getKey());
        if (foundFavIndex !== -1) {
            favourites.splice(foundFavIndex, 1);
            this.saveToLS(favourites);
        }
        if (callback) {
            callback();
        }
        this.fireChangeEvent();
    }

    public has(favourite: FavouriteTrip): boolean {
        const favourites = this.loadFromLS();
        const foundFavIndex = favourites.findIndex((element: FavouriteTrip) => favourite.getKey() === element.getKey());
        return foundFavIndex !== -1;
    }

    private loadFromLS(): FavouriteTrip[] {
        const favouritesS = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (favouritesS === null) {
            return [];
        }
        try {
            const favouritesJson = JSON.parse(favouritesS);
            const jsonConvert: JsonConvert = new JsonConvert();
            return favouritesJson.map((favouriteJson: object) => jsonConvert.deserialize(favouriteJson, FavouriteTrip));
        } catch (e) {
            alert("favourites format error");
            return [];
        }
    }

    private saveToLS(favourites: FavouriteTrip[]) {
        const jsonConvert: JsonConvert = new JsonConvert();
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(jsonConvert.serialize(favourites)));
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