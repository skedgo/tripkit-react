import { LatLng as LLatLng } from "leaflet";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import L from "leaflet";
import inside from "point-in-polygon";
var LeafletUtil = /** @class */ (function () {
    function LeafletUtil() {
    }
    LeafletUtil.toLatLng = function (llatLng) {
        return LatLng.createLatLng(llatLng.lat, llatLng.lng);
    };
    LeafletUtil.fromLatLng = function (latLng) {
        return new LLatLng(latLng.lat, latLng.lng);
    };
    LeafletUtil.toBBox = function (bounds) {
        return BBox.createBBoxArray([this.toLatLng(bounds.getNorthEast()), this.toLatLng(bounds.getSouthWest())]);
    };
    LeafletUtil.fromBBox = function (bbox) {
        return L.latLngBounds(this.fromLatLng(bbox.sw), this.fromLatLng(bbox.ne));
    };
    LeafletUtil.getTripBounds = function (trip) {
        var bounds = L.latLngBounds([]);
        for (var _i = 0, _a = trip.segments; _i < _a.length; _i++) {
            var segment = _a[_i];
            var segmentBounds = this.getSegmentBounds(segment);
            bounds.extend(segmentBounds.getNorthEast())
                .extend(segmentBounds.getSouthWest());
        }
        return bounds;
    };
    LeafletUtil.getSegmentBounds = function (segment) {
        var bounds = L.latLngBounds([]);
        bounds.extend(segment.from).extend(segment.to);
        if (segment.streets) {
            for (var _i = 0, _a = segment.streets; _i < _a.length; _i++) {
                var street = _a[_i];
                if (street.waypoints) {
                    for (var _b = 0, _c = street.waypoints; _b < _c.length; _b++) {
                        var waypoint = _c[_b];
                        bounds.extend(waypoint);
                    }
                }
            }
        }
        if (segment.shapes) {
            for (var _d = 0, _e = segment.shapes; _d < _e.length; _d++) {
                var shape = _e[_d];
                if (shape.travelled && shape.waypoints) {
                    for (var _f = 0, _g = shape.waypoints; _f < _g.length; _f++) {
                        var waypoint = _g[_f];
                        bounds.extend(waypoint);
                    }
                }
            }
        }
        return bounds;
    };
    LeafletUtil.decodePolyline = function (encoded) {
        var polyline = require('@mapbox/polyline');
        var pointsArray = polyline.decode(encoded);
        var decoded = [];
        for (var _i = 0, pointsArray_1 = pointsArray; _i < pointsArray_1.length; _i++) {
            var point = pointsArray_1[_i];
            decoded.push(LatLng.createLatLng(point[0], point[1]));
        }
        return decoded;
    };
    LeafletUtil.pointInPolygon = function (point, polygon) {
        return inside([point.lat, point.lng], polygon.map(function (polyPoint) { return [polyPoint.lat, polyPoint.lng]; }));
    };
    return LeafletUtil;
}());
export default LeafletUtil;
//# sourceMappingURL=LeafletUtil.js.map