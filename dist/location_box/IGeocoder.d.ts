import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import GeocoderOptions from "./GeocoderOptions";
import GeocodingSource from "./GeocodingSource";
interface IGeocoder {
    getSourceId(): GeocodingSource;
    getOptions(): GeocoderOptions;
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;
    resolve(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void;
    reverseGeocode(coord: LatLng, callback: (location: Location | null) => void): void;
}
export default IGeocoder;
