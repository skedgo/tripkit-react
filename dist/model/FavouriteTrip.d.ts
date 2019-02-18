import Location from "../model/Location";
import Options from "./Options";
declare class FavouriteTrip {
    private _from;
    private _to;
    private _options;
    static create(from: Location, to: Location): FavouriteTrip;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    from: Location;
    to: Location;
    options: Options | undefined;
    getKey(): string;
    equals(other: any): boolean;
}
export default FavouriteTrip;
