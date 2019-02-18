var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Any, JsonObject, JsonProperty } from "json2typescript";
import Region from "./Region";
var RegionResults = /** @class */ (function () {
    function RegionResults() {
        this._hashCode = 0;
        this._modes = {};
        this._regions = [];
    }
    Object.defineProperty(RegionResults.prototype, "hashCode", {
        get: function () {
            return this._hashCode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegionResults.prototype, "modes", {
        get: function () {
            return this._modes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RegionResults.prototype, "regions", {
        get: function () {
            return this._regions;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty("hashCode", Number),
        __metadata("design:type", Number)
    ], RegionResults.prototype, "_hashCode", void 0);
    __decorate([
        JsonProperty("modes", Any, true),
        __metadata("design:type", Any)
    ], RegionResults.prototype, "_modes", void 0);
    __decorate([
        JsonProperty("regions", [Region]),
        __metadata("design:type", Array)
    ], RegionResults.prototype, "_regions", void 0);
    RegionResults = __decorate([
        JsonObject
    ], RegionResults);
    return RegionResults;
}());
export default RegionResults;
//# sourceMappingURL=RegionResults.js.map