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
import Trip from "./Trip";
import { Any, JsonObject, JsonProperty } from "json2typescript";
var TripGroup = /** @class */ (function (_super) {
    __extends(TripGroup, _super);
    function TripGroup() {
        var _this = _super.call(this) || this;
        _this._trips = [];
        _this._frequency = null;
        // @Json List<GWTDataSourceAttribution> sources;
        _this._sources = [];
        return _this;
    }
    Object.defineProperty(TripGroup.prototype, "trips", {
        get: function () {
            return this._trips;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripGroup.prototype, "frequency", {
        get: function () {
            return this._frequency;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TripGroup.prototype, "sources", {
        get: function () {
            return this._sources;
        },
        enumerable: true,
        configurable: true
    });
    TripGroup.prototype.setSelected = function (value) {
        if (this.selected) {
            Object.assign(this.trips[this.selected], new Trip());
            Object.assign(this.trips[this.selected], this);
        }
        this.selected = value;
        Object.assign(this, new Trip()); // Clean fields from previous selected trip
        Object.assign(this, this.trips[this.selected]); // Assign values of new selected trip
    };
    TripGroup.prototype.getSelectedTrip = function () {
        return this.trips[this.selected];
    };
    TripGroup.prototype.replaceAlternative = function (orig, update) {
        var updateIndex = this.trips.indexOf(orig);
        this.trips[updateIndex] = update;
        if (this.selected === updateIndex) {
            Object.assign(this, new Trip()); // Clean fields from previous selected trip
            Object.assign(this, this.trips[this.selected]); // Assign values of new selected trip
        }
    };
    __decorate([
        JsonProperty("trips", [Trip]),
        __metadata("design:type", Array)
    ], TripGroup.prototype, "_trips", void 0);
    __decorate([
        JsonProperty("frequency", Number, true),
        __metadata("design:type", Object)
    ], TripGroup.prototype, "_frequency", void 0);
    __decorate([
        JsonProperty("sources", [Any], true),
        __metadata("design:type", Array)
    ], TripGroup.prototype, "_sources", void 0);
    TripGroup = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], TripGroup);
    return TripGroup;
}(Trip));
export default TripGroup;
//# sourceMappingURL=TripGroup.js.map