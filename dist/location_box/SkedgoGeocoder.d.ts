import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import BBox from "../model/BBox";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
declare class SkedgoGeocoder implements IGeocoder {
    static readonly SOURCE_ID: string;
    private options;
    private cache;
    constructor();
    getSourceId(): string;
    getOptions(): GeocoderOptions;
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;
    resolve(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void;
    reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void;
}
export default SkedgoGeocoder;
