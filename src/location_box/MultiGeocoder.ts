import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
import IGeocoder from "./IGeocoder";
import LocationUtil from "../util/LocationUtil";
import Environment from "../env/Environment";
import MultiGeocoderOptions from "./MultiGeocoderOptions";

class MultiGeocoder {

    private options: MultiGeocoderOptions;

    constructor(options: MultiGeocoderOptions = MultiGeocoderOptions.default()) {
        this.options = options;
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (query: string, results: Location[]) => void): void {
        if (!query) {
            callback(query, this.options.showCurrLoc ? [Location.createCurrLoc()] : []);
            return;
        }
        const geocoderResults = new Map<IGeocoder, Location[]>();
        for (const geocoder of this.options.geocoders) {
            geocoder.geocode(query, autocomplete, bounds, focus, (results: Location[]) => {
                geocoderResults.set(geocoder, results);
                for (const geocoder1 of this.options.geocoders) {
                    if (geocoder1.getOptions().blockAutocompleteResults && geocoderResults.get(geocoder1) === undefined) {
                        return;
                    }
                }
                callback(query, this.merge(query, geocoderResults));
            })
        }
    }

    public resolveLocation(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void) {
        this.options.geocoders[0].resolve(unresolvedLocation, callback);
    }

    public reverseGeocode(coord: LatLng, callback: (location: Location | null) => void) {
        this.options.geocoders[0].reverseGeocode(coord, callback);
    }

    private merge(query: string, results: Map<IGeocoder, Location[]>): Location[] {
        // let mergedResults: Location[] = [];
        const suggestionListsFromSources: Location[][] = [];
        for (const geocoder of Array.from(results.keys())
            .sort((g1: IGeocoder, g2: IGeocoder) => g1.getSourceId().toString().localeCompare(g2.getSourceId().toString()))) {
            const geocoderResults = results.get(geocoder);
            if (geocoderResults) {
                // mergedResults = mergedResults.concat(geocoderResults)
                suggestionListsFromSources.push(geocoderResults);
            }
        }
        // return mergedResults;
        const mergedResults = this.mergeSorted(query, suggestionListsFromSources);
        console.log("------------------------ \n");
        console.log("Remove repeated results: \n");
        console.log("------------------------ \n");
        const depuratedResults: Location[] = [];
        for (const result of mergedResults) {
            let relevant = true;
            for (const depuratedResult of depuratedResults) {
                if (this.options.analogResults(result, depuratedResult)) {
                    relevant = false;
                    if (Environment.isDev()) {
                        console.log("Removing " + result.address + " in favor of " + depuratedResult.address + ".");
                    }
                    break;
                }
            }
            if (relevant) {
                depuratedResults.push(result);
            }
        }
        return depuratedResults.slice(0, 5);
    }

    private mergeSorted(query: string, originalSuggestionListsFromSources: Location[][]): Location[] {
        const suggestionListsFromSources: Location[][] = [];
        for (const listFromSource of originalSuggestionListsFromSources) {
            suggestionListsFromSources.push(listFromSource.slice());
        }
        const jointSuggestions: Location[] = [];
        console.log("\n\n ************************************************************************************************ \n\n");
        console.log("------------------------ \n");
        console.log("Relevance to query: " + query + "\n");
        console.log("------------------------ \n");
        for (let firsts = MultiGeocoder.getFirsts(suggestionListsFromSources) ; firsts.length !== 0 ; firsts = MultiGeocoder.getFirsts(suggestionListsFromSources)) {
            firsts.sort((l1: Location, l2: Location) => {
                return this.options.compare(l1, l2, query);
            });
            jointSuggestions.push(firsts[0]);
            console.log(firsts[0].address + " (" + firsts[0].source + ")" + " - " + LocationUtil.relevance(query, firsts[0].address));
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
