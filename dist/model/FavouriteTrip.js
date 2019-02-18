var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import Location from "../model/Location";
import { JsonObject, JsonProperty } from "json2typescript";
import Options from "./Options";
import { LocationConverter } from "./location/LocationConverter";
var FavouriteTrip = /** @class */ (function () {
    /**
     * Empty constructor, necessary for Util.clone
     */
    function FavouriteTrip() {
        this._from = new Location(); // need to specify default value in order for json2typescript to work
        this._to = new Location(); // need to specify default value in order for json2typescript to work
        this._options = undefined;
        // Avoid empty error
    }
    FavouriteTrip_1 = FavouriteTrip;
    FavouriteTrip.create = function (from, to) {
        var instance = new FavouriteTrip_1();
        instance._from = from;
        instance._to = to;
        return instance;
    };
    Object.defineProperty(FavouriteTrip.prototype, "from", {
        get: function () {
            return this._from;
        },
        set: function (value) {
            this._from = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FavouriteTrip.prototype, "to", {
        get: function () {
            return this._to;
        },
        set: function (value) {
            this._to = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FavouriteTrip.prototype, "options", {
        get: function () {
            return this._options;
        },
        set: function (value) {
            this._options = value;
        },
        enumerable: true,
        configurable: true
    });
    FavouriteTrip.prototype.getKey = function () {
        return (this.from.isCurrLoc() ? "CurrLoc" : this.from.getKey()) + (this.to.isCurrLoc() ? "CurrLoc" : this.to.getKey());
    };
    FavouriteTrip.prototype.equals = function (other) {
        if (other === undefined || other === null || other.constructor.name !== this.constructor.name) {
            return false;
        }
        return this.getKey() === other.getKey();
    };
    var FavouriteTrip_1;
    __decorate([
        JsonProperty('from', LocationConverter),
        __metadata("design:type", Location)
    ], FavouriteTrip.prototype, "_from", void 0);
    __decorate([
        JsonProperty('to', LocationConverter),
        __metadata("design:type", Location)
    ], FavouriteTrip.prototype, "_to", void 0);
    __decorate([
        JsonProperty('options', Options, true),
        __metadata("design:type", Object)
    ], FavouriteTrip.prototype, "_options", void 0);
    FavouriteTrip = FavouriteTrip_1 = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], FavouriteTrip);
    return FavouriteTrip;
}());
export default FavouriteTrip;
//# sourceMappingURL=FavouriteTrip.js.map