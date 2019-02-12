import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import GeocodingCache from "./GeocodingCache";
import BBox from "../model/BBox";
import NetworkUtil from "../util/NetworkUtil";
import {JsonConvert} from "json2typescript";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import GeocodingSource from "./GeocodingSource";
import TripGoApi from "../api/TripGoApi";

class SkedgoGeocoder implements IGeocoder {

    private options: GeocoderOptions;
    private cache: GeocodingCache;

    constructor() {
        this.options = new GeocoderOptions();
        this.cache = new GeocodingCache();
    }

    public getSourceId(): GeocodingSource {
        return GeocodingSource.SKEDGO;
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        if (!query) {
            callback([]);
        }

        const center = focus ? focus : (bounds ? bounds.getCenter() : null);
        if (center !== null) {
            const cachedResults = this.cache.getResults(query, autocomplete, center);
            if (cachedResults !== null) {
                callback(cachedResults.slice(0, 5));
                return;
            }
        }

        const endpoint = "geocode.json?"
            + "q=" + query
            + "&allowGoogle=false"
            + (center ? "&near=" + "(" + center.lat + "," + center.lng + ")" : "")
            + (autocomplete ? "&a=true" : "");

        const results: Location[] = [];

        let timedOut = false;
        let resultsArrived = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            if (!resultsArrived) {
                console.log("query " + query + " timed out ");
                callback(results);
            }
        }, 1500); // Tolerance

        TripGoApi.apiCall(endpoint, NetworkUtil.MethodType.GET).then((json: any) => {
            if (timedOut) {
                return
            } else {
                clearTimeout(timeoutId);
            }
            resultsArrived = true;
            if (!json.choices) {
                callback(results);
                return
            }
            const jsonConvert = new JsonConvert();
            for (const locJson of json.choices) {
                const loc = jsonConvert.deserialize(locJson, Location) as Location;
                loc.source = GeocodingSource.SKEDGO;
                results.push(loc);
            }
            if (center) {
                this.cache.addResults(query, autocomplete, center, results);
            }
            callback(results.slice(0, 2));
        }).catch(reason => {
            console.log(endpoint + " failed. Reason: " + reason);
            callback([]);
        });
    }

    public resolve(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void {
        // Empty
    }

    public reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void {
        // Empty
    }

}

export default SkedgoGeocoder;