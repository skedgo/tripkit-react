var GeocoderOptions = /** @class */ (function () {
    function GeocoderOptions() {
        this._blockAutocompleteResults = true;
    }
    Object.defineProperty(GeocoderOptions.prototype, "blockAutocompleteResults", {
        get: function () {
            return this._blockAutocompleteResults;
        },
        set: function (value) {
            this._blockAutocompleteResults = value;
        },
        enumerable: true,
        configurable: true
    });
    return GeocoderOptions;
}());
export default GeocoderOptions;
//# sourceMappingURL=GeocoderOptions.js.map