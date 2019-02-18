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
import * as React from "react";
import { Marker, Popup } from "react-leaflet";
import MapPolyline from "./MapPolyline";
import { Visibility } from "../model/trip/SegmentTemplate";
import L from "leaflet";
import LatLng from "../model/LatLng";
import { renderToStaticMarkup } from "react-dom/server";
var MapTripSegment = /** @class */ (function (_super) {
    __extends(MapTripSegment, _super);
    function MapTripSegment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MapTripSegment.prototype.render = function () {
        var _this = this;
        var segment = this.props.segment;
        var transIconHTML = renderToStaticMarkup(this.props.renderPinIcon({ segment: this.props.segment }));
        var icon = L.divIcon({
            html: transIconHTML,
            className: "MapTripSegment-icon-container" + (segment.isFirst(Visibility.IN_SUMMARY) ? " firstSegment" : (segment.arrival ? " arriveSegment" : ""))
        });
        return ([
            React.createElement(Marker, { icon: icon, position: segment.from, key: "pin", draggable: this.props.ondragend !== undefined, riseOnHover: segment.isFirst(Visibility.IN_SUMMARY), ondragend: function (event) {
                    if (_this.props.ondragend) {
                        var latLng = event.target.getLatLng();
                        _this.props.ondragend(LatLng.createLatLng(latLng.lat, latLng.lng));
                    }
                } },
                React.createElement(Popup, { className: "MapTripSegment-popup", closeButton: false }, this.props.renderPopup({ segment: segment }))),
            React.createElement(MapPolyline, { segment: segment, key: "map-polyline", polylineOptions: this.props.polylineOptions, renderServiceStop: this.props.renderServiceStop, renderServiceStopPopup: this.props.renderServiceStopPopup })
        ]);
    };
    return MapTripSegment;
}(React.Component));
export default MapTripSegment;
//# sourceMappingURL=MapTripSegment.js.map