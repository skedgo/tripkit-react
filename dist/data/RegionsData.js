import NetworkUtil from "../util/NetworkUtil";
import { JsonConvert } from "json2typescript";
import RegionResults from "../model/region/RegionResults";
import TripGoApi from "../api/TripGoApi";
import ModeIdentifier from "../model/region/ModeIdentifier";
import LocationUtil from "../util/LocationUtil";
var RegionsData = /** @class */ (function () {
    function RegionsData() {
        var _this = this;
        this._modes = new Map();
        var jsonConvert = new JsonConvert();
        this.regionsRequest = TripGoApi.apiCall("regions.json", NetworkUtil.MethodType.POST, { v: 2 })
            .then(function (regionResultsJson) {
            return jsonConvert.deserialize(regionResultsJson, RegionResults);
        });
        this.regionsPromise = this.regionsRequest.then(function (regionResults) {
            _this.regions = new Map();
            for (var _i = 0, _a = regionResults.regions; _i < _a.length; _i++) {
                var region = _a[_i];
                _this.regions.set(region.name, region);
            }
            _this.regionList = Array.from(_this.regions.values());
            for (var _b = 0, _c = Object.keys(regionResults.modes); _b < _c.length; _b++) {
                var modeKey = _c[_b];
                var modeIdentifier = jsonConvert.deserialize(regionResults.modes[modeKey], ModeIdentifier);
                modeIdentifier.identifier = modeKey;
                _this._modes.set(modeKey, modeIdentifier);
            }
            return _this.regions;
        });
    }
    Object.defineProperty(RegionsData, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new RegionsData();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    RegionsData.prototype.getRegion = function (latLng) {
        if (!this.regions) {
            return undefined;
        }
        var region = this.findRegionByLatLng(latLng, false);
        return region;
    };
    RegionsData.prototype.getCloserRegion = function (latLng) {
        if (!this.regions) {
            return undefined;
        }
        var region = this.findRegionByLatLng(latLng, true);
        return region;
    };
    RegionsData.prototype.requireRegions = function () {
        return this.regionsPromise.then(function () {
            return Promise.resolve();
        });
    };
    /**
     * latLng.isNull() should be false
     */
    RegionsData.prototype.getCloserRegionP = function (latLng) {
        var _this = this;
        return this.regionsPromise.then(function (regionsMap) {
            return _this.findRegionByLatLng(latLng, true);
        });
    };
    /**
     * latLng.isNull() should be false
     */
    RegionsData.prototype.getRegionP = function (latLng) {
        var _this = this;
        return this.regionsPromise.then(function (regionsMap) {
            var region = _this.findRegionByLatLng(latLng, false);
            return region ? region : undefined;
        });
    };
    /**
     * If approximate === true result will not be undefined.
     */
    RegionsData.prototype.findRegionByLatLng = function (latLng, approximate) {
        if (this.cachedRegion && this.cachedRegion.contains(latLng)) {
            return this.cachedRegion;
        }
        var closerRegion;
        for (var _i = 0, _a = this.regionList; _i < _a.length; _i++) {
            var region = _a[_i];
            if (!closerRegion || LocationUtil.distanceInMetres(latLng, region.bounds.getCenter())
                < LocationUtil.distanceInMetres(latLng, closerRegion.bounds.getCenter())) {
                closerRegion = region;
            }
            // console.log(JSON.stringify(latLng) + " to " + region.name + " " + JSON.stringify(region.bounds.getCenter()) + " " + ": " + LocationUtil.distanceInMetres(latLng, region.bounds.getCenter()));
            // console.log(JSON.stringify(latLng) + " to " + closerRegion.name + " " + JSON.stringify(closerRegion.bounds.getCenter()) + " " + ": " + LocationUtil.distanceInMetres(latLng, closerRegion.bounds.getCenter()));
            if (region.contains(latLng)) {
                this.cachedRegion = region;
                return region;
            }
        }
        return approximate ? closerRegion : undefined;
    };
    RegionsData.prototype.getRegionByName = function (name) {
        return this.regions.get(name);
    };
    RegionsData.prototype.getRegionByNameP = function (name) {
        return this.regionsPromise.then(function (regionsMap) {
            return regionsMap.get(name);
        });
    };
    RegionsData.prototype.getModeIdentifierP = function (id) {
        var _this = this;
        return this.regionsPromise.then(function () {
            var modeIdentifier = _this.getModeIdentifier(id);
            return modeIdentifier;
        });
    };
    RegionsData.prototype.getModeIdentifier = function (id) {
        return this._modes.get(id);
    };
    return RegionsData;
}());
export default RegionsData;
//# sourceMappingURL=RegionsData.js.map