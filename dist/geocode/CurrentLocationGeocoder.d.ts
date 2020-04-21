import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
declare class CurrentLocationGeocoder implements IGeocoder {
    static readonly SOURCE_ID = "CURRENT";
    private options;
    constructor();
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;
    getOptions(): GeocoderOptions;
    getSourceId(): string;
    resolve(unresolvedLocation: Location): Promise<Location>;
    reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void;
}
export default CurrentLocationGeocoder;
