import DateTimeUtil from "../util/DateTimeUtil";
import OptionsData from "../data/OptionsData";
import RegionsData from "../data/RegionsData";
import OptionsView from "../options/OptionsView";
import ModeIdentifier from "./region/ModeIdentifier";
import GeocodingSource from "../location_box/GeocodingSource";
import SchoolGeocoder from "../location_box/SchoolGeocoder";
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
    RoutingQuery.prototype.getQueryUrls = function () {
        var _this = this;
        var referenceLatLng = this.from && this.from.isResolved() ? this.from : (this.to && this.to.isResolved() ? this.to : undefined);
        if (referenceLatLng) {
            return RegionsData.instance.getRegionP(referenceLatLng).then(function (region) {
                if (!region) {
                    Promise.reject("Query out of coverage.");
                }
                return SchoolGeocoder.instance.getSchoolsDataP().then(function () {
                    return _this.getQueryUrlsForRegion(region);
                });
            });
        }
        return Promise.reject("Cannot get query urls for empty query.");
    };
    RoutingQuery.prototype.getQueryUrlsForRegion = function (region) {
        var _this = this;
        var modes = region ? region.modes : [];
        var enabledModes = modes.filter(function (mode) {
            return (_this.options.isModeEnabled(mode)
                || (mode === "wa_wal" && _this.options.wheelchair)) && // send wa_wal as mode when wheelchair is true.
                !OptionsView.skipMode(mode) &&
                !(mode === "pt_pub" && !_this.options.isModeEnabled("pt_pub_bus")
                    && !_this.options.isModeEnabled("pt_pub_tram"));
        });
        var busModesSet = [];
        if (enabledModes.indexOf(ModeIdentifier.PUBLIC_TRANSPORT_ID) !== -1 &&
            (this.from && this.from.source === GeocodingSource.ACT_SCHOOLS ||
                this.to && this.to.source === GeocodingSource.ACT_SCHOOLS)) {
            var busesFrom = this.from ? SchoolGeocoder.instance.getBusesForSchoolId(this.from.id, this.time.valueOf()) : [];
            var busesTo = this.to ? SchoolGeocoder.instance.getBusesForSchoolId(this.to.id, this.time.valueOf()) : [];
            var buses = (busesFrom ? busesFrom : []).concat(busesTo ? busesTo : []);
            busModesSet = buses.map(function (bus) { return ModeIdentifier.SCHOOLBUS_ID + "_" + bus; });
        }
        var modeSets = enabledModes.map(function (mode) { return mode === ModeIdentifier.PUBLIC_TRANSPORT_ID ? [mode].concat(busModesSet) : [mode]; });
        var multiModalSet = enabledModes.concat(busModesSet);
        // to filter out singleton multi-modal set and multi-modal set containing just PT and SCHOOLBUS.
        if (multiModalSet.length !== 1 && !multiModalSet.every(function (mode) {
            return mode === ModeIdentifier.PUBLIC_TRANSPORT_ID || mode.startsWith(ModeIdentifier.SCHOOLBUS_ID);
        })) {
            modeSets.push(multiModalSet);
        }
        if (!region) { // Push empty set to put something if called with no region,
            modeSets.push([]); // which happens when checking if same query on TripPlanner.componentDidMount
        }
        return modeSets.map(function (modeSet) {
            return _this.getQueryUrl(modeSet);
        });
    };
    // private getExpandedModes(region: Region): string[] {
    //     const expandedModes: string[] = [];
    //     for (const mode of region.modes) {
    //         if (mode === "pt_pub") {
    //             expandedModes.push("pt_pub_bus");
    //             expandedModes.push("pt_pub_lightRail");
    //         } else {
    //             expandedModes.push(mode);
    //         }
    //     }
    //     return expandedModes;
    // }
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
    RoutingQuery.prototype.sameApiQueries = function (other) {
        var referenceLatLng = this.from && this.from.isResolved() ? this.from :
            (this.to && this.to.isResolved() ? this.to : undefined);
        // Region can be undefined since we want to check if queries are the same even before regions arrive.
        var region = referenceLatLng ? RegionsData.instance.getRegion(referenceLatLng) : undefined;
        return JSON.stringify(this.getQueryUrlsForRegion(region)) === JSON.stringify(other.getQueryUrlsForRegion(region));
    };
    RoutingQuery.prototype.isEmpty = function () {
        return this.from === null && this.to === null;
    };
    return RoutingQuery;
}());
export default RoutingQuery;
//# sourceMappingURL=RoutingQuery.js.map