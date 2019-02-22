var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import Location from "./Location";
import { JsonObject, JsonProperty } from "json2typescript";
import ModeInfo from "./trip/ModeInfo";
import ModeInfoConverter from "./trip/ModeInfoConverter";
var StopLocation = /** @class */ (function (_super) {
    __extends(StopLocation, _super);
    function StopLocation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._code = '';
        _this._popularity = 0;
        // Needs to use custom converter since modeInfo incorrectly comes with value {}, which causes a parsing error.
        _this._modeInfo = new ModeInfo();
        _this._wheelchairAccessible = undefined;
        _this._url = undefined;
        return _this;
    }
    Object.defineProperty(StopLocation.prototype, "code", {
        get: function () {
            return this._code;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StopLocation.prototype, "popularity", {
        get: function () {
            return this._popularity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StopLocation.prototype, "modeInfo", {
        get: function () {
            return this._modeInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StopLocation.prototype, "wheelchairAccessible", {
        get: function () {
            return this._wheelchairAccessible;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StopLocation.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty('code', String),
        __metadata("design:type", String)
    ], StopLocation.prototype, "_code", void 0);
    __decorate([
        JsonProperty('popularity', Number),
        __metadata("design:type", Number)
    ], StopLocation.prototype, "_popularity", void 0);
    __decorate([
        JsonProperty('modeInfo', ModeInfoConverter),
        __metadata("design:type", ModeInfo)
    ], StopLocation.prototype, "_modeInfo", void 0);
    __decorate([
        JsonProperty('wheelchairAccessible', Boolean, true),
        __metadata("design:type", Object)
    ], StopLocation.prototype, "_wheelchairAccessible", void 0);
    __decorate([
        JsonProperty('url', String, true),
        __metadata("design:type", Object)
    ], StopLocation.prototype, "_url", void 0);
    StopLocation = __decorate([
        JsonObject
    ], StopLocation);
    return StopLocation;
}(Location));
export default StopLocation;
//# sourceMappingURL=StopLocation.js.map