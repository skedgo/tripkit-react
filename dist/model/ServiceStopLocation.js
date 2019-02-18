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
var ServiceStopLocation = /** @class */ (function (_super) {
    __extends(ServiceStopLocation, _super);
    function ServiceStopLocation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._code = '';
        _this._shortName = null;
        _this._bearing = null;
        _this._arrival = null;
        _this._departure = null;
        _this._relativeArrival = null;
        _this._relativeDeparture = null;
        _this._wheelchairAccessible = null;
        return _this;
    }
    Object.defineProperty(ServiceStopLocation.prototype, "code", {
        get: function () {
            return this._code;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceStopLocation.prototype, "shortName", {
        get: function () {
            return this._shortName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceStopLocation.prototype, "bearing", {
        get: function () {
            return this._bearing;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceStopLocation.prototype, "arrival", {
        get: function () {
            return this._arrival;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceStopLocation.prototype, "departure", {
        get: function () {
            return this._departure;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceStopLocation.prototype, "relativeArrival", {
        get: function () {
            return this._relativeArrival;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceStopLocation.prototype, "relativeDeparture", {
        get: function () {
            return this._relativeDeparture;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceStopLocation.prototype, "wheelchairAccessible", {
        get: function () {
            return this._wheelchairAccessible;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty('code', String),
        __metadata("design:type", String)
    ], ServiceStopLocation.prototype, "_code", void 0);
    __decorate([
        JsonProperty('shortName', String, true),
        __metadata("design:type", Object)
    ], ServiceStopLocation.prototype, "_shortName", void 0);
    __decorate([
        JsonProperty('bearing', Number, true),
        __metadata("design:type", Object)
    ], ServiceStopLocation.prototype, "_bearing", void 0);
    __decorate([
        JsonProperty('arrival', Number, true),
        __metadata("design:type", Object)
    ], ServiceStopLocation.prototype, "_arrival", void 0);
    __decorate([
        JsonProperty('arrival', Number, true),
        __metadata("design:type", Object)
    ], ServiceStopLocation.prototype, "_departure", void 0);
    __decorate([
        JsonProperty('relativeArrival', Number, true),
        __metadata("design:type", Object)
    ], ServiceStopLocation.prototype, "_relativeArrival", void 0);
    __decorate([
        JsonProperty('relativeDeparture', Number, true),
        __metadata("design:type", Object)
    ], ServiceStopLocation.prototype, "_relativeDeparture", void 0);
    __decorate([
        JsonProperty('wheelchairAccessible', Boolean, true),
        __metadata("design:type", Object)
    ], ServiceStopLocation.prototype, "_wheelchairAccessible", void 0);
    ServiceStopLocation = __decorate([
        JsonObject
    ], ServiceStopLocation);
    return ServiceStopLocation;
}(Location));
export default ServiceStopLocation;
//# sourceMappingURL=ServiceStopLocation.js.map