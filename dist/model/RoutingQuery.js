import DateTimeUtil from "../util/DateTimeUtil";
import OptionsData from "../data/OptionsData";
export var TimePreference;
(function (TimePreference) {
    TimePreference["NOW"] = "NOW";
    TimePreference["LEAVE"] = "LEAVE";
    TimePreference["ARRIVE"] = "ARRIVE";
})(TimePreference || (TimePreference = {}));
var RoutingQuery = /** @class */ (function () {
    /**
     * Empty constructor, necessary for Util.clone
     */
    function RoutingQuery() {
        this._from = null;
        this._to = null;
    }
    RoutingQuery.create = function (from, to, timePref, time) {
        if (from === void 0) { from = null; }
        if (to === void 0) { to = null; }
        if (timePref === void 0) { timePref = TimePreference.NOW; }
        if (time === void 0) { time = DateTimeUtil.getNow(); }
        var instance = new RoutingQuery();
        instance._from = from;
        instance._to = to;
        instance._timePref = timePref;
        instance._time = time;
        instance._options = OptionsData.instance.get();
        return instance;
    };
    Object.defineProperty(RoutingQuery.prototype, "from", {
        get: function () {
            return this._from;
        },
        set: function (value) {
            this._from = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoutingQuery.prototype, "to", {
        get: function () {
            return this._to;
        },
        set: function (value) {
            this._to = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoutingQuery.prototype, "timePref", {
        get: function () {
            return this._timePref;
        },
        set: function (value) {
            this._timePref = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoutingQuery.prototype, "time", {
        get: function () {
            return this._timePref === TimePreference.NOW || this._time === null ? DateTimeUtil.getNow() : this._time;
        },
        set: function (value) {
            this._time = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoutingQuery.prototype, "options", {
        get: function () {
            return this._options;
        },
        set: function (value) {
            this._options = value;
        },
        enumerable: true,
        configurable: true
    });
    RoutingQuery.prototype.isComplete = function (checkResolved) {
        if (checkResolved === void 0) { checkResolved = false; }
        return this.from !== null && (!checkResolved || this.from.isResolved()) &&
            this.to !== null && (!checkResolved || this.to.isResolved());
    };
    RoutingQuery.prototype.getGoUrl = function (plannerUrl) {
        var goURL = (plannerUrl ? plannerUrl : "https://act.tripgo.com/?app=tripPlanner");
        if (this.from === null || this.to === null) {
            return goURL;
        }
        return goURL + (goURL.includes("?") ? "&" : "?") +
            "flat=" + this.from.lat + "&flng=" + this.from.lng +
            "&fname=" + (this.from.isCurrLoc() && !this.from.isResolved() ? "My location" : this.from.address) +
            (this.from.id ? "&fid=" + (this.from.id) : "") +
            (this.from.source ? "&fsrc=" + (this.from.source) : "") +
            "&tlat=" + this.to.lat + "&tlng=" + this.to.lng +
            "&tname=" + (this.to.isCurrLoc() && !this.to.isResolved() ? "My location" : this.to.address) +
            (this.to.id ? "&tid=" + (this.to.id) : "") +
            (this.to.source ? "&tsrc=" + (this.to.source) : "") +
            "&type=" + (this.timePref === TimePreference.NOW ? "0" : (this.timePref === TimePreference.LEAVE ? "1" : "2")) +
            "&time=" + Math.floor(this.time.valueOf() / 1000);
    };
    RoutingQuery.prototype.getQueryUrl = function (modeSet) {
        if (this.from === null || this.to === null) {
            return "";
        }
        var modeParams = "";
        for (var _i = 0, modeSet_1 = modeSet; _i < modeSet_1.length; _i++) {
            var mode = modeSet_1[_i];
            modeParams += "&modes[]=" + mode;
        }
        if (modeSet.indexOf("pt_pub") !== -1) {
            if (!this.options.isModeEnabled("pt_pub_bus")) {
                modeParams += "&avoidModes[]=" + "pt_pub_bus";
            }
            if (!this.options.isModeEnabled("pt_pub_tram")) {
                modeParams += "&avoidModes[]=" + "pt_pub_tram";
            }
        }
        return "routing.json?" +
            "from=(" + this.from.lat + "," + this.from.lng + ")&to=(" + this.to.lat + "," + this.to.lng + ")&" +
            (this.timePref === TimePreference.ARRIVE ? "arriveBefore" : "departAfter") + "=" + Math.floor(this.time.valueOf() / 1000) +
            modeParams +
            "&wp=" + this.options.weightingPrefs.toUrlParam() +
            "&tt=0&unit=auto&v=11&locale=en&ir=1&ws=1&cs=1&includeStops=true" +
            (this.options.wheelchair ? "&wheelchair=true" : "");
    };
    RoutingQuery.prototype.isEmpty = function () {
        return this.from === null && this.to === null;
    };
    return RoutingQuery;
}());
export default RoutingQuery;
//# sourceMappingURL=RoutingQuery.js.map