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
import Color from "../trip/Color";
var ModeIdentifier = /** @class */ (function () {
    /**
     * Empty constructor, necessary for Util.clone
     */
    function ModeIdentifier() {
        this._title = "";
        this._color = null;
        this._icon = null;
        // Avoid empty error
    }
    Object.defineProperty(ModeIdentifier.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            this._title = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModeIdentifier.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (value) {
            this._color = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModeIdentifier.prototype, "icon", {
        get: function () {
            return this._icon;
        },
        set: function (value) {
            this._icon = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModeIdentifier.prototype, "identifier", {
        get: function () {
            return this._identifier;
        },
        set: function (value) {
            this._identifier = value;
        },
        enumerable: true,
        configurable: true
    });
    ModeIdentifier.SCHOOLBUS_ID = "pt_ltd_SCHOOLBUS";
    ModeIdentifier.UBER_ID = "ps_tnc_UBER";
    ModeIdentifier.CAR_RENTAL_SW_ID = "me_car-r_SwiftFleet";
    ModeIdentifier.TAXI_ID = "ps_tax";
    ModeIdentifier.PUBLIC_TRANSPORT_ID = "pt_pub";
    ModeIdentifier.TRAM_ID = "pt_pub_tram";
    __decorate([
        JsonProperty("title", String),
        __metadata("design:type", String)
    ], ModeIdentifier.prototype, "_title", void 0);
    __decorate([
        JsonProperty("color", Color, true),
        __metadata("design:type", Object)
    ], ModeIdentifier.prototype, "_color", void 0);
    __decorate([
        JsonProperty("icon", String, true),
        __metadata("design:type", Object)
    ], ModeIdentifier.prototype, "_icon", void 0);
    ModeIdentifier = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], ModeIdentifier);
    return ModeIdentifier;
}());
export default ModeIdentifier;
//# sourceMappingURL=ModeIdentifier.js.map