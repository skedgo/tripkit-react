var Features = /** @class */ (function () {
    function Features() {
    }
    Features.initialize = function () {
        console.log("Features:initialize()");
        this._instance = new Features();
    };
    Object.defineProperty(Features, "instance", {
        get: function () {
            // if (!this._instance) {
            //     this._instance = new Features();
            // }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    Features.prototype.lightRail = function () {
        console.log("Features:lightRail()");
        return true;
    };
    return Features;
}());
Features.initialize();
export default Features;
//# sourceMappingURL=Features.js.map