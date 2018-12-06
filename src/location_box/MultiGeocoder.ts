import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
import IGeocoder from "./IGeocoder";
import PeliasGeocoder from "./PeliasGeocoder";
import SkedgoGeocoder from "./SkedgoGeocoder";
import LocationUtil from "../util/LocationUtil";
import SchoolGeocoder from "./SchoolGeocoder";
import GeocodingSource from "./GeocodingSource";
import Environment from "../env/Environment";
import Features from "../env/Features";

class MultiGeocoder {

    private showCurrLoc = false;
    private geocoders: IGeocoder[];

    constructor(showCurrLoc: boolean) {
        this.showCurrLoc = showCurrLoc;
        this.geocoders = [];
        this.geocoders.push(new PeliasGeocoder());
        this.geocoders.push(new SkedgoGeocoder());
        if (Features.instance.schoolBuses()) {
            this.geocoders.push(SchoolGeocoder.instance);
        }
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (query: string, results: Location[]) => void): void {
        if (!query) {
            callback(query, this.showCurrLoc ? [Location.createCurrLoc()] : []);
            return;
        }
        const geocoderResults = new Map<IGeocoder, Location[]>();
        for (const geocoder of this.geocoders) {
            geocoder.geocode(query, autocomplete, bounds, focus, (results: Location[]) => {
                geocoderResults.set(geocoder, results);
                for (const geocoder1 of this.geocoders) {
                    if (geocoder1.getOptions().blockAutocompleteResults && geocoderResults.get(geocoder1) === undefined) {
                        return;
                    }
                }
                callback(query, this.merge(query, geocoderResults));
            })
        }
    }

    public resolveLocation(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void) {
        this.geocoders[0].resolve(unresolvedLocation, callback);
    }

    public reverseGeocode(coord: LatLng, callback: (location: Location | null) => void) {
        this.geocoders[0].reverseGeocode(coord, callback);
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
        const mergedResults = MultiGeocoder.mergeSorted(query, suggestionListsFromSources);
        console.log("------------------------ \n");
        console.log("Remove repeated results: \n");
        console.log("------------------------ \n");
        const depuratedResults: Location[] = [];
        for (const result of mergedResults) {
            let relevant = true;
            for (const depuratedResult of depuratedResults) {
                if (MultiGeocoder.analogResults(result, depuratedResult)) {
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

    private static mergeSorted(query: string, originalSuggestionListsFromSources: Location[][]): Location[] {
        const suggestionListsFromSources: Location[][] = [];
        for (const listFromSource of originalSuggestionListsFromSources) {
            suggestionListsFromSources.push(listFromSource.slice());
        }
        const jointSuggestions: Location[] = [];
        console.log("\n\n ************************************************************************************************ \n\n");
        console.log("------------------------ \n");
        console.log("Relevance to query: " + query + "\n");
        console.log("------------------------ \n");
        for (let firsts = this.getFirsts(suggestionListsFromSources) ; firsts.length !== 0 ; firsts = this.getFirsts(suggestionListsFromSources)) {
            firsts.sort((l1: Location, l2: Location) => {
                return MultiGeocoder.compare(l1, l2, query);
            });
            jointSuggestions.push(firsts[0]);
            console.log(firsts[0].address + " (" + firsts[0].source + ")" + " - " + LocationUtil.relevance(query, firsts[0].address));
            this.removeFirst(firsts[0], suggestionListsFromSources);
        }
        return jointSuggestions;
    }

    public static analogResults(r1: Location, r2: Location): boolean {
        const relevance = Math.max(LocationUtil.relevance(r1.address, r2.address) , LocationUtil.relevance(r2.address, r1.address));
        const distanceInMetres = LocationUtil.distanceInMetres(r1, r2);
        if (r1.source !== r2.source) {
            console.log(r1.address + " (" + r1.source + ")" + " | " + r2.address + " (" + r2.source + ")" + " dist: " + distanceInMetres + " relevance: " + relevance);
        }
        if (r1.source !== r2.source && relevance > .7 &&
            (LocationUtil.distanceInMetres(r1, r2) < 100 ||
            ((r1.source === GeocodingSource.ACT_SCHOOLS || r2.source === GeocodingSource.ACT_SCHOOLS) && LocationUtil.distanceInMetres(r1, r2) < 300))) {
            return true;
        }
        return false;
    }

    private static compare(l1: Location, l2: Location, query: string) {
        // if (query.length < 4) { // Move school results to the bottom
        //     if (l1.source === GeocodingSource.ACT_SCHOOLS) {
        //         return 1;
        //     } else if (l2.source === GeocodingSource.ACT_SCHOOLS) {
        //         return -1
        //     }
        // }

        const relevanceDiff = LocationUtil.relevance(query, l2.address) - LocationUtil.relevance(query, l1.address);

        if (query.length >= 4) { // Move school results to the bottom
            if (l1.source === GeocodingSource.ACT_SCHOOLS && relevanceDiff <= 0.16) {
                return -1;
            } else if (l2.source === GeocodingSource.ACT_SCHOOLS && relevanceDiff >= -0.16) {
                return 1
            }
        }

        // Prioritize skedgo geocoder result if
        // - query has 3 or more characters, and
        // - query is related to "airport" or "stop", and
        // - relevance is not less than 0.1 from other source result
        if (query.length >= 3 &&
            (LocationUtil.relevance(query, "airport") >= .7 ||
                LocationUtil.relevance(query, "stop") >= .7)) {
            if (l1.source === GeocodingSource.SKEDGO && relevanceDiff <= 0.1) {
                return -1;
            } else if (l2.source === GeocodingSource.SKEDGO && relevanceDiff >= -0.1) {
                return 1
            }
        }

        // if (query.length >= 3) { // Move skedgo results to the top if relevance is not less than 0.15 from other source result.
        //     if (l1.source === GeocodingSource.SKEDGO && relevanceDiff <= 0) {
        //         return -1;
        //     } else if (l2.source === GeocodingSource.SKEDGO && relevanceDiff >= 0) {
        //         return 1
        //     }
        // }

        if (relevanceDiff !== 0) {
            return relevanceDiff;
        }

        // Move skedgo results to the top
        // if (l1.source === GeocodingSource.SKEDGO) {
        //     return -1;
        // } else if (l2.source === GeocodingSource.SKEDGO) {
        //     return 1
        // }

        return 0;
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
