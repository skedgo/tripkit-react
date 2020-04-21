import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
declare class MultiGeocoderOptions {
    static default(showCurrLoc?: boolean): MultiGeocoderOptions;
    geocoders: IGeocoder[];
    compare: (l1: Location, l2: Location, query: string) => number;
    analogResults: (r1: Location, r2: Location) => boolean;
    constructor(geocoders: IGeocoder[], compare: (l1: Location, l2: Location, query: string) => number, analogResults: (r1: Location, r2: Location) => boolean);
    getGeocoderById(id: string): IGeocoder | undefined;
}
export default MultiGeocoderOptions;
