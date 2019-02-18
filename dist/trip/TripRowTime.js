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
import DateTimeUtil from "../util/DateTimeUtil";
var TripRowTime = /** @class */ (function (_super) {
    __extends(TripRowTime, _super);
    function TripRowTime() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TripRowTime.prototype.render = function () {
        var trip = this.props.value;
        var depart = trip.depart;
        var arrive = trip.arrive;
        var departMoment = DateTimeUtil.momentTZTime(depart * 1000);
        var queryMoment = trip.queryTime ? DateTimeUtil.momentTZTime(trip.queryTime * 1000) : undefined;
        var departureTime = departMoment.format(DateTimeUtil.TIME_FORMAT_TRIP);
        if (this.props.brief && queryMoment && queryMoment.format("ddd D") !== departMoment.format("ddd D")) {
            departureTime = departMoment.format("ddd D") + ", " + departureTime;
        }
        var arrivalTime = DateTimeUtil.momentTZTime(arrive * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        // Truncates to minutes before subtract to display a duration in minutes that is consistent with
        // departure and arrival times, which are also truncated to minutes.
        var durationInMinutes = Math.floor(arrive / 60) - Math.floor(depart / 60);
        var duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
        var hasPT = trip.hasPublicTransport();
        return (React.createElement("div", null, (hasPT ?
            React.createElement("div", null,
                React.createElement("span", { className: "h5-text" },
                    React.createElement("span", null, departureTime),
                    " ",
                    React.createElement("span", null, "-"),
                    " ",
                    React.createElement("span", null, arrivalTime)),
                React.createElement("span", { className: "text gl-charSpaceLeft" },
                    "(",
                    duration,
                    ")"))
            :
                React.createElement("div", null,
                    React.createElement("span", { className: "h5-text" }, duration),
                    React.createElement("span", { className: "text gl-charSpaceLeft" },
                        "(",
                        trip.queryIsLeaveAfter ? "arrive " + arrivalTime : "depart " + departureTime,
                        ")")))));
    };
    return TripRowTime;
}(React.Component));
export default TripRowTime;
//# sourceMappingURL=TripRowTime.js.map