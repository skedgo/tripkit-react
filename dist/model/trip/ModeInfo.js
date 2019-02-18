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
import Color from "./Color";
var ModeInfo = /** @class */ (function () {
    function ModeInfo() {
        /**
         * Missing for stationary segments.
         */
        this._identifier = undefined;
        /**
         * Textual alternative to icon. Required.
         */
        this._alt = "";
        /**
         * Part of icon file name that should be shipped with app. Required.
         */
        this._localIcon = "";
        /**
         * Part of icon file name that can be fetched from server.
         */
        this._remoteIcon = undefined;
        /**
         * Part of icon file name for dark background that can be fetched from server.
         */
        this._remoteDarkIcon = undefined;
        this._color = undefined;
    }
    Object.defineProperty(ModeInfo.prototype, "identifier", {
        get: function () {
            return this._identifier;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModeInfo.prototype, "alt", {
        get: function () {
            return this._alt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModeInfo.prototype, "localIcon", {
        get: function () {
            return this._localIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModeInfo.prototype, "remoteIcon", {
        get: function () {
            return this._remoteIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModeInfo.prototype, "remoteDarkIcon", {
        get: function () {
            return this._remoteDarkIcon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ModeInfo.prototype, "color", {
        get: function () {
            return this._color;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty("identifier", String, true),
        __metadata("design:type", Object)
    ], ModeInfo.prototype, "_identifier", void 0);
    __decorate([
        JsonProperty("alt", String),
        __metadata("design:type", String)
    ], ModeInfo.prototype, "_alt", void 0);
    __decorate([
        JsonProperty("localIcon", String),
        __metadata("design:type", String)
    ], ModeInfo.prototype, "_localIcon", void 0);
    __decorate([
        JsonProperty("remoteIcon", String, true),
        __metadata("design:type", Object)
    ], ModeInfo.prototype, "_remoteIcon", void 0);
    __decorate([
        JsonProperty("remoteDarkIcon", String, true),
        __metadata("design:type", Object)
    ], ModeInfo.prototype, "_remoteDarkIcon", void 0);
    __decorate([
        JsonProperty("color", Color, true),
        __metadata("design:type", Object)
    ], ModeInfo.prototype, "_color", void 0);
    ModeInfo = __decorate([
        JsonObject
    ], ModeInfo);
    return ModeInfo;
}());
export default ModeInfo;
//# sourceMappingURL=ModeInfo.js.map