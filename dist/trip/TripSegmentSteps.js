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
import IconAngleDown from "-!svg-react-loader!../images/ic-angle-down.svg";
import "./TripSegmentSteps.css";
var TripSegmentSteps = /** @class */ (function (_super) {
    __extends(TripSegmentSteps, _super);
    function TripSegmentSteps(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            open: false,
        };
        _this.id = "trip-segment-steps-" + TripSegmentSteps.count++;
        return _this;
    }
    TripSegmentSteps.prototype.render = function () {
        var _this = this;
        var borderLeftStyle = this.props.dashed ? "dashed" : undefined;
        return (React.createElement("div", null,
            React.createElement("div", { className: "gl-flex" },
                React.createElement("div", { className: "TripSegmentDetail-iconPanel" }),
                React.createElement("div", { className: "TripSegmentDetail-linePanel gl-flex gl-center" },
                    React.createElement("div", { className: "TripSegmentDetail-line", style: {
                            borderColor: this.props.borderColor,
                            borderLeftStyle: borderLeftStyle
                        } })),
                React.createElement("button", { className: "TripSegmentSteps-stopBtn gl-link", onClick: function () { return _this.setState({ open: !_this.state.open }); }, "aria-expanded": this.state.open, "aria-controls": this.id },
                    this.props.toggleLabel(this.state.open),
                    React.createElement(IconAngleDown, { className: "TripSegmentDetail-iconAngleDown" + (this.state.open ? " gl-rotate180" : ""), focusable: "false" }))),
            React.createElement("div", { id: this.id, tabIndex: this.state.open ? 0 : -1 }, this.state.open ?
                this.props.steps.map(function (step, index) {
                    return (React.createElement("div", { className: "gl-flex", key: index },
                        React.createElement("div", { className: "TripSegmentDetail-timePanel gl-flex" }, _this.props.leftLabel ? _this.props.leftLabel(step) : ""),
                        React.createElement("div", { className: "TripSegmentDetail-linePanel gl-flex gl-column gl-center gl-align-center" },
                            React.createElement("div", { className: "TripSegmentDetail-line gl-grow", style: {
                                    borderColor: _this.props.borderColor,
                                    borderLeftStyle: borderLeftStyle
                                } }),
                            React.createElement("div", { className: "TripSegmentDetail-smallCircle", style: { borderColor: _this.props.borderColor } }),
                            React.createElement("div", { className: "TripSegmentDetail-line gl-grow", style: {
                                    borderColor: _this.props.borderColor,
                                    borderLeftStyle: borderLeftStyle
                                } })),
                        React.createElement("div", { className: "TripSegmentDetail-stopTitle" }, _this.props.rightLabel(step))));
                }) : null)));
    };
    TripSegmentSteps.count = 0;
    return TripSegmentSteps;
}(React.Component));
export default TripSegmentSteps;
//# sourceMappingURL=TripSegmentSteps.js.map