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
var WeightingPreferences = /** @class */ (function () {
    /**
     * Empty constructor, necessary for Util.clone
     */
    function WeightingPreferences() {
        this._money = 1;
        this._carbon = 1;
        this._time = 1;
        this._hassle = 1;
        // Avoid empty error
    }
    WeightingPreferences_1 = WeightingPreferences;
    WeightingPreferences.create = function (money, carbon, time, hassle) {
        if (money === void 0) { money = 1; }
        if (carbon === void 0) { carbon = 1; }
        if (time === void 0) { time = 1; }
        if (hassle === void 0) { hassle = 1; }
        var instance = new WeightingPreferences_1();
        instance._money = money;
        instance._carbon = carbon;
        instance._time = time;
        instance._hassle = hassle;
        return instance;
    };
    Object.defineProperty(WeightingPreferences.prototype, "money", {
        get: function () {
            return this._money;
        },
        set: function (value) {
            this._money = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WeightingPreferences.prototype, "carbon", {
        get: function () {
            return this._carbon;
        },
        set: function (value) {
            this._carbon = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WeightingPreferences.prototype, "time", {
        get: function () {
            return this._time;
        },
        set: function (value) {
            this._time = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WeightingPreferences.prototype, "hassle", {
        get: function () {
            return this._hassle;
        },
        set: function (value) {
            this._hassle = value;
        },
        enumerable: true,
        configurable: true
    });
    WeightingPreferences.prototype.toUrlParam = function () {
        return "(" + this.money.toFixed(2) + "," + this.carbon.toFixed(2) + "," +
            this.time.toFixed(2) + "," + this.hassle.toFixed(2) + ")";
    };
    var WeightingPreferences_1;
    __decorate([
        JsonProperty('money', Number),
        __metadata("design:type", Number)
    ], WeightingPreferences.prototype, "_money", void 0);
    __decorate([
        JsonProperty('carbon', Number),
        __metadata("design:type", Number)
    ], WeightingPreferences.prototype, "_carbon", void 0);
    __decorate([
        JsonProperty('time', Number),
        __metadata("design:type", Number)
    ], WeightingPreferences.prototype, "_time", void 0);
    __decorate([
        JsonProperty('hassle', Number),
        __metadata("design:type", Number)
    ], WeightingPreferences.prototype, "_hassle", void 0);
    WeightingPreferences = WeightingPreferences_1 = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], WeightingPreferences);
    return WeightingPreferences;
}());
export default WeightingPreferences;
//# sourceMappingURL=WeightingPreferences.js.map