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
import "./SegmentPinIcon.css";
import IconPinHead from "-!svg-react-loader!../images/ic-map-pin-head.svg";
import IconPinHeadPointer from "-!svg-react-loader!../images/ic-map-pin-head-pointer.svg";
import iconPinBase from "../images/ic-map-pin-base.png";
import Constants from "../util/Constants";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
var SegmentPinIcon = /** @class */ (function (_super) {
    __extends(SegmentPinIcon, _super);
    function SegmentPinIcon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SegmentPinIcon.prototype.render = function () {
        var segment = this.props.segment;
        var modeInfo = segment.modeInfo;
        var rotation = segment.travelDirection ? segment.travelDirection - 90 : undefined;
        var PinHead = rotation ? IconPinHeadPointer : IconPinHead;
        // On dark background if there is a suitable remote icon for dark background, or there is not
        // remote icon for light background, so will use a local icon for dark background.
        var onDark = segment.arrival || (!modeInfo.remoteIcon && modeInfo.remoteDarkIcon !== undefined);
        var transIcon = segment.arrival ? Constants.absUrl("/images/modeicons/ondark/ic-arrive-24px.svg") :
            TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, onDark);
        var timeS = DateTimeUtil.momentTZTime(segment.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        return (React.createElement("div", { className: "gl-flex gl-column gl-align-center" },
            React.createElement("div", null,
                React.createElement(PinHead, { className: "SegmentPinIcon-pin", style: rotation ?
                        {
                            transform: "rotate(" + rotation + "deg)",
                            WebkitTransform: "rotate(" + rotation + "deg)",
                            MsTransform: "rotate(" + rotation + "deg)",
                            MozTransform: "rotate(" + rotation + "deg)"
                        } : undefined, focusable: "false" }),
                React.createElement("img", { src: transIcon, className: "SegmentPinIcon-transport" }),
                React.createElement("div", { className: "SegmentPinIcon-timeLabel" }, timeS)),
            React.createElement("img", { src: iconPinBase, className: "SegmentPinIcon-base" })));
    };
    return SegmentPinIcon;
}(React.Component));
export default SegmentPinIcon;
//# sourceMappingURL=SegmentPinIcon.js.map