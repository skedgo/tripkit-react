import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
import GeocoderOptions from "./GeocoderOptions";
import GeocodingSource from "./GeocodingSource";
declare class PeliasGeocoder implements IGeocoder {
    private readonly GEOCODE_SERVER;
    private options;
    private cache;
    constructor();
    getSourceId(): GeocodingSource;
    getOptions(): GeocoderOptions;
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;
    resolve(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void;
    reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void;
    private static locationFromAutocompleteResult;
}
export default PeliasGeocoder;
