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
import LeafletUtil from "../../util/LeafletUtil";
var Street = /** @class */ (function () {
    function Street() {
        this._encodedWaypoints = "";
        /**
         * Missing when unknown.
         */
        this._safe = null;
        this._name = null;
        this._cyclingNetwork = null;
        this._metres = null;
        this._waypoints = null;
    }
    Object.defineProperty(Street.prototype, "encodedWaypoints", {
        get: function () {
            return this._encodedWaypoints;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Street.prototype, "safe", {
        get: function () {
            return this._safe;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Street.prototype, "name", {
        get: function () {
            // remove "Walk" in the meantime it's being removed from back-end.
            return this._name && this._name.toLowerCase() !== "walk" ? this._name : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Street.prototype, "cyclingNetwork", {
        get: function () {
            return this._cyclingNetwork;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Street.prototype, "metres", {
        get: function () {
            return this._metres;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Street.prototype, "waypoints", {
        get: function () {
            if (this._waypoints === null && this._encodedWaypoints) {
                this._waypoints = LeafletUtil.decodePolyline(this._encodedWaypoints);
            }
            return this._waypoints;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty("encodedWaypoints", String),
        __metadata("design:type", String)
    ], Street.prototype, "_encodedWaypoints", void 0);
    __decorate([
        JsonProperty("safe", Boolean, true),
        __metadata("design:type", Object)
    ], Street.prototype, "_safe", void 0);
    __decorate([
        JsonProperty("name", String, true),
        __metadata("design:type", Object)
    ], Street.prototype, "_name", void 0);
    __decorate([
        JsonProperty("cyclingNetwork", String, true),
        __metadata("design:type", Object)
    ], Street.prototype, "_cyclingNetwork", void 0);
    __decorate([
        JsonProperty("metres", Number, true),
        __metadata("design:type", Object)
    ], Street.prototype, "_metres", void 0);
    Street = __decorate([
        JsonObject
    ], Street);
    return Street;
}());
export default Street;
//# sourceMappingURL=Street.js.map