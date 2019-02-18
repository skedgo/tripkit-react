var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { JsonProperty } from "json2typescript";
import BikePodLocation from "./BikePodLocation";
import FacilityLocation from "./FacilityLocation";
import CarParkLocation from "./CarParkLocation";
import { MapLocationType } from "./MapLocationType";
var LocationsResult = /** @class */ (function () {
    function LocationsResult(level) {
        if (level === void 0) { level = 1; }
        this._key = "";
        this._hashCode = 0;
        this._bikePods = undefined;
        this._facilities = undefined;
        this._carParks = undefined;
        this._level = level;
    }
    Object.defineProperty(LocationsResult.prototype, "key", {
        get: function () {
            return this._key;
        },
        set: function (value) {
            this._key = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LocationsResult.prototype, "hashCode", {
        get: function () {
            return this._hashCode;
        },
        set: function (value) {
            this._hashCode = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LocationsResult.prototype, "bikePods", {
        get: function () {
            return this._bikePods;
        },
        set: function (value) {
            this._bikePods = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LocationsResult.prototype, "facilities", {
        get: function () {
            return this._facilities;
        },
        set: function (value) {
            this._facilities = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LocationsResult.prototype, "carParks", {
        get: function () {
            return this._carParks;
        },
        set: function (value) {
            this._carParks = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LocationsResult.prototype, "level", {
        get: function () {
            return this._level;
        },
        set: function (value) {
            this._level = value;
        },
        enumerable: true,
        configurable: true
    });
    LocationsResult.prototype.add = function (other) {
        if (other.bikePods) {
            if (!this.bikePods) {
                this.bikePods = [];
            }
            this.bikePods = this.bikePods.concat(other.bikePods);
        }
        if (other.facilities) {
            if (!this.facilities) {
                this.facilities = [];
            }
            this.facilities = this.facilities.concat(other.facilities);
        }
        if (other.carParks) {
            if (!this.carParks) {
                this.carParks = [];
            }
            this.carParks = this.carParks.concat(other.carParks);
        }
    };
    LocationsResult.prototype.isEmpty = function () {
        return !this.bikePods && !this.facilities;
    };
    LocationsResult.prototype.getByType = function (type) {
        switch (type) {
            case MapLocationType.BIKE_POD:
                return this.bikePods ? this.bikePods : [];
            case MapLocationType.PARK_AND_RIDE_FACILITY:
                return this.facilities ? this.facilities.filter(function (facility) {
                    return facility.facilityType.toLowerCase() === "park-and-ride";
                }) : [];
            case MapLocationType.MY_WAY_FACILITY:
                return this.facilities ? this.facilities.filter(function (facility) {
                    return facility.facilityType.toLowerCase() === "myway-retail-agent";
                }) : [];
            case MapLocationType.CAR_PARK:
                return this.carParks ? this.carParks : [];
            default: // TODO Complete with other location types.
                return [];
        }
    };
    __decorate([
        JsonProperty("key", String),
        __metadata("design:type", String)
    ], LocationsResult.prototype, "_key", void 0);
    __decorate([
        JsonProperty("hashCode", Number),
        __metadata("design:type", Number)
    ], LocationsResult.prototype, "_hashCode", void 0);
    __decorate([
        JsonProperty("bikePods", [BikePodLocation], true),
        __metadata("design:type", Object)
    ], LocationsResult.prototype, "_bikePods", void 0);
    __decorate([
        JsonProperty("facilities", [FacilityLocation], true),
        __metadata("design:type", Object)
    ], LocationsResult.prototype, "_facilities", void 0);
    __decorate([
        JsonProperty("carParks", [CarParkLocation], true),
        __metadata("design:type", Object)
    ], LocationsResult.prototype, "_carParks", void 0);
    return LocationsResult;
}());
export default LocationsResult;
//# sourceMappingURL=LocationsResult.js.map