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
import "./SegmentPopup.css";
import StopsData from "../data/StopsData";
import DateTimeUtil from "../util/DateTimeUtil";
import RegionsData from "../data/RegionsData";
var SegmentPopup = /** @class */ (function (_super) {
    __extends(SegmentPopup, _super);
    function SegmentPopup(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    SegmentPopup.prototype.render = function () {
        var _this = this;
        var segment = this.props.segment;
        var title = segment.arrival ? "Arrive to " + segment.to.getDisplayString() + " at " + DateTimeUtil.momentTZTime(segment.endTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) : segment.getAction();
        var subtitle = !segment.arrival ?
            (segment.isFirst() ? "To " + segment.to.getDisplayString() : "From " + segment.from.getDisplayString()) : undefined;
        return (React.createElement("div", { className: "SegmentPopup" },
            React.createElement("div", { className: "SegmentPopup-title gl-overflow-ellipsis" }, title),
            React.createElement("div", { className: "SegmentPopup-subtitle" }, subtitle),
            this.state.interchangeUrl ?
                React.createElement("div", { className: "SegmentPopup-link gl-link", onClick: function () { return window.open(_this.state.interchangeUrl, '_blank'); } }, "View stop map") :
                null));
    };
    SegmentPopup.prototype.componentDidMount = function () {
        var _this = this;
        if (this.props.segment.isPT() && this.props.segment.stopCode !== null) {
            RegionsData.instance.getRegionP(this.props.segment.from).then(function (region) {
                StopsData.instance.getStopFromCode(region.name, _this.props.segment.stopCode)
                    .then(function (stopLocation) {
                    if (stopLocation.url) {
                        _this.setState({ interchangeUrl: stopLocation.url });
                    }
                });
            });
        }
    };
    return SegmentPopup;
}(React.Component));
export default SegmentPopup;
//# sourceMappingURL=SegmentPopup.js.map