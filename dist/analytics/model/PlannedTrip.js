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
import TripChoice from "./TripChoice";
var PlannedTrip = /** @class */ (function () {
    function PlannedTrip() {
        this._source = "";
        this._choiceSet = [];
    }
    PlannedTrip_1 = PlannedTrip;
    PlannedTrip.create = function (source, trips, selected) {
        var instance = new PlannedTrip_1();
        instance._source = source;
        instance._choiceSet = trips.map(function (trip) { return TripChoice.create(trip, trip === selected); });
        return instance;
    };
    Object.defineProperty(PlannedTrip.prototype, "source", {
        get: function () {
            return this._source;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlannedTrip.prototype, "choiceSet", {
        get: function () {
            return this._choiceSet;
        },
        enumerable: true,
        configurable: true
    });
    var PlannedTrip_1;
    __decorate([
        JsonProperty('source', String),
        __metadata("design:type", String)
    ], PlannedTrip.prototype, "_source", void 0);
    __decorate([
        JsonProperty('choiceSet', [TripChoice]),
        __metadata("design:type", Array)
    ], PlannedTrip.prototype, "_choiceSet", void 0);
    PlannedTrip = PlannedTrip_1 = __decorate([
        JsonObject
    ], PlannedTrip);
    return PlannedTrip;
}());
export default PlannedTrip;
//# sourceMappingURL=PlannedTrip.js.map