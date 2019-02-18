var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { JsonConverter } from "json2typescript";
export var MapLocationType;
(function (MapLocationType) {
    MapLocationType["BIKE_POD"] = "BIKE_POD";
    MapLocationType["CAR_PARK"] = "CAR_PARK";
    MapLocationType["CAR_POD"] = "CAR_POD";
    MapLocationType["CAR_RENTAL"] = "CAR_RENTAL";
    MapLocationType["STOP"] = "STOP";
    MapLocationType["MY_WAY_FACILITY"] = "MY_WAY_FACILITY";
    MapLocationType["PARK_AND_RIDE_FACILITY"] = "PARK_AND_RIDE_FACILITY";
})(MapLocationType || (MapLocationType = {}));
// export namespace MapLocationType {
export function values() {
    return Object.keys(MapLocationType).filter(function (type) { return isNaN(type) && type !== 'values'; });
}
// }
export function mapLocationTypeToGALabel(value) {
    switch (value) {
        case MapLocationType.BIKE_POD: return "bike share";
        case MapLocationType.CAR_PARK: return "car park";
        case MapLocationType.CAR_POD: return "car pod";
        case MapLocationType.CAR_RENTAL: return "car rental";
        case MapLocationType.STOP: return "stop";
        case MapLocationType.MY_WAY_FACILITY: return "myway retailer";
        case MapLocationType.PARK_AND_RIDE_FACILITY: return "park & ride";
        default: return "";
    }
}
var MapLocationTypeConverter = /** @class */ (function () {
    function MapLocationTypeConverter() {
    }
    MapLocationTypeConverter.prototype.serialize = function (mapLocationType) {
        return mapLocationType;
    };
    MapLocationTypeConverter.prototype.deserialize = function (date) {
        return date;
    };
    MapLocationTypeConverter = __decorate([
        JsonConverter
    ], MapLocationTypeConverter);
    return MapLocationTypeConverter;
}());
export { MapLocationTypeConverter };
export default MapLocationType;
//# sourceMappingURL=MapLocationType.js.map