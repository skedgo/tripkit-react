import PlannedTrip from "./model/PlannedTrip";
import Environment from "../env/Environment";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import { JsonConvert } from "json2typescript";
var PlannedTripsTracker = /** @class */ (function () {
    function PlannedTripsTracker() {
        this._trips = null;
        this.track = this.track.bind(this);
    }
    Object.defineProperty(PlannedTripsTracker, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new PlannedTripsTracker();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlannedTripsTracker.prototype, "trips", {
        set: function (value) {
            this._trips = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlannedTripsTracker.prototype, "selected", {
        set: function (value) {
            this._selected = value;
        },
        enumerable: true,
        configurable: true
    });
    PlannedTripsTracker.prototype.scheduleTrack = function (long) {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(this.track, long ? 10000 : 2000);
    };
    PlannedTripsTracker.prototype.track = function () {
        if (this._trips === null || !this._selected) {
            return;
        }
        var trackData = PlannedTrip.create("manual", this._trips, this._selected);
        var jsonConvert = new JsonConvert();
        var body = jsonConvert.serialize(trackData);
        if (Environment.isProd()) {
            if (this._selected.plannedURL) {
                TripGoApi.apiCallUrl(this._selected.plannedURL, NetworkUtil.MethodType.POST, body);
            }
        }
        else {
            TripGoApi.apiCallUrl("http://httpbin.org/post", NetworkUtil.MethodType.POST, body);
        }
    };
    return PlannedTripsTracker;
}());
export default PlannedTripsTracker;
//# sourceMappingURL=PlannedTripsTracker.js.map