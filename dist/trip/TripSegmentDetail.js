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
import DateTimeUtil from "../util/DateTimeUtil";
import TransportUtil from "./TransportUtil";
import "./TripSegmentDetail.css";
import TripSegmentSteps from "./TripSegmentSteps";
import { default as SegmentDescription } from "./SegmentDescription";
var TripSegmentDetail = /** @class */ (function (_super) {
    __extends(TripSegmentDetail, _super);
    function TripSegmentDetail() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TripSegmentDetail.prototype.render = function () {
        var segment = this.props.value;
        var startTime = DateTimeUtil.momentTZTime(segment.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        var modeInfo = segment.modeInfo;
        var transportColor = TransportUtil.getTransportColor(modeInfo);
        transportColor = transportColor !== null ? transportColor : "black";
        var prevSegment = segment.isFirst() ? null :
            this.props.value.arrival ? segment.trip.segments[segment.trip.segments.length - 1] :
                segment.trip.segments[segment.trip.segments.indexOf(segment) - 1];
        var prevTransportColor = prevSegment ? TransportUtil.getTransportColor(prevSegment.modeInfo) : null;
        prevTransportColor = prevTransportColor !== null ? prevTransportColor : "black";
        var fromAddress = segment.from.address;
        var stops = null;
        if (segment.shapes) {
            stops = [];
            for (var _i = 0, _a = segment.shapes; _i < _a.length; _i++) {
                var shape = _a[_i];
                if (shape.travelled && shape.stops) {
                    stops = stops.concat(shape.stops);
                }
            }
        }
        if (stops) {
            stops = stops.slice(1, stops.length - 1); // remove the first and last stop.
        }
        var renderDescr = this.props.renderDescr ? this.props.renderDescr :
            function (props) { return React.createElement(SegmentDescription, __assign({}, props)); };
        return (React.createElement("div", { className: "TripSegmentDetail gl-flex gl-column", tabIndex: 0 },
            React.createElement("div", { className: "gl-flex gl-align-center gl-align-stretch" },
                React.createElement("div", { className: "TripSegmentDetail-timePanel gl-flex" }, startTime),
                React.createElement("div", { className: "TripSegmentDetail-circlePanel gl-flex gl-center gl-align-center gl-column gl-no-shrink", "aria-label": "at" },
                    React.createElement("div", { className: "TripSegmentDetail-line TripSegmentDetail-preStopLine gl-grow", style: {
                            borderColor: prevTransportColor,
                        } }),
                    React.createElement("div", { className: "TripSegmentDetail-circle", style: { borderColor: transportColor } }),
                    React.createElement("div", { className: "TripSegmentDetail-line TripSegmentDetail-postStopLine gl-grow", style: {
                            borderColor: transportColor,
                        } })),
                this.props.renderTitle ? this.props.renderTitle({ value: this.props.value }) :
                    React.createElement("div", { className: "TripSegmentDetail-title gl-flex gl-align-center gl-grow" }, fromAddress)),
            !this.props.value.arrival ?
                React.createElement("div", null,
                    React.createElement("div", { className: "gl-flex" },
                        React.createElement("div", { className: "TripSegmentDetail-iconPanel gl-flex gl-center gl-align-center" }, this.props.renderIcon ? this.props.renderIcon({ value: segment }) :
                            React.createElement("img", { src: TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, false), className: "TripSegmentDetail-icon", "aria-hidden": true })),
                        React.createElement("div", { className: "TripSegmentDetail-linePanel gl-flex gl-center" },
                            React.createElement("div", { className: "TripSegmentDetail-line", style: {
                                    borderColor: transportColor,
                                } })),
                        renderDescr({ value: this.props.value })),
                    stops !== null && stops.length > 0 ?
                        React.createElement(TripSegmentSteps, { steps: stops, toggleLabel: function (open) { return (open ? "Hide " : "Show ") + stops.length + " stops"; }, leftLabel: function (step) { return step.departure ? DateTimeUtil.momentTZTime(step.departure * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) : ""; }, rightLabel: function (step) { return step.name; }, borderColor: transportColor }) : null,
                    segment.streets !== null ?
                        React.createElement(TripSegmentSteps, { steps: segment.streets, toggleLabel: function (open) { return (open ? "Hide " : "Show ") + "directions"; }, leftLabel: function (step) { return step.metres !== null ? TransportUtil.distanceToBriefString(step.metres) : ""; }, rightLabel: function (step) { return step.cyclingNetwork ? step.cyclingNetwork :
                                (step.name ? step.name :
                                    (segment.isWalking() ? "Walk" :
                                        (segment.isBicycle() ? "Ride" : segment.isWheelchair() ? "Wheel" : ""))); }, borderColor: transportColor }) : null)
                :
                    null,
            !this.props.value.arrival ?
                React.createElement("div", { className: "gl-flex" },
                    React.createElement("div", { className: "TripSegmentDetail-iconPanel" }),
                    React.createElement("div", { className: "TripSegmentDetail-linePanel gl-flex gl-center" },
                        React.createElement("div", { className: "TripSegmentDetail-line", style: { borderColor: transportColor } })),
                    React.createElement("div", { className: "TripSegmentDetail-descrPanel" })) : null));
    };
    return TripSegmentDetail;
}(React.Component));
export default TripSegmentDetail;
//# sourceMappingURL=TripSegmentDetail.js.map