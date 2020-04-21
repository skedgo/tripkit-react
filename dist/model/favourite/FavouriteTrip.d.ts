import Location from "../Location";
import Favourite from "./Favourite";
import TKUserProfile from "../options/TKUserProfile";
declare class FavouriteTrip extends Favourite {
    type: string;
    private _from;
    private _to;
    private _options;
    static createForLocation(to: Location): FavouriteTrip;
    static create(from: Location, to: Location): FavouriteTrip;
    get from(): Location;
    set from(value: Location);
    get to(): Location;
    set to(value: Location);
    get options(): TKUserProfile | undefined;
    set options(value: TKUserProfile | undefined);
    getKey(): string;
    equals(other: any): boolean;
}
export default FavouriteTrip;
