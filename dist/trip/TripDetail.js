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
import "./TripDetail.css";
import { default as TripSegmentDetail } from "./TripSegmentDetail";
var TripDetail = /** @class */ (function (_super) {
    __extends(TripDetail, _super);
    function TripDetail() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TripDetail.prototype.render = function () {
        var segments = this.props.value.segments;
        var renderSegmentDetail = this.props.renderSegmentDetail ? this.props.renderSegmentDetail :
            function (props) { return React.createElement(TripSegmentDetail, __assign({}, props)); };
        return (React.createElement("div", { className: "TripDetail", style: this.props.style },
            segments.map(function (segment, index) {
                return renderSegmentDetail({ value: segment, key: index });
            }),
            renderSegmentDetail({ value: this.props.value.arrivalSegment, key: segments.length })));
    };
    return TripDetail;
}(React.Component));
export default TripDetail;
//# sourceMappingURL=TripDetail.js.map