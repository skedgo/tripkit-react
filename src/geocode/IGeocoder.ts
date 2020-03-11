import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import GeocoderOptions from "./GeocoderOptions";

interface IGeocoder {

    getSourceId(): string;

    getOptions(): GeocoderOptions;

    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;

    resolve(unresolvedLocation: Location): Promise<Location>;

    reverseGeocode(coord: LatLng, callback: (location: Location | null) => void): void;
}

export default IGeocoder;