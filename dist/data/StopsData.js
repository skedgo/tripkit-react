import TripGoApi from "../api/TripGoApi";
var StopsData = /** @class */ (function () {
    function StopsData() {
        this.stops = new Map();
    }
    Object.defineProperty(StopsData, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new StopsData();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    StopsData.prototype.getStopFromCode = function (regionCode, stopCode) {
        var _this = this;
        var regionStopCode = regionCode + "-" + stopCode;
        var cachedStop = this.stops.get(regionStopCode);
        if (cachedStop) {
            return Promise.resolve(cachedStop);
        }
        return TripGoApi.findStopFromCode(regionCode, stopCode)
            .then(function (stopLocation) {
            _this.stops.set(regionStopCode, stopLocation);
            return stopLocation;
        });
    };
    return StopsData;
}());
export default StopsData;
//# sourceMappingURL=StopsData.js.map