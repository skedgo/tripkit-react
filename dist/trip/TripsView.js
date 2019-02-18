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
import { TRIP_ALT_PICKED_EVENT } from "./ITripRowProps";
import "./TripsView.css";
import IconSpin from '-!svg-react-loader!../images/ic-loading2.svg';
var TripsView = /** @class */ (function (_super) {
    __extends(TripsView, _super);
    function TripsView(props) {
        var _this = _super.call(this, props) || this;
        _this.rowRefs = [];
        if (_this.props.eventBus) {
            _this.props.eventBus.addListener(TRIP_ALT_PICKED_EVENT, function (orig, update) {
                setTimeout(function () {
                    var updatedTripIndex = _this.props.values.indexOf(update);
                    if (updatedTripIndex !== -1) {
                        _this.rowRefs[updatedTripIndex].focus();
                    }
                }, 100);
            });
        }
        _this.onKeyDown = _this.onKeyDown.bind(_this);
        return _this;
    }
    TripsView.prototype.onKeyDown = function (e) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            var selectedI = this.props.value ? this.props.values.indexOf(this.props.value) : 0;
            if (this.props.onChange) {
                var nextIndex = this.nextIndex(selectedI, e.keyCode === 38);
                this.props.onChange(this.props.values[nextIndex]);
                this.rowRefs[nextIndex].focus();
            }
        }
    };
    TripsView.prototype.nextIndex = function (i, prev) {
        return (i + (prev ? -1 : 1) + this.props.values.length) % this.props.values.length;
    };
    TripsView.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "TripsView gl-flex gl-column" + (this.props.className ? " " + this.props.className : "") },
            this.props.values.map(function (trip, index) {
                return _this.props.renderTrip({ value: trip,
                    className: trip === _this.props.value ? "selected" : undefined,
                    onClick: _this.props.onChange ? function () { return _this.props.onChange(trip); } : undefined,
                    onFocus: _this.props.onChange ? function () { return _this.props.onChange(trip); } : undefined,
                    onKeyDown: _this.onKeyDown,
                    eventBus: _this.props.eventBus,
                    key: index + trip.getKey(),
                    ref: function (el) { return _this.rowRefs[index] = el; }
                });
            }),
            this.props.waiting ?
                React.createElement(IconSpin, { className: "TripsView-iconLoading sg-animate-spin gl-align-self-center", focusable: "false" }) : null));
    };
    TripsView.prototype.componentDidUpdate = function (prevProps) {
        if (!prevProps.value && this.props.value) {
            this.rowRefs[this.props.values.indexOf(this.props.value)].focus();
        }
    };
    TripsView.sortTrips = function (trips) {
        return trips.slice().sort(function (t1, t2) {
            return t1.weightedScore - t2.weightedScore;
        });
    };
    return TripsView;
}(React.Component));
export default TripsView;
//# sourceMappingURL=TripsView.js.map