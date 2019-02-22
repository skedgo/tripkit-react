var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import Util from "../../util/Util";
import { JsonConverter, JsonConvert } from "json2typescript";
import ModeInfo from "./ModeInfo";
var ModeInfoConverter = /** @class */ (function () {
    function ModeInfoConverter() {
    }
    ModeInfoConverter.prototype.serialize = function (modeInfo) {
        var jsonConvert = new JsonConvert();
        return jsonConvert.serialize(modeInfo);
    };
    ModeInfoConverter.prototype.deserialize = function (modeInfo) {
        if (Util.isEmpty(modeInfo)) {
            return new ModeInfo();
        }
        var jsonConvert = new JsonConvert();
        return jsonConvert.deserialize(modeInfo, ModeInfo);
    };
    ModeInfoConverter = __decorate([
        JsonConverter
    ], ModeInfoConverter);
    return ModeInfoConverter;
}());
export { ModeInfoConverter };
export default ModeInfoConverter;
//# sourceMappingURL=ModeInfoConverter.js.map