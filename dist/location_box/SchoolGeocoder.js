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
import StaticGeocoder from "./StaticGeocoder";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TransportUtil from "../trip/TransportUtil";
var SchoolGeocoder = /** @class */ (function (_super) {
    __extends(SchoolGeocoder, _super);
    function SchoolGeocoder() {
        var _this = _super.call(this) || this;
        _this.schoolToBusLinesData = [];
        var schoolsJsonData = require("../data/json/schools.json");
        _this.schoolsRequest = Promise.resolve(schoolsJsonData)
            .then(function (schoolsJson) {
            var schools = [];
            for (var _i = 0, _a = schoolsJson.schoolData; _i < _a.length; _i++) {
                var schoolJson = _a[_i];
                schools.push(Location.create(LatLng.createLatLng(Number(schoolJson.lat), Number(schoolJson.lng)), schoolJson.schoolName, schoolJson.schoolID, schoolJson.schoolName, SchoolGeocoder.SOURCE_ID, TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(ModeIdentifier.SCHOOLBUS_ID))));
            }
            _this.setValues(schools);
            for (var _b = 0, _c = schoolsJson.busData; _b < _c.length; _b++) {
                var busesInterval = _c[_b];
                _this.schoolToBusLinesData.push({
                    validFrom: Number(busesInterval.validFrom) * 1000,
                    validTo: Number(busesInterval.validTo) * 1000,
                    schoolIdToBusLines: _this.buildSchoolIdToBusLines(busesInterval.buses)
                });
            }
            return schoolsJson;
        });
        return _this;
    }
    SchoolGeocoder.prototype.getSourceId = function () {
        return SchoolGeocoder.SOURCE_ID;
    };
    Object.defineProperty(SchoolGeocoder, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new SchoolGeocoder();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    SchoolGeocoder.prototype.geocode = function (query, autocomplete, bounds, focus, callback) {
        _super.prototype.geocode.call(this, query, autocomplete, bounds, focus, function (results) { return callback(results.slice(0, 3)); });
    };
    SchoolGeocoder.prototype.buildSchoolIdToBusLines = function (busesJson) {
        var result = new Map();
        for (var _i = 0, busesJson_1 = busesJson; _i < busesJson_1.length; _i++) {
            var busJson = busesJson_1[_i];
            for (var _a = 0, _b = busJson.schools; _a < _b.length; _a++) {
                var school = _b[_a];
                var busLines = result.get(school);
                if (!busLines) {
                    busLines = [];
                    result.set(school, busLines);
                }
                busLines.push(busJson.busLine);
            }
        }
        return result;
    };
    SchoolGeocoder.prototype.getSchoolsDataP = function () {
        return this.schoolsRequest;
    };
    SchoolGeocoder.prototype.getBusesForSchoolId = function (schoolId, time) {
        for (var _i = 0, _a = this.schoolToBusLinesData; _i < _a.length; _i++) {
            var data = _a[_i];
            if (data.validFrom <= time && time <= data.validTo) {
                return data.schoolIdToBusLines.get(schoolId);
            }
        }
        return undefined;
    };
    SchoolGeocoder.SOURCE_ID = "ACT_SCHOOLS";
    return SchoolGeocoder;
}(StaticGeocoder));
export default SchoolGeocoder;
//# sourceMappingURL=SchoolGeocoder.js.map