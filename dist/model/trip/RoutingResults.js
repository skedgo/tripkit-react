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
import TripGroup from "./TripGroup";
var RoutingResults = /** @class */ (function () {
    function RoutingResults() {
        this._region = "";
        this._regions = [];
        this._segmentTemplates = [];
        this._groups = [];
        this.templatesMap = null;
    }
    Object.defineProperty(RoutingResults.prototype, "region", {
        get: function () {
            return this._region;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoutingResults.prototype, "regions", {
        get: function () {
            return this._regions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoutingResults.prototype, "segmentTemplates", {
        get: function () {
            return this._segmentTemplates;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoutingResults.prototype, "groups", {
        get: function () {
            if (this.templatesMap === null) {
                this.postProcess();
            }
            return this._groups;
        },
        enumerable: true,
        configurable: true
    });
    // This method mutate trip group objects, but it's not a problem since it's done just once and before using
    // them in the react system.
    RoutingResults.prototype.postProcess = function () {
        this.templatesMap = new Map();
        for (var _i = 0, _a = this.segmentTemplates; _i < _a.length; _i++) {
            var template = _a[_i];
            this.templatesMap.set(template.hashCode, template);
        }
        for (var _b = 0, _c = this.groups; _b < _c.length; _b++) {
            var group = _c[_b];
            group.trips.sort(function (t1, t2) {
                return t1.weightedScore - t2.weightedScore;
            });
            for (var _d = 0, _e = group.trips; _d < _e.length; _d++) {
                var trip = _e[_d];
                for (var _f = 0, _g = trip.segments; _f < _g.length; _f++) {
                    var segment = _g[_f];
                    Object.assign(segment, this.templatesMap.get(segment.segmentTemplateHashCode));
                    segment.trip = trip;
                    if (segment.isFirst()) {
                        segment.from.address = this.query.from.address;
                    }
                    if (segment.isLast()) {
                        segment.to.address = this.query.to.address;
                    }
                }
                trip.satappQuery = this.satappQuery;
            }
            group.setSelected(0);
        }
    };
    RoutingResults.prototype.setQuery = function (query) {
        this.query = query;
    };
    RoutingResults.prototype.setSatappQuery = function (satappQuery) {
        this.satappQuery = satappQuery;
    };
    __decorate([
        JsonProperty('region', String),
        __metadata("design:type", String)
    ], RoutingResults.prototype, "_region", void 0);
    __decorate([
        JsonProperty('regions', [String]),
        __metadata("design:type", Array)
    ], RoutingResults.prototype, "_regions", void 0);
    __decorate([
        JsonProperty('segmentTemplates', [SegmentTemplate], true),
        __metadata("design:type", Array)
    ], RoutingResults.prototype, "_segmentTemplates", void 0);
    __decorate([
        JsonProperty('groups', [TripGroup], true),
        __metadata("design:type", Array)
    ], RoutingResults.prototype, "_groups", void 0);
    RoutingResults = __decorate([
        JsonObject
    ], RoutingResults);
    return RoutingResults;
}());
export default RoutingResults;
//# sourceMappingURL=RoutingResults.js.map