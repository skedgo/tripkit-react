import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
import IGeocoder from "./IGeocoder";
import LocationUtil from "../util/LocationUtil";
import Environment from "../env/Environment";
import MultiGeocoderOptions from "./MultiGeocoderOptions";
import Util from "../util/Util";
import PeliasGeocoder from "./PeliasGeocoder";
import SkedgoGeocoder from "./SkedgoGeocoder";

class MultiGeocoder {

    private _options: MultiGeocoderOptions;

    constructor(options: MultiGeocoderOptions = MultiGeocoderOptions.default()) {
        this._options = options;
    }

    get options(): MultiGeocoderOptions {
        return this._options;
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (query: string, results: Location[]) => void): void {
        const geocoderResults = new Map<IGeocoder, Location[]>();
        for (const geocoder of this._options.geocoders) {
            geocoder.geocode(query, autocomplete, bounds, focus, (results: Location[]) => {
                geocoderResults.set(geocoder, results);
                for (const geocoder1 of this._options.geocoders) {
                    if (geocoder1.getOptions().blockAutocompleteResults && geocoderResults.get(geocoder1) === undefined) {
                        return;
                    }
                }
                const mergedResults = this.merge(query, geocoderResults);
                callback(query, mergedResults.slice(0, 5));
            })
        }
    }

    public resolveLocation(unresolvedLocation: Location): Promise<Location> {
        return unresolvedLocation.source ?
            this._options.getGeocoderById(unresolvedLocation.source)!.resolve(unresolvedLocation) :
            Promise.reject(new Error('Unable to resolve location with unknown source'));

    }

    public reverseGeocode(coord: LatLng, callback: (location: Location | null) => void) {
        // TODO: fix. It maybe de case that neither Pelias nor Skedgo geocoders were included.
        // Also reverseGeocode on SkedgoGeocoder is not implemented. Maybe can implement it
        // and use SkedGo geocoder as callback, but create an instance on MultiGeocoder since it may not
        // be included on this._options.geocoders.
        let reverseGeocoder = this._options.getGeocoderById(PeliasGeocoder.SOURCE_ID);
        if (!reverseGeocoder) {
            reverseGeocoder = this._options.getGeocoderById(SkedgoGeocoder.SOURCE_ID);
        }
        reverseGeocoder!.reverseGeocode(coord, callback);
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
        Util.log("------------------------ \n");
        Util.log("Remove repeated results: \n");
        Util.log("------------------------ \n");
        const depuratedResults: Location[] = [];
        for (const result of mergedResults) {
            let relevant = true;
            for (const depuratedResult of depuratedResults) {
                if (this._options.analogResults(result, depuratedResult)) {
                    relevant = false;
                    if (Environment.isDev()) {
                        Util.log("Removing " + result.address + " in favor of " + depuratedResult.address + ".");
                    }
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
        Util.log("\n\n ************************************************************************************************ \n\n");
        Util.log("------------------------ \n");
        Util.log("Relevance to query: " + query + "\n");
        Util.log("------------------------ \n");
        for (let firsts = MultiGeocoder.getFirsts(suggestionListsFromSources) ; firsts.length !== 0 ; firsts = MultiGeocoder.getFirsts(suggestionListsFromSources)) {
            firsts.sort((l1: Location, l2: Location) => {
                return this._options.compare(l1, l2, query);
            });
            jointSuggestions.push(firsts[0]);
            Util.log((firsts[0].address || firsts[0].name) + " (" + firsts[0].source + ")" + " - " + LocationUtil.relevance(query, firsts[0].address));
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
