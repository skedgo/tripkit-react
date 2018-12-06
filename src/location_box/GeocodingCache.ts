import LatLng from "../model/LatLng";
import Location from "../model/Location";

class GeocodingCache {

    private autocompleteMap: Map<string, Map<string, Location[]>> = new Map<string, Map<string, Location[]>>();
    // private autocompleteMap: Map<string, Location> = new Map<string, Location>();

    private getCache(autocomplete: boolean): Map<string, Map<string, Location[]>> {
        return this.autocompleteMap;
    }

    public addResults(query: string, autocomplete: boolean, nearLatLng: LatLng, results: Location[]) {
        let resultsLatLng = this.getCache(autocomplete).get(JSON.stringify(nearLatLng));
        if (!resultsLatLng) {
           resultsLatLng = new Map<string, Location[]>();
        }
        resultsLatLng.set(query, results);
        this.getCache(autocomplete).set(JSON.stringify(nearLatLng), resultsLatLng);
    }

    public getResults(query: string, autocomplete: boolean, nearLatLng: LatLng): Location[] | null {
        const resultsLatLng = this.getCache(autocomplete).get(JSON.stringify(nearLatLng));
        if (!resultsLatLng) {
            return null;
        }
        const results = resultsLatLng.get(query);
        if (!results) {
            return null;
        }
        return results;
    }

}

export default GeocodingCache;