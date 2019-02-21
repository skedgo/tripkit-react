import GeocoderOptions from "./GeocoderOptions";
import GeocodingCache from "./GeocodingCache";
import NetworkUtil from "../util/NetworkUtil";
import TripGoApi from "../api/TripGoApi";
import { LocationConverter } from "../model/location/LocationConverter";
var SkedgoGeocoder = /** @class */ (function () {
    function SkedgoGeocoder() {
        this.options = new GeocoderOptions();
        this.cache = new GeocodingCache();
    }
    SkedgoGeocoder.prototype.getSourceId = function () {
        return SkedgoGeocoder.SOURCE_ID;
    };
    SkedgoGeocoder.prototype.getOptions = function () {
        return this.options;
    };
    SkedgoGeocoder.prototype.geocode = function (query, autocomplete, bounds, focus, callback) {
        var _this = this;
        if (!query) {
            callback([]);
        }
        var center = focus ? focus : (bounds ? bounds.getCenter() : null);
        if (center !== null) {
            var cachedResults = this.cache.getResults(query, autocomplete, center);
            if (cachedResults !== null) {
                callback(cachedResults.slice(0, 5));
                return;
            }
        }
        var endpoint = "geocode.json?"
            + "q=" + query
            + "&allowGoogle=false"
            + (center ? "&near=" + "(" + center.lat + "," + center.lng + ")" : "")
            + (autocomplete ? "&a=true" : "");
        var results = [];
        var timedOut = false;
        var resultsArrived = false;
        var timeoutId = setTimeout(function () {
            timedOut = true;
            if (!resultsArrived) {
                console.log("query " + query + " timed out ");
                callback(results);
            }
        }, 1500); // Tolerance
        TripGoApi.apiCall(endpoint, NetworkUtil.MethodType.GET).then(function (json) {
            if (timedOut) {
                return;
            }
            else {
                clearTimeout(timeoutId);
            }
            resultsArrived = true;
            if (!json.choices) {
                callback(results);
                return;
            }
            var jsonConvert = new LocationConverter();
            for (var _i = 0, _a = json.choices; _i < _a.length; _i++) {
                var locJson = _a[_i];
                var loc = jsonConvert.deserialize(locJson);
                loc.source = SkedgoGeocoder.SOURCE_ID;
                results.push(loc);
            }
            if (center) {
                _this.cache.addResults(query, autocomplete, center, results);
            }
            callback(results.slice(0, 2));
        }).catch(function (reason) {
            console.log(endpoint + " failed. Reason: " + reason);
            callback([]);
        });
    };
    SkedgoGeocoder.prototype.resolve = function (unresolvedLocation, callback) {
        // Empty
    };
    SkedgoGeocoder.prototype.reverseGeocode = function (coord, callback) {
        // Empty
    };
    SkedgoGeocoder.SOURCE_ID = "SKEDGO";
    return SkedgoGeocoder;
}());
export default SkedgoGeocoder;
//# sourceMappingURL=SkedgoGeocoder.js.map