import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
declare class MultiGeocoderOptions {
    static default(showCurrLoc?: boolean): MultiGeocoderOptions;
    showCurrLoc: boolean;
    geocoders: IGeocoder[];
    compare: (l1: Location, l2: Location, query: string) => number;
    analogResults: (r1: Location, r2: Location) => boolean;
    constructor(showCurrLoc: boolean, geocoders: IGeocoder[], compare: (l1: Location, l2: Location, query: string) => number, analogResults: (r1: Location, r2: Location) => boolean);
}
export default MultiGeocoderOptions;
