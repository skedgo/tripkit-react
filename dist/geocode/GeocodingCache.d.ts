import LatLng from "../model/LatLng";
import Location from "../model/Location";
declare class GeocodingCache {
    private autocompleteMap;
    private getCache;
    addResults(query: string, autocomplete: boolean, nearLatLng: LatLng, results: Location[]): void;
    getResults(query: string, autocomplete: boolean, nearLatLng: LatLng): Location[] | null;
}
export default GeocodingCache;
