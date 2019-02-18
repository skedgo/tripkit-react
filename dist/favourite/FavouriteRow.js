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
import './FavouriteRow.css';
import IconAngleRight from "-!svg-react-loader!../images/ic-angle-right.svg";
import FavouriteBtn from "./FavouriteBtn";
import LocationUtil from "../util/LocationUtil";
import FavouriteOptions from "./FavouriteOptions";
var FavouriteRow = /** @class */ (function (_super) {
    __extends(FavouriteRow, _super);
    function FavouriteRow(props) {
        return _super.call(this, props) || this;
    }
    FavouriteRow.prototype.focus = function () {
        this.ref.focus();
    };
    FavouriteRow.prototype.render = function () {
        var _this = this;
        var from = this.props.favourite.from;
        var to = this.props.favourite.to;
        return (React.createElement("div", { className: "FavouriteRow gl-flex gl-column", tabIndex: 0, onFocus: this.props.onFocus, onKeyDown: this.props.onKeyDown, "aria-label": "From " + LocationUtil.getMainText(from) + " to " + LocationUtil.getMainText(to), ref: function (el) { return _this.ref = el; } },
            React.createElement("button", { className: "FavouriteRow-summaryPanel gl-flex gl-align-center gl-space-between", "aria-label": "Compute trips", onClick: this.props.onClick },
                React.createElement("div", { className: "FavouriteRow-fromToPanel gl-flex gl-column" },
                    React.createElement("div", { className: "FavouriteRow-addFirst gl-overflow-ellipsis" }, LocationUtil.getMainText(from)),
                    React.createElement("div", { className: "FavouriteRow-addSecond gl-overflow-ellipsis", "aria-hidden": true }, LocationUtil.getSecondaryText(from))),
                React.createElement(IconAngleRight, { className: "FavouriteRow-iconAngle", "aria-label": "to", focusable: "false" }),
                React.createElement("div", { className: "FavouriteRow-fromToPanel gl-flex gl-column" },
                    React.createElement("div", { className: "FavouriteRow-addFirst gl-overflow-ellipsis" }, LocationUtil.getMainText(to)),
                    React.createElement("div", { className: "FavouriteRow-addSecond gl-overflow-ellipsis", "aria-hidden": true }, LocationUtil.getSecondaryText(to)))),
            React.createElement("div", { className: "FavouriteRow-actionPanel gl-flex gl-space-between gl-align-center" },
                React.createElement(FavouriteBtn, { favourite: this.props.favourite }),
                this.props.favourite.options ?
                    React.createElement(FavouriteOptions, { favourite: this.props.favourite }) : null)));
    };
    return FavouriteRow;
}(React.Component));
export default FavouriteRow;
//# sourceMappingURL=FavouriteRow.js.map