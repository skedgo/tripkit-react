import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import BBox from "../model/BBox";
import GeocodingSource from "./GeocodingSource";
declare class StaticGeocoder implements IGeocoder {
    private options;
    private values;
    constructor();
    getSourceId(): GeocodingSource;
    setValues(values: Location[]): void;
    getOptions(): GeocoderOptions;
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;
    protected getSort(query: string, r2: Location, r1: Location): number;
    resolve(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void;
    reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void;
}
export default StaticGeocoder;
