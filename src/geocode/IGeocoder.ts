import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import GeocoderOptions from "./GeocoderOptions";

export const TKGeocoderForDoc = (props: Partial<IGeocoder>) => null;
TKGeocoderForDoc.displayName = 'Geocoder connector';

interface IGeocoder {

    /**
     * @ctype
     */
    getOptions(): GeocoderOptions;

    /**
     * @ctype
     */
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;

    /**
     * @ctype
     */
    resolve(unresolvedLocation: Location): Promise<Location>;

    /**
     * @ctype
     */
    reverseGeocode(coord: LatLng, callback: (location: Location | null) => void): void;
}

export default IGeocoder;