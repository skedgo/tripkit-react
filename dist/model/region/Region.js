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
import BBox from "../BBox";
import LeafletUtil from "../../util/LeafletUtil";
import City from "../location/City";
var Region = /** @class */ (function () {
    function Region() {
        this._name = "";
        this._polygon = "";
        this._timezone = "";
        this._modes = [];
        this._cities = [];
        this._bounds = null;
    }
    Object.defineProperty(Region.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Region.prototype, "polygon", {
        get: function () {
            return this._polygon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Region.prototype, "timezone", {
        get: function () {
            return this._timezone;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Region.prototype, "modes", {
        get: function () {
            return this._modes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Region.prototype, "cities", {
        get: function () {
            return this._cities;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Region.prototype, "bounds", {
        get: function () {
            if (this._bounds === null) {
                this._bounds = BBox.createBBoxArray(LeafletUtil.decodePolyline(this._polygon));
            }
            return this._bounds;
        },
        enumerable: true,
        configurable: true
    });
    Region.prototype.contains = function (latLng) {
        return LeafletUtil.pointInPolygon(latLng, LeafletUtil.decodePolyline(this._polygon));
    };
    __decorate([
        JsonProperty("name", String),
        __metadata("design:type", String)
    ], Region.prototype, "_name", void 0);
    __decorate([
        JsonProperty("polygon", String, true),
        __metadata("design:type", String)
    ], Region.prototype, "_polygon", void 0);
    __decorate([
        JsonProperty("timezone", String),
        __metadata("design:type", String)
    ], Region.prototype, "_timezone", void 0);
    __decorate([
        JsonProperty("modes", [String]),
        __metadata("design:type", Array)
    ], Region.prototype, "_modes", void 0);
    __decorate([
        JsonProperty("cities", [City]),
        __metadata("design:type", Array)
    ], Region.prototype, "_cities", void 0);
    Region = __decorate([
        JsonObject
    ], Region);
    return Region;
}());
export default Region;
//# sourceMappingURL=Region.js.map