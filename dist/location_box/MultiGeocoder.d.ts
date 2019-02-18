import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
declare class MultiGeocoder {
    private showCurrLoc;
    private geocoders;
    constructor(showCurrLoc: boolean);
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (query: string, results: Location[]) => void): void;
    resolveLocation(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void;
    reverseGeocode(coord: LatLng, callback: (location: Location | null) => void): void;
    private merge;
    private static mergeSorted;
    static analogResults(r1: Location, r2: Location): boolean;
    private static compare;
    private static getFirsts;
    private static removeFirst;
}
export default MultiGeocoder;
