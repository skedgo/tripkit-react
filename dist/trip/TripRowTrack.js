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
import Segment from "../model/trip/Segment";
import IconAngleRight from "-!svg-react-loader!../images/ic-angle-right.svg";
var TripRowTrack = /** @class */ (function (_super) {
    __extends(TripRowTrack, _super);
    function TripRowTrack() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TripRowTrack.prototype.render = function () {
        var brief;
        var nOfSegments = this.props.value.segments.filter(function (segment) { return segment.visibilityType === Segment.Visibility.IN_SUMMARY; }).length;
        if (nOfSegments > 5 || (nOfSegments > 3 && window.innerWidth <= 400)) {
            brief = true;
        }
        else if (nOfSegments < 5) {
            brief = false;
        }
        var TrackTransport = this.props.renderTransport;
        return (React.createElement("div", { className: "TripRow-trackPanel gl-flex gl-align-center" }, this.props.value.segments.reduce(function (accum, segment, i) {
            if (segment.visibilityType === Segment.Visibility.IN_SUMMARY) {
                accum.push(React.createElement(TrackTransport, { segment: segment, brief: brief, key: i }));
                var last = segment.isLast(Segment.Visibility.IN_SUMMARY);
                if (!last) {
                    accum.push(React.createElement(IconAngleRight, { className: "TrackTransport-angleRight" + (brief === false ? " gl-charSpace gl-charSpaceLeft" : ""), role: "img" // Needed to be read by iOS VoiceOver
                        , "aria-label": ", then", focusable: "false", key: i + "icAngleRight" }));
                }
            }
            return accum;
        }, [])));
    };
    return TripRowTrack;
}(React.Component));
export default TripRowTrack;
//# sourceMappingURL=TripRowTrack.js.map