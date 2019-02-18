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
var ChoiceSegment = /** @class */ (function () {
    function ChoiceSegment() {
        this._mode = "";
        this._duration = 0; /* In secs. */
    }
    ChoiceSegment_1 = ChoiceSegment;
    ChoiceSegment.create = function (segment) {
        var instance = new ChoiceSegment_1();
        var modeInfo = segment.modeInfo;
        instance._mode = modeInfo !== null ?
            (modeInfo.identifier ? modeInfo.identifier : modeInfo.alt.toLowerCase()) : "";
        instance._duration = segment.endTime - segment.startTime;
        return instance;
    };
    Object.defineProperty(ChoiceSegment.prototype, "mode", {
        get: function () {
            return this._mode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChoiceSegment.prototype, "duration", {
        get: function () {
            return this._duration;
        },
        enumerable: true,
        configurable: true
    });
    var ChoiceSegment_1;
    __decorate([
        JsonProperty('mode', String),
        __metadata("design:type", String)
    ], ChoiceSegment.prototype, "_mode", void 0);
    __decorate([
        JsonProperty('duration', Number),
        __metadata("design:type", Number)
    ], ChoiceSegment.prototype, "_duration", void 0);
    ChoiceSegment = ChoiceSegment_1 = __decorate([
        JsonObject
    ], ChoiceSegment);
    return ChoiceSegment;
}());
export default ChoiceSegment;
//# sourceMappingURL=ChoiceSegment.js.map