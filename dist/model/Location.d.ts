import LatLng from '../model/LatLng';
import GeocodingSource from "../location_box/GeocodingSource";
declare class Location extends LatLng {
    private _class;
    private _address;
    private _name;
    private _id;
    private _source;
    private _suggestion?;
    static create(latlng: LatLng, address: string, id: string, name: string, source?: GeocodingSource): Location;
    private static readonly currLocText;
    static createCurrLoc(): Location;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    isResolved(): boolean;
    getKey(): string;
    class: string;
    address: string;
    name: string;
    id: string;
    source: GeocodingSource | undefined;
    suggestion: any;
    getDisplayString(): string;
    isCurrLoc(): boolean;
    toJson(): object;
}
export default Location;
