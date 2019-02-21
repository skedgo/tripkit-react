import Location from "../model/Location";
import LocationUtil from "../util/LocationUtil";
import Environment from "../env/Environment";
import MultiGeocoderOptions from "./MultiGeocoderOptions";
var MultiGeocoder = /** @class */ (function () {
    function MultiGeocoder(options) {
        if (options === void 0) { options = MultiGeocoderOptions.default(); }
        this.options = options;
    }
    MultiGeocoder.prototype.geocode = function (query, autocomplete, bounds, focus, callback) {
        var _this = this;
        if (!query) {
            callback(query, this.options.showCurrLoc ? [Location.createCurrLoc()] : []);
            return;
        }
        var geocoderResults = new Map();
        var _loop_1 = function (geocoder) {
            geocoder.geocode(query, autocomplete, bounds, focus, function (results) {
                geocoderResults.set(geocoder, results);
                for (var _i = 0, _a = _this.options.geocoders; _i < _a.length; _i++) {
                    var geocoder1 = _a[_i];
                    if (geocoder1.getOptions().blockAutocompleteResults && geocoderResults.get(geocoder1) === undefined) {
                        return;
                    }
                }
                callback(query, _this.merge(query, geocoderResults));
            });
        };
        for (var _i = 0, _a = this.options.geocoders; _i < _a.length; _i++) {
            var geocoder = _a[_i];
            _loop_1(geocoder);
        }
    };
    MultiGeocoder.prototype.resolveLocation = function (unresolvedLocation, callback) {
        this.options.geocoders[0].resolve(unresolvedLocation, callback);
    };
    MultiGeocoder.prototype.reverseGeocode = function (coord, callback) {
        this.options.geocoders[0].reverseGeocode(coord, callback);
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
        var mergedResults = this.mergeSorted(query, suggestionListsFromSources);
        console.log("------------------------ \n");
        console.log("Remove repeated results: \n");
        console.log("------------------------ \n");
        var depuratedResults = [];
        for (var _b = 0, mergedResults_1 = mergedResults; _b < mergedResults_1.length; _b++) {
            var result = mergedResults_1[_b];
            var relevant = true;
            for (var _c = 0, depuratedResults_1 = depuratedResults; _c < depuratedResults_1.length; _c++) {
                var depuratedResult = depuratedResults_1[_c];
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
    };
    MultiGeocoder.prototype.mergeSorted = function (query, originalSuggestionListsFromSources) {
        var _this = this;
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
        for (var firsts = MultiGeocoder.getFirsts(suggestionListsFromSources); firsts.length !== 0; firsts = MultiGeocoder.getFirsts(suggestionListsFromSources)) {
            firsts.sort(function (l1, l2) {
                return _this.options.compare(l1, l2, query);
            });
            jointSuggestions.push(firsts[0]);
            console.log(firsts[0].address + " (" + firsts[0].source + ")" + " - " + LocationUtil.relevance(query, firsts[0].address));
            MultiGeocoder.removeFirst(firsts[0], suggestionListsFromSources);
        }
        return jointSuggestions;
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