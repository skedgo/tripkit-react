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
import TransportUtil from "./TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import "./TrackTransport.css";
var TrackTransport = /** @class */ (function (_super) {
    __extends(TrackTransport, _super);
    function TrackTransport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TrackTransport.prototype.render = function () {
        var segment = this.props.segment;
        var infoTitle = null;
        var infoSubtitle;
        if (segment.isPT()) {
            infoTitle = segment.serviceNumber !== null ? segment.serviceNumber : "";
            infoSubtitle = DateTimeUtil.momentTZTime(segment.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        }
        else if (segment.trip.isSingleSegment() && segment.metres !== null) {
            infoSubtitle = TransportUtil.distanceToBriefString(segment.metres);
        }
        else if (segment.realTime) {
            infoSubtitle = "Live traffic";
        }
        else if (segment.trip.isSingleSegment() && (segment.isWalking() || segment.isWheelchair())) {
            // TODO getDurationWithContinuation
            infoSubtitle = DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
        }
        else {
            // TODO more cases
            infoSubtitle = DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
        }
        var modeInfo = segment.modeInfo;
        return (React.createElement("div", { className: "gl-flex gl-align-center" },
            React.createElement("img", { src: TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, false), alt: modeInfo.alt, role: "img" // Needed to be read by iOS VoiceOver
                , className: "TrackTransport-icon", "aria-label": modeInfo.alt + (infoTitle ? " " + infoTitle : "") + " " + infoSubtitle }),
            this.props.brief ? null :
                React.createElement("div", { className: "TrackTransport-info gl-flex gl-column gl-align-center"
                        + (this.props.brief === false ? " TrackTransport-info-space" : ""), "aria-hidden": true },
                    infoTitle ? React.createElement("div", null, infoTitle) : null,
                    React.createElement("div", null, infoSubtitle))));
    };
    return TrackTransport;
}(React.Component));
export default TrackTransport;
//# sourceMappingURL=TrackTransport.js.map