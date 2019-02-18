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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { JsonObject, JsonProperty } from "json2typescript";
import SegmentTemplate from "./SegmentTemplate";
import Color from "./Color";
import TransportUtil from "../../trip/TransportUtil";
import DateTimeUtil from "../../util/DateTimeUtil";
import ModeIdentifier from "../region/ModeIdentifier";
import Ticket from "./Ticket";
var Segment = /** @class */ (function (_super) {
    __extends(Segment, _super);
    /**
     * Empty constructor, necessary for Util.clone
     */
    function Segment() {
        var _this = _super.call(this) || this;
        _this._startTime = 0;
        _this._endTime = 0;
        _this._segmentTemplateHashCode = 0;
        _this._serviceTripID = "";
        _this._serviceName = "";
        _this._serviceNumber = null;
        _this._serviceDirection = "";
        _this._serviceColor = null;
        _this._realTime = null;
        _this._isCancelled = null;
        // @Json GWTRealTimeVehicle realtimeVehicle;
        _this._alertHashCodes = [];
        // @Json GWTJsonBooking booking;
        _this._wheelchairAccessible = null;
        _this._bicycleAccessible = null;
        _this._ticket = null;
        return _this;
    }
    Object.defineProperty(Segment.prototype, "startTime", {
        get: function () {
            return this._startTime;
        },
        set: function (value) {
            this._startTime = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "endTime", {
        get: function () {
            return this._endTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "segmentTemplateHashCode", {
        get: function () {
            return this._segmentTemplateHashCode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "serviceTripID", {
        get: function () {
            return this._serviceTripID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "serviceName", {
        get: function () {
            return this._serviceName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "serviceNumber", {
        get: function () {
            return this._serviceNumber;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "serviceDirection", {
        get: function () {
            return this._serviceDirection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "serviceColor", {
        get: function () {
            return this._serviceColor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "realTime", {
        get: function () {
            return this._realTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "isCancelled", {
        get: function () {
            return this._isCancelled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "alertHashCodes", {
        get: function () {
            return this._alertHashCodes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "wheelchairAccessible", {
        get: function () {
            return this._wheelchairAccessible;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "bicycleAccessible", {
        get: function () {
            return this._bicycleAccessible;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "ticket", {
        get: function () {
            return this._ticket;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "trip", {
        get: function () {
            return this._trip;
        },
        set: function (value) {
            this._trip = value;
        },
        enumerable: true,
        configurable: true
    });
    Segment.prototype.isPT = function () {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith("pt");
    };
    Segment.prototype.isWalking = function () {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith("wa_wal");
    };
    Segment.prototype.isWheelchair = function () {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith("wa_whe");
    };
    Segment.prototype.isBicycle = function () {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith("cy_bic");
    };
    Segment.prototype.isSchoolbus = function () {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith(ModeIdentifier.SCHOOLBUS_ID);
    };
    Segment.prototype.isNonTCService = function () {
        return this.isPT()
            && this.serviceOperator.toLowerCase() !== "transport canberra"
            && this.operatorID.toLowerCase() !== "tc"
            && this.operatorID.toLowerCase() !== "cmo";
    };
    Segment.prototype.isFirst = function (visibility) {
        return visibility ?
            this === this.trip.segments.find(function (segment) { return segment.visibilityType === visibility; }) :
            this === this.trip.segments[0];
    };
    Segment.prototype.isLast = function (visibility) {
        return visibility ?
            this === this.trip.segments.slice().reverse().find(function (segment) { return segment.visibilityType === visibility; }) :
            this === this.trip.segments[this.trip.segments.length - 1];
    };
    Segment.prototype.isMyWay = function () {
        return (this.ticket !== null && this.ticket.name.toLowerCase().includes("myway"))
            || this.notes.toLowerCase().includes("myway");
    };
    Segment.prototype.getDuration = function () {
        return this.endTime - this.startTime;
    };
    Segment.prototype.getDurationInMinutes = function () {
        return Math.floor(this.endTime / 60) - Math.floor(this.startTime / 60);
    };
    Segment.prototype.getColor = function () {
        // if (this.serviceColor !== null) {
        //     return this.serviceColor.toRGB();
        // }
        var color;
        if (this.modeInfo) {
            color = TransportUtil.getTransportColor(this.modeInfo);
        }
        return color ? color : "black";
    };
    Segment.prototype.getAction = function () {
        if (this.action !== null) {
            return this.matchAction(this.action);
        }
        return "-----";
    };
    Segment.prototype.matchAction = function (template) {
        var result = template;
        if (result.includes("<NUMBER><TIME>")) {
            result = result.replace("<NUMBER><TIME>", "<NUMBER> at <TIME>");
        }
        if (result.includes("<NUMBER>")) {
            var service = this.serviceNumber !== null ? this.serviceNumber :
                (this.modeInfo !== null ? this.modeInfo.alt : "");
            result = result.replace("<NUMBER>", service);
        }
        if (result.includes("<DURATION>")) {
            var durationInMinutes = Math.floor(this.endTime / 60) - Math.floor(this.startTime / 60);
            var duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
            result = result.replace("<DURATION>", " about " + duration);
        }
        if (result.includes("<TIME>")) {
            var time = DateTimeUtil.momentTZTime(this.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
            result = result.replace("<TIME>", time);
        }
        return result;
    };
    Segment.prototype.getNotes = function () {
        var _this = this;
        var notesList = this.notesList;
        if (notesList) {
            return notesList
                .map(function (note) { return _this.matchNote(note); })
                .filter(function (note) { return !_this.hasTag(note); });
        }
        return [];
    };
    Segment.prototype.hasTag = function (note) {
        return note.includes("<") && note.includes(">");
    };
    Segment.prototype.matchNote = function (note) {
        var result = note.trim();
        if (result.includes("<LINE_NAME>")) {
            result = result.replace("<LINE_NAME>", this.serviceName);
        }
        // if (result.includes("<LOCATIONS>")) {
        //     result = result.replace("<LOCATIONS>", "")
        // }
        if (result.includes("<DURATION>")) {
            if (result.includes("<STOPS>")) { // Don't want to instantiate stops for ACT, so replace whole note with duration.
                return DateTimeUtil.durationToBriefString(this.getDurationInMinutes());
            }
            result = result.replace("<DURATION>", DateTimeUtil.durationToBriefString(this.getDurationInMinutes()));
        }
        if (result.includes("<NUMBER>")) {
            var service = this.serviceNumber ? this.serviceNumber : (this.modeInfo ? this.modeInfo.alt : null);
            if (service) {
                result = result.replace("<NUMBER>", service);
            }
        }
        if (result.includes("<DIRECTION>")) {
            result = result.replace("<DIRECTION>", this.serviceDirection ? "Direction: " + this.serviceDirection : "");
        }
        return result;
    };
    Segment.prototype.getKey = function () {
        return this.from.getKey() + this.to.getKey() + this.segmentTemplateHashCode;
    };
    __decorate([
        JsonProperty("startTime"),
        __metadata("design:type", Number)
    ], Segment.prototype, "_startTime", void 0);
    __decorate([
        JsonProperty("endTime"),
        __metadata("design:type", Number)
    ], Segment.prototype, "_endTime", void 0);
    __decorate([
        JsonProperty("segmentTemplateHashCode"),
        __metadata("design:type", Number)
    ], Segment.prototype, "_segmentTemplateHashCode", void 0);
    __decorate([
        JsonProperty("serviceTripID", String, true),
        __metadata("design:type", String)
    ], Segment.prototype, "_serviceTripID", void 0);
    __decorate([
        JsonProperty("serviceName", String, true),
        __metadata("design:type", String)
    ], Segment.prototype, "_serviceName", void 0);
    __decorate([
        JsonProperty("serviceNumber", String, true),
        __metadata("design:type", Object)
    ], Segment.prototype, "_serviceNumber", void 0);
    __decorate([
        JsonProperty("serviceDirection", String, true),
        __metadata("design:type", String)
    ], Segment.prototype, "_serviceDirection", void 0);
    __decorate([
        JsonProperty("serviceColor", Color, true),
        __metadata("design:type", Object)
    ], Segment.prototype, "_serviceColor", void 0);
    __decorate([
        JsonProperty("realTime", Boolean, true),
        __metadata("design:type", Object)
    ], Segment.prototype, "_realTime", void 0);
    __decorate([
        JsonProperty("isCancelled", Boolean, true),
        __metadata("design:type", Object)
    ], Segment.prototype, "_isCancelled", void 0);
    __decorate([
        JsonProperty("alertHashCodes", [Number], true),
        __metadata("design:type", Array)
    ], Segment.prototype, "_alertHashCodes", void 0);
    __decorate([
        JsonProperty("wheelchairAccessible", Boolean, true),
        __metadata("design:type", Object)
    ], Segment.prototype, "_wheelchairAccessible", void 0);
    __decorate([
        JsonProperty("bicycleAccessible", Boolean, true),
        __metadata("design:type", Object)
    ], Segment.prototype, "_bicycleAccessible", void 0);
    __decorate([
        JsonProperty("ticket", Ticket, true),
        __metadata("design:type", Object)
    ], Segment.prototype, "_ticket", void 0);
    Segment = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], Segment);
    return Segment;
}(SegmentTemplate));
export default Segment;
//# sourceMappingURL=Segment.js.map