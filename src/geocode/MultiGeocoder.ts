import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
import LocationUtil from "../util/LocationUtil";
import Environment from "../env/Environment";
import TKGeocodingOptions from "./TKGeocodingOptions";
import Util from "../util/Util";
import TKDefaultGeocoderNames from "./TKDefaultGeocoderNames";

class MultiGeocoder {

    private _options: TKGeocodingOptions;

    constructor(options: TKGeocodingOptions) {
        this._options = options;
    }

    get options(): TKGeocodingOptions {
        return this._options;
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (query: string, results: Location[]) => void): void {
        const geocoderResults = new Map<string, Location[]>();
        for (const geocoderId of Object.keys(this._options.geocoders)) {
            const geocoder = this._options.geocoders[geocoderId];
            geocoder.geocode(query, autocomplete, bounds, focus, (results: Location[]) => {
                results.forEach(((result: Location) => result.source = geocoderId));
                geocoderResults.set(geocoderId, results);
                for (const geocoderId1 of Object.keys(this._options.geocoders)) {
                    const geocoder1 = this._options.geocoders[geocoderId1];
                    if (geocoder1.getOptions().blockAutocompleteResults !== false && geocoderResults.get(geocoderId1) === undefined) {
                        return;
                    }
                }
                const mergedResults = this.merge(query, geocoderResults);
                callback(query, mergedResults.slice(0, this._options.maxResults || 5));
            })
        }
    }

    public resolveLocation(unresolvedLocation: Location): Promise<Location> {
        return unresolvedLocation.source ?
            this._options.geocoders[unresolvedLocation.source]!.resolve(unresolvedLocation)
                .then((resLoc: Location) => {
                    resLoc.source = unresolvedLocation.source;
                    return resLoc;
                }) :
            Promise.reject(new Error('Unable to resolve location with unknown source'));
    }

    public reverseGeocode(coord: LatLng, callback: (location: Location | null) => void) {
        // TODO: fix. It maybe de case that neither Pelias nor Skedgo geocoders were included.
        let reverseGeocoderId = this._options.geocoders["geocodeEarth"] ? "geocodeEarth" : // TODO: remove hardcoding
            TKDefaultGeocoderNames.skedgo;
        this._options.geocoders[reverseGeocoderId]!.reverseGeocode(coord, (location: Location | null) => {
            if (location) {
                location.source = reverseGeocoderId;
            }
            callback(location);
        });
    }

    private merge(query: string, results: Map<string, Location[]>): Location[] {
        // let mergedResults: Location[] = [];
        const suggestionListsFromSources: Location[][] = [];
        for (const geocoder of Array.from(results.keys())
            .sort((g1: string, g2: string) => g1.localeCompare(g2))) {
            const geocoderResults = results.get(geocoder);
            if (geocoderResults) {
                // mergedResults = mergedResults.concat(geocoderResults)
                suggestionListsFromSources.push(geocoderResults);
            }
        }
        // return mergedResults;
        const mergedResults = this.mergeSorted(query, suggestionListsFromSources);
        Util.log("------------------------ \n", null);
        Util.log("Remove repeated results: \n", null);
        Util.log("------------------------ \n", null);
        const depuratedResults: Location[] = [];
        for (const result of mergedResults) {
            let relevant = true;
            for (const depuratedResult of depuratedResults) {
                if (this._options.analogResults(result, depuratedResult)) {
                    relevant = false;
                    Util.log("Removing " + result.address + " in favor of " + depuratedResult.address + ".", null);
                    break;
                }
            }
            if (relevant) {
                depuratedResults.push(result);
            }
        }
        return depuratedResults;
    }

    private mergeSorted(query: string, originalSuggestionListsFromSources: Location[][]): Location[] {
        const suggestionListsFromSources: Location[][] = [];
        for (const listFromSource of originalSuggestionListsFromSources) {
            suggestionListsFromSources.push(listFromSource.slice());
        }
        const jointSuggestions: Location[] = [];
        Util.log("\n\n ************************************************************************************************ \n\n", null);
        Util.log("------------------------ \n", null);
        Util.log("Relevance to query: " + query + "\n", null);
        Util.log("------------------------ \n", null);
        for (let firsts = MultiGeocoder.getFirsts(suggestionListsFromSources) ; firsts.length !== 0 ; firsts = MultiGeocoder.getFirsts(suggestionListsFromSources)) {
            firsts.sort((l1: Location, l2: Location) => {
                return this._options.compare(l1, l2, query);
            });
            jointSuggestions.push(firsts[0]);
            Util.log((firsts[0].address || firsts[0].name) + " (" + firsts[0].source + ")" + " - " + LocationUtil.relevance(query, firsts[0].address || ""), null);
            MultiGeocoder.removeFirst(firsts[0], suggestionListsFromSources);
        }
        return jointSuggestions;
    }

    private static getFirsts(suggestionListsFromSources: Location[][]): Location[] {
        const result: Location[] = [];
        for (const suggestionsFromSource of suggestionListsFromSources) {
            if (suggestionsFromSource !== undefined && suggestionsFromSource.length !== 0) {
                result.push(suggestionsFromSource[0]);
            }
        }
        return result;
    }

    private static removeFirst(locationSuggestion: Location, suggestionListsFromSources: Location[][]): void {
        for (const suggestionsFromSource of suggestionListsFromSources) {
            if (suggestionsFromSource && suggestionsFromSource[0] === locationSuggestion) {
                suggestionsFromSource.splice(0, 1);
                break;
            }
        }
    }

}

export default MultiGeocoder;
