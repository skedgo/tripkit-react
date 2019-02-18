import GeocoderOptions from "./GeocoderOptions";
import GeocodingSource from "./GeocodingSource";
import LocationUtil from "../util/LocationUtil";
var StaticGeocoder = /** @class */ (function () {
    function StaticGeocoder() {
        this.values = [];
        this.options = new GeocoderOptions();
    }
    StaticGeocoder.prototype.getSourceId = function () {
        return GeocodingSource.OTHER;
    };
    StaticGeocoder.prototype.setValues = function (values) {
        this.values = values;
    };
    StaticGeocoder.prototype.getOptions = function () {
        return this.options;
    };
    StaticGeocoder.prototype.geocode = function (query, autocomplete, bounds, focus, callback) {
        var _this = this;
        var results = this.values.filter(function (value) {
            var valueS = (value.name ? value.name.toLowerCase() : "");
            valueS += (value.address ? (valueS ? " " : "") + value.address.toLowerCase() : "");
            return LocationUtil.relevance(query, valueS, true) >= .5;
            // return (value.name && value.name.toLowerCase().includes(query.toLowerCase()))
            //     || (value.address && value.address.toLowerCase().includes(query.toLowerCase()));
        });
        results.sort(function (r1, r2) { return _this.getSort(query, r2, r1); });
        callback(results.slice(0, 5));
    };
    StaticGeocoder.prototype.getSort = function (query, r2, r1) {
        return LocationUtil.relevance(query, r2.name, true) - LocationUtil.relevance(query, r1.name, true);
    };
    StaticGeocoder.prototype.resolve = function (unresolvedLocation, callback) {
        // Not empty
    };
    StaticGeocoder.prototype.reverseGeocode = function (coord, callback) {
        // Not empty
    };
    return StaticGeocoder;
}());
export default StaticGeocoder;
//# sourceMappingURL=StaticGeocoder.js.map