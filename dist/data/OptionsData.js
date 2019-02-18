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
import Options from "../model/Options";
import LocalStorageItem from "./LocalStorageItem";
var OptionsData = /** @class */ (function (_super) {
    __extends(OptionsData, _super);
    function OptionsData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(OptionsData, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new OptionsData(Options, "OPTIONS");
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    return OptionsData;
}(LocalStorageItem));
export default OptionsData;
//# sourceMappingURL=OptionsData.js.map