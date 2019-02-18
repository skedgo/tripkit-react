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
import Location from "../Location";
import { JsonObject, JsonProperty } from "json2typescript";
var City = /** @class */ (function (_super) {
    __extends(City, _super);
    function City() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._title = '';
        _this._timezone = '';
        return _this;
    }
    Object.defineProperty(City.prototype, "name", {
        get: function () {
            return this._title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(City.prototype, "timezone", {
        get: function () {
            return this._timezone;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty('title', String),
        __metadata("design:type", String)
    ], City.prototype, "_title", void 0);
    __decorate([
        JsonProperty('timezone', String),
        __metadata("design:type", String)
    ], City.prototype, "_timezone", void 0);
    City = __decorate([
        JsonObject
    ], City);
    return City;
}(Location));
export default City;
//# sourceMappingURL=City.js.map