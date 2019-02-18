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
import Segment from "./Segment";
import Util from "../../util/Util";
var Trip = /** @class */ (function () {
    function Trip() {
        this._depart = 0;
        this._arrive = 0;
        this._weightedScore = 0;
        this._queryIsLeaveAfter = null;
        this._queryTime = null;
        this._currencySymbol = null;
        this._moneyCost = 0;
        this._moneyUSDCost = 0;
        this._carbonCost = 0;
        this._hassleCost = 0;
        this._caloriesCost = 0;
        this._saveURL = "";
        this._updateURL = "";
        this._temporaryURL = "";
        this._plannedURL = "";
        this._segments = [];
    }
    Object.defineProperty(Trip.prototype, "depart", {
        get: function () {
            return this._depart;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "arrive", {
        get: function () {
            return this._arrive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "weightedScore", {
        get: function () {
            return this._weightedScore;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "queryIsLeaveAfter", {
        get: function () {
            return this._queryIsLeaveAfter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "queryTime", {
        get: function () {
            return this._queryTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "currencySymbol", {
        get: function () {
            return this._currencySymbol;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "moneyCost", {
        get: function () {
            return this._moneyCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "moneyUSDCost", {
        get: function () {
            return this._moneyUSDCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "carbonCost", {
        get: function () {
            return this._carbonCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "hassleCost", {
        get: function () {
            return this._hassleCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "caloriesCost", {
        get: function () {
            return this._caloriesCost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "saveURL", {
        get: function () {
            return this._saveURL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "updateURL", {
        get: function () {
            return this._updateURL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "temporaryURL", {
        get: function () {
            return this._temporaryURL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "plannedURL", {
        get: function () {
            return this._plannedURL;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "segments", {
        get: function () {
            return this._segments;
        },
        enumerable: true,
        configurable: true
    });
    Trip.prototype.hasPublicTransport = function () {
        if (this.segments.length === 0) {
            return false;
        }
        // TODO improve detection of isPublicTransport on segment.
        return this.segments.find(function (segment) { return segment.isPT(); }) !== undefined;
    };
    Trip.prototype.hasBicycle = function () {
        if (this.segments.length === 0) {
            return false;
        }
        return this.segments.find(function (segment) { return segment.isBicycle(); }) !== undefined;
    };
    Trip.prototype.isBicycleTrip = function () {
        return this.hasBicycle() &&
            this.segments.every(function (segment) { return segment.isBicycle() || segment.isWalking() || segment.type === "stationary"; });
    };
    Trip.prototype.getWheelchairAccessible = function () {
        if (!this.hasPublicTransport()) {
            return null;
        }
        var wheelchairAccessible = true;
        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
            var segment = _a[_i];
            if (segment.isPT()) {
                if (segment.wheelchairAccessible === false) {
                    return false; // if one segment is not accessible, the trip is not accessible
                }
                if (segment.wheelchairAccessible === null) {
                    wheelchairAccessible = null; // trip accessibility is at most null, can still become false
                }
            }
        }
        return wheelchairAccessible;
    };
    Trip.prototype.getBicycleAccessible = function () {
        if (!this.hasPublicTransport()) {
            return null;
        }
        var bicycleAccessible = true;
        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
            var segment = _a[_i];
            if (segment.isPT()) {
                if (segment.bicycleAccessible === false) {
                    return false; // if one segment is not accessible, the trip is not accessible
                }
                if (segment.bicycleAccessible === null) {
                    bicycleAccessible = null; // trip accessibility is at most null, can still become false
                }
            }
        }
        return bicycleAccessible;
    };
    Trip.prototype.isSingleSegment = function () {
        return this.segments.length === 1;
    };
    Trip.prototype.getKey = function () {
        return (this.saveURL ? this.saveURL : String(this.weightedScore));
    };
    Object.defineProperty(Trip.prototype, "satappQuery", {
        get: function () {
            return this._satappQuery;
        },
        set: function (value) {
            this._satappQuery = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Trip.prototype, "arrivalSegment", {
        /**
         * Artificial segment representing the trip arrival. It's not in trip segments array.
         */
        get: function () {
            if (!this._arrivalSegment) {
                var last = this.segments[this.segments.length - 1];
                this._arrivalSegment = Util.iAssign(last, {});
                this._arrivalSegment.arrival = true;
                this._arrivalSegment.from = last.to;
                this._arrivalSegment.startTime = last.endTime;
                this._arrivalSegment.action = "Arrive";
            }
            return this._arrivalSegment;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty("depart", Number, true),
        __metadata("design:type", Number)
    ], Trip.prototype, "_depart", void 0);
    __decorate([
        JsonProperty("arrive", Number, true),
        __metadata("design:type", Number)
    ], Trip.prototype, "_arrive", void 0);
    __decorate([
        JsonProperty("weightedScore", Number, true),
        __metadata("design:type", Number)
    ], Trip.prototype, "_weightedScore", void 0);
    __decorate([
        JsonProperty("queryIsLeaveAfter", Boolean, true),
        __metadata("design:type", Object)
    ], Trip.prototype, "_queryIsLeaveAfter", void 0);
    __decorate([
        JsonProperty("queryTime", Number, true),
        __metadata("design:type", Object)
    ], Trip.prototype, "_queryTime", void 0);
    __decorate([
        JsonProperty("currencySymbol", String, true),
        __metadata("design:type", Object)
    ], Trip.prototype, "_currencySymbol", void 0);
    __decorate([
        JsonProperty("moneyCost", Number, true),
        __metadata("design:type", Object)
    ], Trip.prototype, "_moneyCost", void 0);
    __decorate([
        JsonProperty("moneyUSDCost", Number, true),
        __metadata("design:type", Object)
    ], Trip.prototype, "_moneyUSDCost", void 0);
    __decorate([
        JsonProperty("carbonCost", Number, true),
        __metadata("design:type", Number)
    ], Trip.prototype, "_carbonCost", void 0);
    __decorate([
        JsonProperty("hassleCost", Number, true),
        __metadata("design:type", Number)
    ], Trip.prototype, "_hassleCost", void 0);
    __decorate([
        JsonProperty("caloriesCost", Number, true),
        __metadata("design:type", Number)
    ], Trip.prototype, "_caloriesCost", void 0);
    __decorate([
        JsonProperty("saveURL", String, true),
        __metadata("design:type", String)
    ], Trip.prototype, "_saveURL", void 0);
    __decorate([
        JsonProperty("updateURL", String, true),
        __metadata("design:type", String)
    ], Trip.prototype, "_updateURL", void 0);
    __decorate([
        JsonProperty("temporaryURL", String, true),
        __metadata("design:type", String)
    ], Trip.prototype, "_temporaryURL", void 0);
    __decorate([
        JsonProperty("plannedURL", String, true),
        __metadata("design:type", String)
    ], Trip.prototype, "_plannedURL", void 0);
    __decorate([
        JsonProperty("segments", [Segment], true),
        __metadata("design:type", Array)
    ], Trip.prototype, "_segments", void 0);
    Trip = __decorate([
        JsonObject
    ], Trip);
    return Trip;
}());
export default Trip;
//# sourceMappingURL=Trip.js.map