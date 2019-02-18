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
var Color = /** @class */ (function () {
    function Color() {
        this._red = 0;
        this._green = 0;
        this._blue = 0;
    }
    Object.defineProperty(Color.prototype, "red", {
        get: function () {
            return this._red;
        },
        set: function (value) {
            this._red = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Color.prototype, "green", {
        get: function () {
            return this._green;
        },
        set: function (value) {
            this._green = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Color.prototype, "blue", {
        get: function () {
            return this._blue;
        },
        set: function (value) {
            this._blue = value;
        },
        enumerable: true,
        configurable: true
    });
    Color.prototype.toRGB = function () {
        return "rgb(" + this.red + "," + this.green + "," + this.blue + ")";
    };
    __decorate([
        JsonProperty("red", Number),
        __metadata("design:type", Number)
    ], Color.prototype, "_red", void 0);
    __decorate([
        JsonProperty("green", Number),
        __metadata("design:type", Number)
    ], Color.prototype, "_green", void 0);
    __decorate([
        JsonProperty("blue", Number),
        __metadata("design:type", Number)
    ], Color.prototype, "_blue", void 0);
    Color = __decorate([
        JsonObject
    ], Color);
    return Color;
}());
export default Color;
//# sourceMappingURL=Color.js.map