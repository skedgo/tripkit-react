import Environment from "./Environment";
var Features = /** @class */ (function () {
    function Features() {
    }
    Object.defineProperty(Features, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new Features();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    Features.prototype.lightRail = function () {
        return !Environment.isProd();
    };
    Features.prototype.schoolBuses = function () {
        return !Environment.isProd();
    };
    return Features;
}());
export default Features;
//# sourceMappingURL=Features.js.map