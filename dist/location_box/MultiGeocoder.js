import Location from "../model/Location";
import PeliasGeocoder from "./PeliasGeocoder";
import LocationUtil from "../util/LocationUtil";
import SchoolGeocoder from "./SchoolGeocoder";
import GeocodingSource from "./GeocodingSource";
import Environment from "../env/Environment";
import Features from "../env/Features";
import SkedgoGeocoder from "./SkedgoGeocoder";
import StopLocation from "../model/StopLocation";
var MultiGeocoder = /** @class */ (function () {
    function MultiGeocoder(showCurrLoc) {
        this.showCurrLoc = false;
        this.showCurrLoc = showCurrLoc;
        this.geocoders = [];
        this.geocoders.push(new PeliasGeocoder());
        this.geocoders.push(new SkedgoGeocoder());
        if (Features.instance.schoolBuses()) {
            this.geocoders.push(SchoolGeocoder.instance);
        }
    }
    MultiGeocoder.prototype.geocode = function (query, autocomplete, bounds, focus, callback) {
        var _this = this;
        if (!query) {
            callback(query, this.showCurrLoc ? [Location.createCurrLoc()] : []);
            return;
        }
        var geocoderResults = new Map();
        var _loop_1 = function (geocoder) {
            geocoder.geocode(query, autocomplete, bounds, focus, function (results) {
                geocoderResults.set(geocoder, results);
                for (var _i = 0, _a = _this.geocoders; _i < _a.length; _i++) {
                    var geocoder1 = _a[_i];
                    if (geocoder1.getOptions().blockAutocompleteResults && geocoderResults.get(geocoder1) === undefined) {
                        return;
                    }
                }
                callback(query, _this.merge(query, geocoderResults));
            });
        };
        for (var _i = 0, _a = this.geocoders; _i < _a.length; _i++) {
            var geocoder = _a[_i];
            _loop_1(geocoder);
        }
    };
    MultiGeocoder.prototype.resolveLocation = function (unresolvedLocation, callback) {
        this.geocoders[0].resolve(unresolvedLocation, callback);
    };
    MultiGeocoder.prototype.reverseGeocode = function (coord, callback) {
        this.geocoders[0].reverseGeocode(coord, callback);
    };
    MultiGeocoder.prototype.merge = function (query, results) {
        // let mergedResults: Location[] = [];
        var suggestionListsFromSources = [];
        for (var _i = 0, _a = Array.from(results.keys())
            .sort(function (g1, g2) { return g1.getSourceId().toString().localeCompare(g2.getSourceId().toString()); }); _i < _a.length; _i++) {
            var geocoder = _a[_i];
            var geocoderResults = results.get(geocoder);
            if (geocoderResults) {
                // mergedResults = mergedResults.concat(geocoderResults)
                suggestionListsFromSources.push(geocoderResults);
            }
        }
        // return mergedResults;
        var mergedResults = MultiGeocoder.mergeSorted(query, suggestionListsFromSources);
        console.log("------------------------ \n");
        console.log("Remove repeated results: \n");
        console.log("------------------------ \n");
        var depuratedResults = [];
        for (var _b = 0, mergedResults_1 = mergedResults; _b < mergedResults_1.length; _b++) {
            var result = mergedResults_1[_b];
            var relevant = true;
            for (var _c = 0, depuratedResults_1 = depuratedResults; _c < depuratedResults_1.length; _c++) {
                var depuratedResult = depuratedResults_1[_c];
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
    };
    MultiGeocoder.mergeSorted = function (query, originalSuggestionListsFromSources) {
        var suggestionListsFromSources = [];
        for (var _i = 0, originalSuggestionListsFromSources_1 = originalSuggestionListsFromSources; _i < originalSuggestionListsFromSources_1.length; _i++) {
            var listFromSource = originalSuggestionListsFromSources_1[_i];
            suggestionListsFromSources.push(listFromSource.slice());
        }
        var jointSuggestions = [];
        console.log("\n\n ************************************************************************************************ \n\n");
        console.log("------------------------ \n");
        console.log("Relevance to query: " + query + "\n");
        console.log("------------------------ \n");
        for (var firsts = this.getFirsts(suggestionListsFromSources); firsts.length !== 0; firsts = this.getFirsts(suggestionListsFromSources)) {
            firsts.sort(function (l1, l2) {
                return MultiGeocoder.compare(l1, l2, query);
            });
            jointSuggestions.push(firsts[0]);
            console.log(firsts[0].address + " (" + firsts[0].source + ")" + " - " + LocationUtil.relevance(query, firsts[0].address));
            this.removeFirst(firsts[0], suggestionListsFromSources);
        }
        return jointSuggestions;
    };
    MultiGeocoder.analogResults = function (r1, r2) {
        var relevance = Math.max(LocationUtil.relevance(r1.address, r2.address), LocationUtil.relevance(r2.address, r1.address));
        var distanceInMetres = LocationUtil.distanceInMetres(r1, r2);
        if (r1.source !== r2.source) {
            console.log(r1.address + " (" + r1.source + ")" + " | " + r2.address + " (" + r2.source + ")" + " dist: " + distanceInMetres + " relevance: " + relevance);
        }
        if (r1.source !== r2.source && relevance > .7 &&
            (LocationUtil.distanceInMetres(r1, r2) < 100 ||
                ((r1.source === GeocodingSource.ACT_SCHOOLS || r2.source === GeocodingSource.ACT_SCHOOLS) && LocationUtil.distanceInMetres(r1, r2) < 300))) {
            return true;
        }
        return false;
    };
    MultiGeocoder.compare = function (l1, l2, query) {
        // if (query.length < 4) { // Move school results to the bottom
        //     if (l1.source === GeocodingSource.ACT_SCHOOLS) {
        //         return 1;
        //     } else if (l2.source === GeocodingSource.ACT_SCHOOLS) {
        //         return -1
        //     }
        // }
        if (l1.source === GeocodingSource.SKEDGO && l1 instanceof StopLocation && query === l1.code) {
            return -1;
        }
        else if (l2.source === GeocodingSource.SKEDGO && l2 instanceof StopLocation && query === l2.code) {
            return 1;
        }
        var relevanceDiff = LocationUtil.relevance(query, l2.address) - LocationUtil.relevance(query, l1.address);
        if (query.length >= 4) { // Move school results to the bottom
            if (l1.source === GeocodingSource.ACT_SCHOOLS && relevanceDiff <= 0.16) {
                return -1;
            }
            else if (l2.source === GeocodingSource.ACT_SCHOOLS && relevanceDiff >= -0.16) {
                return 1;
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
            }
            else if (l2.source === GeocodingSource.SKEDGO && relevanceDiff >= -0.1) {
                return 1;
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
    };
    MultiGeocoder.getFirsts = function (suggestionListsFromSources) {
        var result = [];
        for (var _i = 0, suggestionListsFromSources_1 = suggestionListsFromSources; _i < suggestionListsFromSources_1.length; _i++) {
            var suggestionsFromSource = suggestionListsFromSources_1[_i];
            if (suggestionsFromSource !== undefined && suggestionsFromSource.length !== 0) {
                result.push(suggestionsFromSource[0]);
            }
        }
        return result;
    };
    MultiGeocoder.removeFirst = function (locationSuggestion, suggestionListsFromSources) {
        for (var _i = 0, suggestionListsFromSources_2 = suggestionListsFromSources; _i < suggestionListsFromSources_2.length; _i++) {
            var suggestionsFromSource = suggestionListsFromSources_2[_i];
            if (suggestionsFromSource && suggestionsFromSource[0] === locationSuggestion) {
                suggestionsFromSource.splice(0, 1);
                break;
            }
        }
    };
    return MultiGeocoder;
}());
export default MultiGeocoder;
//# sourceMappingURL=MultiGeocoder.js.map