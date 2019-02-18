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
import "./TripAlternativesView.css";
import Util from "../util/Util";
var TripAlternativesView = /** @class */ (function (_super) {
    __extends(TripAlternativesView, _super);
    function TripAlternativesView(props) {
        var _this = _super.call(this, props) || this;
        _this.rowRefs = [];
        _this.onKeyDown = _this.onKeyDown.bind(_this);
        return _this;
    }
    TripAlternativesView.prototype.focus = function () {
        this.ref.focus();
    };
    TripAlternativesView.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "TripAlternativesView gl-flex", ref: function (el) { return _this.ref = el; }, tabIndex: 0, "aria-label": "Trip alternatives list. Browse through alternatives using tab key, and press return to pick alternative." },
            React.createElement("div", { className: "gl-scrollable-y gl-grow" }, this.props.value.trips.map(function (trip, i) {
                return _this.props.renderTrip({ value: trip,
                    brief: true,
                    className: "TripAlternativesView-tripRow" + (trip === _this.props.value.getSelectedTrip() ? " selected" : ""),
                    onClick: function () {
                        return _this.onSelected(i);
                    },
                    onKeyDown: function (e) { return _this.onKeyDown(e, i); },
                    key: i + trip.getKey(),
                    ref: function (el) { return _this.rowRefs[i] = el; }
                });
            }))));
    };
    TripAlternativesView.prototype.onKeyDown = function (e, targetI) {
        if (e.keyCode === 13) {
            this.onSelected(targetI);
            return;
        }
        if (e.keyCode === 38 || e.keyCode === 40) {
            var nextIndex = this.nextIndex(targetI, e.keyCode === 38);
            this.rowRefs[nextIndex].focus();
        }
    };
    TripAlternativesView.prototype.nextIndex = function (i, prev) {
        return (i + (prev ? -1 : 1) + this.props.value.trips.length) % this.props.value.trips.length;
    };
    TripAlternativesView.prototype.onSelected = function (i) {
        var update = Util.clone(this.props.value);
        update.setSelected(i);
        return this.props.onChange(update);
    };
    return TripAlternativesView;
}(React.Component));
export default TripAlternativesView;
//# sourceMappingURL=TripAlternativesView.js.map