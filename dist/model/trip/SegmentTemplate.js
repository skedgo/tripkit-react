var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Any, JsonObject, JsonProperty } from "json2typescript";
import Location from "../Location";
import ModeInfo from "./ModeInfo";
import ServiceShape from "./ServiceShape";
import Street from "./Street";
import MapUtil from "../../util/MapUtil";
export var Visibility;
(function (Visibility) {
    Visibility[Visibility["IN_DETAILS"] = 0] = "IN_DETAILS";
    Visibility[Visibility["ON_MAP"] = 1] = "ON_MAP";
    Visibility[Visibility["IN_SUMMARY"] = 2] = "IN_SUMMARY";
    Visibility[Visibility["HIDDEN"] = 3] = "HIDDEN";
    Visibility[Visibility["UNKNOWN"] = 4] = "UNKNOWN";
})(Visibility || (Visibility = {}));
var SegmentTemplate = /** @class */ (function () {
    /**
     * Empty constructor, necessary for Util.clone
     */
    function SegmentTemplate() {
        this._hashCode = 0;
        this._from = new Location();
        this._to = new Location();
        this._modeInfo = null;
        this._modeIdentifier = null;
        this._action = null;
        this._notes = "";
        this._warnings = "";
        this._visibility = null;
        this._type = "";
        this._travelDirection = undefined;
        this._location = new Location();
        this._streets = null;
        this._shapes = null;
        this._stopCode = null;
        this._endStopCode = null;
        this._serviceOperator = "";
        this._operatorID = "";
        this._isContinuation = false;
        this._durationWithoutTraffic = null;
        this._metres = null;
        this._metresSafe = null;
        this._metresUnsafe = null;
        // @Json GWTJsonMini mini;
        this._mini = {};
        this._notesList = null;
        this._arrival = false;
        // Empty constructor
    }
    SegmentTemplate_1 = SegmentTemplate;
    Object.defineProperty(SegmentTemplate.prototype, "hashCode", {
        get: function () {
            return this._hashCode;
        },
        set: function (value) {
            this._hashCode = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "from", {
        get: function () {
            return !this._from.isResolved() ? this._location : this._from;
        },
        set: function (value) {
            this._from = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "to", {
        get: function () {
            return !this._to.isResolved() ? this._location : this._to;
        },
        set: function (value) {
            this._to = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "modeInfo", {
        get: function () {
            return this._modeInfo;
        },
        set: function (value) {
            this._modeInfo = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "modeIdentifier", {
        get: function () {
            return this._modeIdentifier;
        },
        set: function (value) {
            this._modeIdentifier = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "action", {
        get: function () {
            return this._action;
        },
        set: function (value) {
            this._action = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "notes", {
        get: function () {
            return this._notes;
        },
        set: function (value) {
            this._notes = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "warnings", {
        get: function () {
            return this._warnings;
        },
        set: function (value) {
            this._warnings = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "visibility", {
        get: function () {
            return this._visibility;
        },
        set: function (value) {
            this._visibility = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "visibilityType", {
        get: function () {
            if (!this._visibilityType) {
                this._visibilityType = SegmentTemplate_1.fromVisibilityS(this.visibility);
            }
            return this._visibilityType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (value) {
            this._type = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "travelDirection", {
        get: function () {
            if (this.arrival) {
                return undefined;
            }
            return this._travelDirection ? this._travelDirection : 90 - this.getAngleDegrees();
        },
        set: function (value) {
            this._travelDirection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "location", {
        get: function () {
            return this._location;
        },
        set: function (value) {
            this._location = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "streets", {
        get: function () {
            return this._streets;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "shapes", {
        get: function () {
            return this._shapes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "stopCode", {
        get: function () {
            return this._stopCode;
        },
        set: function (value) {
            this._stopCode = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "endStopCode", {
        get: function () {
            return this._endStopCode;
        },
        set: function (value) {
            this._endStopCode = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "serviceOperator", {
        get: function () {
            return this._serviceOperator;
        },
        set: function (value) {
            this._serviceOperator = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "operatorID", {
        get: function () {
            return this._operatorID;
        },
        set: function (value) {
            this._operatorID = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "isContinuation", {
        get: function () {
            return this._isContinuation;
        },
        set: function (value) {
            this._isContinuation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "durationWithoutTraffic", {
        get: function () {
            return this._durationWithoutTraffic;
        },
        set: function (value) {
            this._durationWithoutTraffic = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "metres", {
        get: function () {
            return this._metres;
        },
        set: function (value) {
            this._metres = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "metresSafe", {
        get: function () {
            return this._metresSafe;
        },
        set: function (value) {
            this._metresSafe = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "metresUnsafe", {
        get: function () {
            return this._metresUnsafe;
        },
        set: function (value) {
            this._metresUnsafe = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "mini", {
        get: function () {
            return this._mini;
        },
        set: function (value) {
            this._mini = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "stop", {
        get: function () {
            return this._stop;
        },
        set: function (value) {
            this._stop = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "notesList", {
        get: function () {
            if (this._notesList === null && this.notes) {
                this._notesList = this.notes.split("\n");
            }
            return this._notesList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SegmentTemplate.prototype, "arrival", {
        get: function () {
            return this._arrival;
        },
        set: function (value) {
            this._arrival = value;
        },
        enumerable: true,
        configurable: true
    });
    SegmentTemplate.fromVisibilityS = function (visibilityS) {
        switch (visibilityS) {
            case "in summary":
                return Visibility.IN_SUMMARY;
            case "on map":
                return Visibility.ON_MAP;
            case "in details":
                return Visibility.IN_DETAILS;
            case "hidden":
                return Visibility.HIDDEN;
            default:
                return Visibility.UNKNOWN;
        }
    };
    SegmentTemplate.prototype.getAngleDegrees = function () {
        var latDiff = this.to.lat - this.from.lat;
        var lngDiff = this.to.lng - this.from.lng;
        return MapUtil.toDegrees(Math.atan2(latDiff, lngDiff));
    };
    var SegmentTemplate_1;
    SegmentTemplate.Visibility = Visibility;
    __decorate([
        JsonProperty("hashCode", Number, true),
        __metadata("design:type", Number)
    ], SegmentTemplate.prototype, "_hashCode", void 0);
    __decorate([
        JsonProperty("from", Location, true),
        __metadata("design:type", Location)
    ], SegmentTemplate.prototype, "_from", void 0);
    __decorate([
        JsonProperty("to", Location, true),
        __metadata("design:type", Location)
    ], SegmentTemplate.prototype, "_to", void 0);
    __decorate([
        JsonProperty("modeInfo", ModeInfo, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_modeInfo", void 0);
    __decorate([
        JsonProperty("modeIdentifier", String, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_modeIdentifier", void 0);
    __decorate([
        JsonProperty("action", String, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_action", void 0);
    __decorate([
        JsonProperty("notes", String, true),
        __metadata("design:type", String)
    ], SegmentTemplate.prototype, "_notes", void 0);
    __decorate([
        JsonProperty("warnings", String, true),
        __metadata("design:type", String)
    ], SegmentTemplate.prototype, "_warnings", void 0);
    __decorate([
        JsonProperty("visibility", String, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_visibility", void 0);
    __decorate([
        JsonProperty("type", String, true),
        __metadata("design:type", String)
    ], SegmentTemplate.prototype, "_type", void 0);
    __decorate([
        JsonProperty("travelDirection", Number, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_travelDirection", void 0);
    __decorate([
        JsonProperty("location", Location, true),
        __metadata("design:type", Location)
    ], SegmentTemplate.prototype, "_location", void 0);
    __decorate([
        JsonProperty("streets", [Street], true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_streets", void 0);
    __decorate([
        JsonProperty("shapes", [ServiceShape], true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_shapes", void 0);
    __decorate([
        JsonProperty("stopCode", String, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_stopCode", void 0);
    __decorate([
        JsonProperty("endStopCode", String, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_endStopCode", void 0);
    __decorate([
        JsonProperty("serviceOperator", String, true),
        __metadata("design:type", String)
    ], SegmentTemplate.prototype, "_serviceOperator", void 0);
    __decorate([
        JsonProperty("operatorID", String, true),
        __metadata("design:type", String)
    ], SegmentTemplate.prototype, "_operatorID", void 0);
    __decorate([
        JsonProperty("isContinuation", Boolean, true),
        __metadata("design:type", Boolean)
    ], SegmentTemplate.prototype, "_isContinuation", void 0);
    __decorate([
        JsonProperty("durationWithoutTraffic", Number, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_durationWithoutTraffic", void 0);
    __decorate([
        JsonProperty("metres", Number, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_metres", void 0);
    __decorate([
        JsonProperty("metresSafe", Number, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_metresSafe", void 0);
    __decorate([
        JsonProperty("metresUnsafe", Number, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_metresUnsafe", void 0);
    __decorate([
        JsonProperty("mini", Any, true),
        __metadata("design:type", Object)
    ], SegmentTemplate.prototype, "_mini", void 0);
    SegmentTemplate = SegmentTemplate_1 = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], SegmentTemplate);
    return SegmentTemplate;
}());
export default SegmentTemplate;
//# sourceMappingURL=SegmentTemplate.js.map