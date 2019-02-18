import LocationsResult from "../model/location/LocationsResult";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import { JsonConvert } from "json2typescript";
import { EventEmitter } from "fbemitter";
import MapUtil from "../util/MapUtil";
var LocationsData = /** @class */ (function () {
    function LocationsData() {
        this.cellToLocResult = new Map();
        this.eventEmitter = new EventEmitter();
    }
    Object.defineProperty(LocationsData, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new LocationsData();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    LocationsData.prototype.addChangeListener = function (callback) {
        this.eventEmitter.addListener('change', callback);
    };
    LocationsData.prototype.fireChangeEvent = function (locData) {
        this.eventEmitter.emit('change', locData);
    };
    LocationsData.prototype.requestLocations = function (region, level, bounds) {
        var _this = this;
        var cachedResults = new LocationsResult(level);
        var cellIDs = level === 1 ? [region] : MapUtil.cellsForBounds(bounds, LocationsData.cellsPerDegree);
        var requestCells = [];
        for (var _i = 0, cellIDs_1 = cellIDs; _i < cellIDs_1.length; _i++) {
            var cellID = cellIDs_1[_i];
            var cellResults = this.cellToLocResult.get(cellID);
            if (cellResults) {
                cachedResults.add(cellResults);
            }
            else {
                requestCells.push(cellID);
                // To register we are awaiting for cellID stops, avoiding requesting again the same cellID in the meanwhile.
                this.cellToLocResult.set(cellID, new LocationsResult(level));
            }
        }
        if (!cachedResults.isEmpty()) {
            this.fireChangeEvent(cachedResults);
        }
        if (requestCells.length === 0) {
            return;
        }
        var locationsReq = {
            region: region,
            level: level,
            cellIDs: level === 2 ? requestCells : undefined,
            cellsPerDegree: level === 2 ? 75 : undefined,
            // modes: ["pt_pub", "cy_bic", "cy_bic-s_ACT", "cy_bic-s", "me_car"]
            modes: ["cy_bic", "cy_bic-s_ACT", "cy_bic-s", "me_car"]
        };
        TripGoApi.apiCall("locations.json", NetworkUtil.MethodType.POST, locationsReq)
            .then(function (groupsJson) {
            var jsonConvert = new JsonConvert();
            var groups = groupsJson.groups.map(function (group) { return jsonConvert.deserialize(group, LocationsResult); });
            var result = new LocationsResult(level);
            for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
                var group = groups_1[_i];
                _this.cellToLocResult.set(group.key, group);
                result.add(group);
            }
            _this.fireChangeEvent(result);
        });
    };
    LocationsData.cellsPerDegree = 75;
    return LocationsData;
}());
export default LocationsData;
//# sourceMappingURL=LocationsData.js.map