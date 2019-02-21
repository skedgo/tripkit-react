var GeocodingCache = /** @class */ (function () {
    function GeocodingCache() {
        this.autocompleteMap = new Map();
    }
    // private autocompleteMap: Map<string, Location> = new Map<string, Location>();
    GeocodingCache.prototype.getCache = function (autocomplete) {
        return this.autocompleteMap;
    };
    GeocodingCache.prototype.addResults = function (query, autocomplete, nearLatLng, results) {
        var resultsLatLng = this.getCache(autocomplete).get(JSON.stringify(nearLatLng));
        if (!resultsLatLng) {
            resultsLatLng = new Map();
        }
        resultsLatLng.set(query, results);
        this.getCache(autocomplete).set(JSON.stringify(nearLatLng), resultsLatLng);
    };
    GeocodingCache.prototype.getResults = function (query, autocomplete, nearLatLng) {
        var resultsLatLng = this.getCache(autocomplete).get(JSON.stringify(nearLatLng));
        if (!resultsLatLng) {
            return null;
        }
        var results = resultsLatLng.get(query);
        if (!results) {
            return null;
        }
        return results;
    };
    return GeocodingCache;
}());
export default GeocodingCache;
//# sourceMappingURL=GeocodingCache.js.map