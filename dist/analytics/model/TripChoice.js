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
import ChoiceSegment from "./ChoiceSegment";
var TripChoice = /** @class */ (function () {
    function TripChoice() {
        this._price = undefined;
        this._score = 0;
        this._carbon = 0;
        this._hassle = 0;
        this._calories = 0;
        this._arrivalTime = 0; /* In secs. since epoch */
        this._departureTime = 0;
        this._segments = [];
        this._selected = false;
    }
    TripChoice_1 = TripChoice;
    TripChoice.create = function (trip, selected) {
        var instance = new TripChoice_1();
        instance._price = trip.moneyUSDCost ? trip.moneyUSDCost : undefined;
        instance._score = trip.weightedScore;
        instance._carbon = trip.carbonCost;
        instance._hassle = trip.hassleCost;
        instance._calories = trip.caloriesCost;
        instance._arrivalTime = trip.arrive;
        instance._departureTime = trip.depart;
        instance._segments = trip.segments.map(function (segment) { return ChoiceSegment.create(segment); });
        instance._selected = selected;
        return instance;
    };
    Object.defineProperty(TripChoice.prototype, "price", {
        get: function () {
            return this._price;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripChoice.prototype, "score", {
        get: function () {
            return this._score;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripChoice.prototype, "carbon", {
        get: function () {
            return this._carbon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripChoice.prototype, "hassle", {
        get: function () {
            return this._hassle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripChoice.prototype, "calories", {
        get: function () {
            return this._calories;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripChoice.prototype, "arrivalTime", {
        get: function () {
            return this._arrivalTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripChoice.prototype, "departureTime", {
        get: function () {
            return this._departureTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripChoice.prototype, "segments", {
        get: function () {
            return this._segments;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripChoice.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        enumerable: true,
        configurable: true
    });
    var TripChoice_1;
    __decorate([
        JsonProperty('price', Number, true),
        __metadata("design:type", Object)
    ], TripChoice.prototype, "_price", void 0);
    __decorate([
        JsonProperty('score', Number),
        __metadata("design:type", Number)
    ], TripChoice.prototype, "_score", void 0);
    __decorate([
        JsonProperty('carbon', Number),
        __metadata("design:type", Number)
    ], TripChoice.prototype, "_carbon", void 0);
    __decorate([
        JsonProperty('hassle', Number),
        __metadata("design:type", Number)
    ], TripChoice.prototype, "_hassle", void 0);
    __decorate([
        JsonProperty('calories', Number),
        __metadata("design:type", Number)
    ], TripChoice.prototype, "_calories", void 0);
    __decorate([
        JsonProperty('arrivalTime', Number),
        __metadata("design:type", Number)
    ], TripChoice.prototype, "_arrivalTime", void 0);
    __decorate([
        JsonProperty('departureTime', Number),
        __metadata("design:type", Number)
    ], TripChoice.prototype, "_departureTime", void 0);
    __decorate([
        JsonProperty('segments', [ChoiceSegment]),
        __metadata("design:type", Array)
    ], TripChoice.prototype, "_segments", void 0);
    __decorate([
        JsonProperty('selected', Boolean),
        __metadata("design:type", Boolean)
    ], TripChoice.prototype, "_selected", void 0);
    TripChoice = TripChoice_1 = __decorate([
        JsonObject
    ], TripChoice);
    return TripChoice;
}());
export default TripChoice;
//# sourceMappingURL=TripChoice.js.map