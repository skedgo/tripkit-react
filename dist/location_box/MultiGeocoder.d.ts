import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
import MultiGeocoderOptions from "./MultiGeocoderOptions";
declare class MultiGeocoder {
    private options;
    constructor(options?: MultiGeocoderOptions);
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (query: string, results: Location[]) => void): void;
    resolveLocation(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void;
    reverseGeocode(coord: LatLng, callback: (location: Location | null) => void): void;
    private merge;
    private mergeSorted;
    private static getFirsts;
    private static removeFirst;
}
export default MultiGeocoder;
