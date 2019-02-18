var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { JsonObject, JsonProperty } from "json2typescript";
var LatLng = /** @class */ (function () {
    /**
     * Empty constructor, necessary for Util.clone
     */
    function LatLng() {
        this._lat = undefined;
        this._lng = undefined;
        // Avoid empty error
    }
    LatLng_1 = LatLng;
    LatLng.createLatLng = function (lat, lng) {
        var instance = new LatLng_1();
        instance._lat = lat;
        instance._lng = lng;
        return instance;
    };
    Object.defineProperty(LatLng.prototype, "lat", {
        get: function () {
            return this._lat ? this._lat : 0;
        },
        set: function (value) {
            this._lat = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LatLng.prototype, "lng", {
        get: function () {
            return this._lng ? this._lng : 0;
        },
        set: function (value) {
            this._lng = value;
        },
        enumerable: true,
        configurable: true
    });
    LatLng.prototype.getKey = function () {
        return String(this.lat + this.lng);
    };
    /**
     * true just for Location instances that represent unresolved locations.
     */
    LatLng.prototype.isNull = function () {
        return !this._lat || !this._lng;
    };
    var LatLng_1;
    __decorate([
        JsonProperty('lat', Number, true),
        __metadata("design:type", Object)
    ], LatLng.prototype, "_lat", void 0);
    __decorate([
        JsonProperty('lng', Number, true),
        __metadata("design:type", Object)
    ], LatLng.prototype, "_lng", void 0);
    LatLng = LatLng_1 = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], LatLng);
    return LatLng;
}());
export default LatLng;
//# sourceMappingURL=LatLng.js.map