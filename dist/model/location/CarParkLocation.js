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
import { JsonObject, JsonProperty } from "json2typescript";
import ModeInfo from "../trip/ModeInfo";
import Location from "../Location";
import CarParkInfo from "./CarParkInfo";
var CarParkLocation = /** @class */ (function (_super) {
    __extends(CarParkLocation, _super);
    function CarParkLocation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._carPark = new CarParkInfo();
        _this._modeInfo = new ModeInfo();
        return _this;
    }
    Object.defineProperty(CarParkLocation.prototype, "carPark", {
        get: function () {
            return this._carPark;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarParkLocation.prototype, "modeInfo", {
        get: function () {
            return this._modeInfo;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty("carPark", CarParkInfo),
        __metadata("design:type", CarParkInfo)
    ], CarParkLocation.prototype, "_carPark", void 0);
    __decorate([
        JsonProperty("modeInfo", ModeInfo),
        __metadata("design:type", ModeInfo)
    ], CarParkLocation.prototype, "_modeInfo", void 0);
    CarParkLocation = __decorate([
        JsonObject
    ], CarParkLocation);
    return CarParkLocation;
}(Location));
export default CarParkLocation;
//# sourceMappingURL=CarParkLocation.js.map