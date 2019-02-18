import L from "leaflet";
import LeafletMap from "./MboxMap";
import StopsData from "../data/StopsData";
import LatLng from "../model/LatLng";
import { Visibility } from "../model/trip/SegmentTemplate";
var SegmentPolyline = /** @class */ (function () {
    function SegmentPolyline(segment, showNotTravelled, dragEndHandler) {
        if (showNotTravelled === void 0) { showNotTravelled = false; }
        this.polylines = [];
        this.stops = [];
        this.map = null;
        this.segment = segment;
        this.showNotTravelled = showNotTravelled;
        this.dragEndHandler = dragEndHandler;
        if (segment.shapes !== null) {
            this.createServiceShapes();
        }
        else if (segment.streets !== null) {
            this.createStreets();
        }
        this.createPin(segment);
    }
    SegmentPolyline.prototype.createServiceShapes = function () {
        var _this = this;
        var shapes = this.segment.shapes;
        for (var _i = 0, _a = shapes; _i < _a.length; _i++) {
            var shape = _a[_i];
            if (!this.showNotTravelled && !shape.travelled) {
                continue;
            }
            var options = {
                weight: 6,
                color: shape.travelled ? this.segment.getColor() : "grey",
                opacity: shape.travelled ? 1 : .5
            };
            this.polylines.push(L.polyline(shape.waypoints, options));
            var stops = shape.stops;
            if (stops != null) {
                stops = stops.slice(1, this.stops.length - 1);
                var _loop_1 = function (stop_1) {
                    var stopIcon = L.divIcon({
                        html: LeafletMap.generateServiceStopSVGMarkup(shape.travelled ?
                            this_1.segment.getColor() : "grey", shape.travelled ? 1 : .5),
                        className: "SegmentPolyline-stop"
                    });
                    var stopOptions = {
                        icon: stopIcon
                    };
                    var marker = L.marker(stop_1, stopOptions);
                    this_1.stops.push(marker);
                    var containerId = "serviceStop-" + stop_1.code;
                    marker.bindPopup(LeafletMap.createDivWithId(containerId), {
                        minWidth: 213,
                        closeButton: false,
                        className: "ServiceStopPopup-popup"
                    });
                    marker.on('popupopen', function (popup) {
                        LeafletMap.renderServiceStopPopup(stop_1, containerId, _this.segment.getColor());
                        StopsData.instance.getStopFromCode("AU_ACT_Canberra", stop_1.code)
                            .then(function (stopLocation) {
                            if (stopLocation.url !== null) {
                                LeafletMap.renderServiceStopPopup(stop_1, containerId, _this.segment.getColor(), stopLocation.url);
                            }
                        });
                    });
                };
                var this_1 = this;
                for (var _b = 0, stops_1 = stops; _b < stops_1.length; _b++) {
                    var stop_1 = stops_1[_b];
                    _loop_1(stop_1);
                }
            }
        }
    };
    SegmentPolyline.prototype.createStreets = function () {
        var streets = this.segment.streets;
        for (var _i = 0, _a = streets; _i < _a.length; _i++) {
            var street = _a[_i];
            var options = {
                weight: 6,
                color: this.segment.getColor(),
                dashArray: this.segment.isWalking() ? "5,10" : undefined,
                // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                opacity: 1 // Disable safe distinction for now
            };
            this.polylines.push(L.polyline(street.waypoints, options));
        }
    };
    SegmentPolyline.prototype.createPin = function (segment) {
        var _this = this;
        var transIconHTML = LeafletMap.generatePinSVGMarkup(segment);
        var icon = L.divIcon({
            html: transIconHTML,
            className: "SegmentPinIcon-parent" + (segment.isFirst(Visibility.IN_SUMMARY) ? " firstSegment" : (segment.arrival ? " arriveSegment" : "")),
            iconSize: [35, 35],
            iconAnchor: [17, 35]
        });
        this.pin = L.marker(segment.from, { icon: icon, draggable: this.dragEndHandler !== undefined, riseOnHover: segment.isFirst(Visibility.IN_SUMMARY) });
        if (this.dragEndHandler !== undefined) {
            this.pin.on('dragend', function (e) {
                var latLng = e.target.getLatLng();
                _this.dragEndHandler(LatLng.createLatLng(latLng.lat, latLng.lng));
            });
        }
        this.createSegmentPopup(segment, this.pin);
    };
    SegmentPolyline.prototype.createSegmentPopup = function (segment, marker) {
        var _this = this;
        var containerId = "segmentPopup-" + segment.getKey();
        marker.bindPopup(LeafletMap.createDivWithId(containerId), {
            minWidth: 200,
            closeButton: false,
            className: "ServiceStopPopup-popup",
            offset: [0, -25]
        });
        marker.on('popupopen', function (popup) {
            LeafletMap.renderSegmentPopup(_this.segment, containerId);
            if (segment.isPT() && segment.stopCode !== null) {
                StopsData.instance.getStopFromCode("AU_ACT_Canberra", segment.stopCode)
                    .then(function (stopLocation) {
                    _this.segment.stop = stopLocation;
                    LeafletMap.renderSegmentPopup(_this.segment, containerId);
                });
            }
        });
    };
    SegmentPolyline.prototype.addTo = function (map) {
        this.map = map;
        for (var _i = 0, _a = this.polylines; _i < _a.length; _i++) {
            var polyline_1 = _a[_i];
            polyline_1.addTo(map);
        }
        for (var _b = 0, _c = this.stops; _b < _c.length; _b++) {
            var stop_2 = _c[_b];
            stop_2.addTo(map);
        }
        this.pin.addTo(this.map);
    };
    SegmentPolyline.prototype.removeFromMap = function () {
        if (this.map !== null) {
            for (var _i = 0, _a = this.polylines; _i < _a.length; _i++) {
                var polyline_2 = _a[_i];
                this.map.removeLayer(polyline_2);
            }
            for (var _b = 0, _c = this.stops; _b < _c.length; _b++) {
                var stop_3 = _c[_b];
                this.map.removeLayer(stop_3);
            }
            this.map.removeLayer(this.pin);
        }
    };
    return SegmentPolyline;
}());
export default SegmentPolyline;
//# sourceMappingURL=SegmentPolyline.js.map