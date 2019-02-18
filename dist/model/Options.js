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
import WeightingPreferences from "./WeightingPreferences";
import { MapLocationTypeConverter } from "./location/MapLocationType";
import ModeIdentifier from "./region/ModeIdentifier";
import Features from "../env/Features";
var Options = /** @class */ (function () {
    /**
     * Empty constructor, necessary for Util.clone
     */
    function Options() {
        this._weightingPrefs = WeightingPreferences.create(1, 1, 2);
        this._modesDisabled = Options_1.defaultDisabled;
        this._wheelchair = false;
        this._mapLayers = [];
        // Avoid empty error
    }
    Options_1 = Options;
    Object.defineProperty(Options.prototype, "weightingPrefs", {
        get: function () {
            return this._weightingPrefs;
        },
        set: function (value) {
            this._weightingPrefs = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options.prototype, "modesDisabled", {
        get: function () {
            var _this = this;
            return this._modesDisabled.concat(Options_1.overrideDisabled.filter(function (mode) { return _this._modesDisabled.indexOf(mode) === -1; }));
        },
        set: function (value) {
            this._modesDisabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options.prototype, "wheelchair", {
        get: function () {
            return this._wheelchair;
        },
        set: function (value) {
            this._wheelchair = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options.prototype, "mapLayers", {
        get: function () {
            return this._mapLayers;
        },
        set: function (value) {
            this._mapLayers = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Options.prototype, "bikeRacks", {
        get: function () {
            return this.isModeEnabled("pt_pub_bus") && this.isModeEnabled("cy_bic");
        },
        enumerable: true,
        configurable: true
    });
    Options.prototype.isModeEnabled = function (mode) {
        return this.modesDisabled.find(function (modeD) {
            return mode === modeD ||
                (mode.startsWith(modeD) && mode.charAt(modeD.length) === "_"); // mode is a particular case of (more specific than) modeD
        }) === undefined;
    };
    var Options_1;
    // Modes disabled by default, can be changed by user, recorded in local storage.
    Options.defaultDisabled = [ModeIdentifier.SCHOOLBUS_ID, ModeIdentifier.TAXI_ID, ModeIdentifier.UBER_ID, ModeIdentifier.CAR_RENTAL_SW_ID];
    // Modes forced as disabled, not recorded in local storage.
    Options.overrideDisabled = [ModeIdentifier.SCHOOLBUS_ID].concat(Features.instance.lightRail() ? [] : [ModeIdentifier.TRAM_ID]);
    __decorate([
        JsonProperty('weightingPrefs', WeightingPreferences, true),
        __metadata("design:type", WeightingPreferences)
    ], Options.prototype, "_weightingPrefs", void 0);
    __decorate([
        JsonProperty('modesDisabled', [String], true),
        __metadata("design:type", Array)
    ], Options.prototype, "_modesDisabled", void 0);
    __decorate([
        JsonProperty('wheelchair', Boolean, true),
        __metadata("design:type", Boolean)
    ], Options.prototype, "_wheelchair", void 0);
    __decorate([
        JsonProperty('mapLayers', MapLocationTypeConverter, true),
        __metadata("design:type", Array)
    ], Options.prototype, "_mapLayers", void 0);
    Options = Options_1 = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], Options);
    return Options;
}());
export default Options;
//# sourceMappingURL=Options.js.map