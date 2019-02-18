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
import "./TripRow.css";
import TripAltBtn from "./TripAltBtn";
import TripRowTime from "./TripRowTime";
import TripRowTrack from "./TripRowTrack";
import { default as TrackTransport } from "./TrackTransport";
import { TRIP_ALT_PICKED_EVENT } from "./TripRowProps";
var TripRow = /** @class */ (function (_super) {
    __extends(TripRow, _super);
    function TripRow(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            showDetails: false
        };
        return _this;
    }
    TripRow.prototype.focus = function () {
        this.ref.focus();
    };
    TripRow.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "TripRow" + (this.props.className ? " " + this.props.className : ""), onClick: this.props.onClick, tabIndex: 0, onFocus: this.props.onFocus, onKeyDown: this.props.onKeyDown, ref: function (el) { return _this.ref = el; } },
            React.createElement("div", { className: "TripRow-body" },
                React.createElement(TripRowTime, { value: this.props.value, brief: this.props.brief }),
                React.createElement(TripRowTrack, { value: this.props.value, renderTransport: function (props) { return React.createElement(TrackTransport, __assign({}, props)); } })),
            React.createElement("div", { className: "TripRow-footer gl-flex gl-align-center gl-space-between" },
                React.createElement(TripAltBtn, { value: this.props.value, onChange: function (value) {
                        if (_this.props.eventBus) {
                            _this.props.eventBus.emit(TRIP_ALT_PICKED_EVENT, _this.props.value, value);
                        }
                    }, renderTrip: function (props) { return React.createElement(TripRow, __assign({}, props)); } }))));
    };
    return TripRow;
}(React.Component));
export default TripRow;
//# sourceMappingURL=TripRow.js.map