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
import TripGroup from "../model/trip/TripGroup";
import * as React from "react";
import Tooltip from "rc-tooltip";
import TripAlternativesView from "./TripAlternativesView";
var TripAltBtn = /** @class */ (function (_super) {
    __extends(TripAltBtn, _super);
    function TripAltBtn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TripAltBtn.prototype.render = function () {
        var _this = this;
        return this.props.value instanceof TripGroup && this.props.value.trips.length > 1 &&
            React.createElement(Tooltip, { placement: "right", overlay: React.createElement(TripAlternativesView, { value: this.props.value, onChange: this.props.onChange, renderTrip: this.props.renderTrip, ref: function (el) { return _this.altTripsRef = el; } }), overlayClassName: "app-style TripRow-altTooltip", mouseEnterDelay: .5, trigger: ["click"], onVisibleChange: function (visible) {
                    setTimeout(function () {
                        if (visible) {
                            _this.altTripsRef.focus();
                        }
                    }, 500);
                } },
                React.createElement("button", { className: "gl-link gl-charSpace" }, "Alternatives"));
    };
    return TripAltBtn;
}(React.Component));
export default TripAltBtn;
//# sourceMappingURL=TripAltBtn.js.map