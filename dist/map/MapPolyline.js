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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from "react";
import { Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
var MapPolyline = /** @class */ (function (_super) {
    __extends(MapPolyline, _super);
    function MapPolyline() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MapPolyline.prototype.render = function () {
        var _this = this;
        var segment = this.props.segment;
        var polylineOptions = this.props.polylineOptions(segment);
        var polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]);
        var polylineArray = polylineOptionsArray
            .map(function (options, i) { return React.createElement(Polyline, __assign({}, options, { key: "polyline-" + segment.trip.getKey() + "-" + i })); });
        var stopMarkers = [];
        if (segment.shapes) {
            var _loop_1 = function (shape) {
                if (shape.stops) {
                    var stops = shape.stops.slice(1, shape.stops.length - 1);
                    stopMarkers.push(stops.map(function (stop, iStop) {
                        var element = _this.props.renderServiceStop({
                            stop: stop,
                            shape: shape,
                            segment: _this.props.segment
                        });
                        var iconHTML = element ? renderToStaticMarkup(element) : undefined;
                        if (!iconHTML) {
                            return undefined;
                        }
                        var stopIcon = L.divIcon({
                            html: iconHTML,
                            className: "MapPolyline-stop"
                        });
                        return React.createElement(Marker, { icon: stopIcon, position: stop, key: "stop-" + iStop },
                            React.createElement(Popup, { className: "ServiceStopPopup-popup", closeButton: false }, _this.props.renderServiceStopPopup({
                                stop: stop,
                                shape: shape,
                                segment: segment
                            })));
                    }));
                }
            };
            for (var _i = 0, _a = segment.shapes; _i < _a.length; _i++) {
                var shape = _a[_i];
                _loop_1(shape);
            }
        }
        return [polylineArray, stopMarkers];
    };
    return MapPolyline;
}(React.Component));
export default MapPolyline;
//# sourceMappingURL=MapPolyline.js.map