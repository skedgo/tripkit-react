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
import ServiceStopLocation from "../ServiceStopLocation";
import LeafletUtil from "../../util/LeafletUtil";
var ServiceShape = /** @class */ (function () {
    function ServiceShape() {
        this._operator = "";
        this._serviceTripID = "";
        this._serviceName = null;
        this._serviceNumber = null;
        this._serviceDirection = null;
        this._serviceColor = null;
        /**
         * Missing when unknown.
         */
        this._bicycleAccessible = null;
        /**
         * Missing when unknown.
         */
        this._wheelchairAccessible = null;
        this._encodedWaypoints = "";
        this._travelled = true;
        this._stops = null;
        this._waypoints = null;
    }
    Object.defineProperty(ServiceShape.prototype, "operator", {
        get: function () {
            return this._operator;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "serviceTripID", {
        get: function () {
            return this._serviceTripID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "serviceName", {
        get: function () {
            return this._serviceName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "serviceNumber", {
        get: function () {
            return this._serviceNumber;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "serviceDirection", {
        get: function () {
            return this._serviceDirection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "serviceColor", {
        get: function () {
            return this._serviceColor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "bicycleAccessible", {
        get: function () {
            return this._bicycleAccessible;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "wheelchairAccessible", {
        get: function () {
            return this._wheelchairAccessible;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "encodedWaypoints", {
        get: function () {
            return this._encodedWaypoints;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "travelled", {
        get: function () {
            return this._travelled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "stops", {
        get: function () {
            return this._stops;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceShape.prototype, "waypoints", {
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
        JsonProperty("operator", String, true) // Documentation says it's required, however sometimes is missing.
        ,
        __metadata("design:type", String)
    ], ServiceShape.prototype, "_operator", void 0);
    __decorate([
        JsonProperty("serviceTripID", String, true) // Documentation says it's required, however sometimes is missing.
        ,
        __metadata("design:type", String)
    ], ServiceShape.prototype, "_serviceTripID", void 0);
    __decorate([
        JsonProperty("serviceName", String, true),
        __metadata("design:type", Object)
    ], ServiceShape.prototype, "_serviceName", void 0);
    __decorate([
        JsonProperty("serviceNumber", String, true),
        __metadata("design:type", Object)
    ], ServiceShape.prototype, "_serviceNumber", void 0);
    __decorate([
        JsonProperty("serviceDirection", String, true),
        __metadata("design:type", Object)
    ], ServiceShape.prototype, "_serviceDirection", void 0);
    __decorate([
        JsonProperty("serviceColor", String, true),
        __metadata("design:type", Object)
    ], ServiceShape.prototype, "_serviceColor", void 0);
    __decorate([
        JsonProperty("bicycleAccessible", Boolean, true),
        __metadata("design:type", Object)
    ], ServiceShape.prototype, "_bicycleAccessible", void 0);
    __decorate([
        JsonProperty("wheelchairAccessible", Boolean, true),
        __metadata("design:type", Object)
    ], ServiceShape.prototype, "_wheelchairAccessible", void 0);
    __decorate([
        JsonProperty("encodedWaypoints", String),
        __metadata("design:type", String)
    ], ServiceShape.prototype, "_encodedWaypoints", void 0);
    __decorate([
        JsonProperty("travelled", Boolean),
        __metadata("design:type", Boolean)
    ], ServiceShape.prototype, "_travelled", void 0);
    __decorate([
        JsonProperty("stops", [ServiceStopLocation], true),
        __metadata("design:type", Object)
    ], ServiceShape.prototype, "_stops", void 0);
    ServiceShape = __decorate([
        JsonObject
    ], ServiceShape);
    return ServiceShape;
}());
export default ServiceShape;
//# sourceMappingURL=ServiceShape.js.map