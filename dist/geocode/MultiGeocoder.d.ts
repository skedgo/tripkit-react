import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
import MultiGeocoderOptions from "./MultiGeocoderOptions";
declare class MultiGeocoder {
    private _options;
    constructor(options?: MultiGeocoderOptions);
    get options(): MultiGeocoderOptions;
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (query: string, results: Location[]) => void): void;
    resolveLocation(unresolvedLocation: Location): Promise<Location>;
    reverseGeocode(coord: LatLng, callback: (location: Location | null) => void): void;
    private merge;
    private mergeSorted;
    private static getFirsts;
    private static removeFirst;
}
export default MultiGeocoder;
