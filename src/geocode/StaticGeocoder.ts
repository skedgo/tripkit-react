import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LocationUtil from "../util/LocationUtil";

interface StaticGeocoderOptions extends GeocoderOptions {
    emptyMatchAll?: boolean;
}
class StaticGeocoder implements IGeocoder {

    private options: StaticGeocoderOptions;
    private values: Location[] = [];

    constructor(options: StaticGeocoderOptions = {}) {
        this.options = options;
    }

    public setValues(values: Location[]) {
        this.values = values;
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }


    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        if (!query) {
            if (this.options.emptyMatchAll) {
                callback(this.values.slice(0, this.options.resultsLimit)
                    .map((value: Location) => StaticGeocoder.locationFromAutocompleteResult(value, query)));
            } else {
                callback([]);
            }
            return;
        }
        if (!autocomplete) {
            callback([]);
            return;
        }
        const results = this.values.filter((value: Location) => {
            return LocationUtil.relevance(query, value, { preferShorter: true }) >= .5;
        }).map((value: Location) => StaticGeocoder.locationFromAutocompleteResult(value, query));
        results.sort((r1: Location, r2: Location) => this.getSort(query, r2, r1));
        callback(results.slice(0, this.options.resultsLimit));
    }

    protected getSort(query: string, r2: Location, r1: Location) {
        return LocationUtil.relevance(query, r2, { preferShorter: true }) - LocationUtil.relevance(query, r1, { preferShorter: true });
    }

    public resolve(unresolvedLocation: Location): Promise<Location> {
        return Promise.reject('StaticGeocoder does not support location resolution')
    }

    public reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void {
        // Not empty
    }

    private static locationFromAutocompleteResult(result: Location, query: string): Location {
        result.structured_formatting = LocationUtil.match(query, result, { fillStructuredFormatting: true }).structuredFormatting;
        return result;
    }


}

export default StaticGeocoder;