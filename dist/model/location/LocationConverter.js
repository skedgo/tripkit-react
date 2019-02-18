var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import StopLocation from "../StopLocation";
import Location from "../Location";
import { JsonConverter, JsonConvert } from "json2typescript";
var LocationConverter = /** @class */ (function () {
    function LocationConverter() {
    }
    LocationConverter.prototype.serialize = function (location) {
        var jsonConvert = new JsonConvert();
        return jsonConvert.serialize(location);
    };
    LocationConverter.prototype.deserialize = function (locationJson) {
        var jsonConvert = new JsonConvert();
        var location;
        if (locationJson.class === "StopLocation") {
            location = jsonConvert.deserialize(locationJson, StopLocation);
        }
        else {
            location = jsonConvert.deserialize(locationJson, Location);
        }
        return location;
    };
    LocationConverter = __decorate([
        JsonConverter
    ], LocationConverter);
    return LocationConverter;
}());
export { LocationConverter };
//# sourceMappingURL=LocationConverter.js.map