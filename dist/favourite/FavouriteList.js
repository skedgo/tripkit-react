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
import './FavouriteList.css';
import FavouriteRow from "./FavouriteRow";
import FavouritesData from "../data/FavouritesData";
import IconAddFav from "-!svg-react-loader!../images/ic-star-outline.svg";
var FavouriteList = /** @class */ (function (_super) {
    __extends(FavouriteList, _super);
    function FavouriteList(props) {
        var _this = _super.call(this, props) || this;
        _this.rowRefs = [];
        _this.focused = -1;
        _this.state = {
            values: [],
            showAllClicked: false
        };
        _this.data = props.recent ? FavouritesData.recInstance : FavouritesData.instance;
        _this.onKeyDown = _this.onKeyDown.bind(_this);
        return _this;
    }
    FavouriteList.prototype.onKeyDown = function (e) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            var nextIndex = this.nextIndex(this.focused, e.keyCode === 38);
            this.rowRefs[nextIndex].focus();
        }
    };
    FavouriteList.prototype.nextIndex = function (i, prev) {
        var displayN = this.getDisplayN();
        return (i + (prev ? -1 : 1) + displayN) % displayN;
    };
    FavouriteList.prototype.render = function () {
        var _this = this;
        var values = this.state.values;
        var showUpTo = this.getShowUpTo();
        var displayN = this.getDisplayN();
        var valueClickedHandler = this.props.onValueClicked;
        if (this.props.hideWhenEmpty && values.length === 0) {
            return null;
        }
        return (React.createElement("div", { className: this.props.className, tabIndex: this.props.title ? 0 : -1, "aria-label": this.props.title },
            this.props.title ?
                React.createElement("div", { className: "FavouriteList-lastJourneyTitle gl-flex gl-justify-start gl-align-self-start" }, this.props.title) :
                null,
            values.length === 0 ?
                (!this.props.recent ?
                    React.createElement("div", { className: "FavouriteList-info-panel gl-flex gl-grow gl-align-center" },
                        React.createElement("div", { className: "FavouriteList-favourites-info" },
                            "Use the Journey Planner to see your favourite journeys here, by clicking",
                            React.createElement(IconAddFav, { className: "gl-charSpace gl-charSpaceLeft", "aria-hidden": true, focusable: "false" }),
                            "to add to favourites."))
                    :
                        React.createElement("div", { className: "FavouriteList-info-panel gl-flex gl-grow gl-align-center" },
                            React.createElement("div", { className: "FavouriteList-favourites-info" }, "Use the Journey Planner to see your recent journeys here.")))
                :
                    React.createElement("div", { className: "gl-flex gl-grow" },
                        React.createElement("div", { className: "FavouriteList-container gl-flex gl-column gl-grow" },
                            this.state.values.slice(0, displayN).map(function (favourite, i) {
                                return React.createElement(FavouriteRow, { key: favourite.getKey(), recent: _this.props.recent, favourite: favourite, onClick: valueClickedHandler ? function () { return valueClickedHandler(favourite); } : undefined, ref: function (el) { return _this.rowRefs[i] = el; }, onFocus: function () { return _this.focused = i; }, onKeyDown: _this.onKeyDown });
                            }),
                            this.props.previewMax &&
                                Math.min(values.length, showUpTo) > this.props.previewMax ?
                                React.createElement("button", { className: "gl-no-shrink" + (this.props.moreBtnClass ? " " + this.props.moreBtnClass : ""), onClick: function () { return _this.setState({ showAllClicked: !_this.state.showAllClicked }); } }, this.state.showAllClicked ? "Less" : "More") : null))));
    };
    FavouriteList.prototype.getDisplayN = function () {
        return Math.min(this.getShowUpTo(), this.props.previewMax === undefined || this.state.showAllClicked ?
            this.state.values.length : Math.min(this.props.previewMax, this.state.values.length));
    };
    FavouriteList.prototype.getShowUpTo = function () {
        return this.props.showMax ? this.props.showMax : Number.MAX_VALUE;
    };
    FavouriteList.prototype.componentDidMount = function () {
        var _this = this;
        this.setState({ values: this.data.get() });
        this.favChangeSubscr = this.data.addChangeListener(function (favourites) { return _this.setState({
            values: favourites
        }); });
    };
    FavouriteList.prototype.componentWillUnmount = function () {
        this.favChangeSubscr.remove();
    };
    return FavouriteList;
}(React.Component));
export default FavouriteList;
//# sourceMappingURL=FavouriteList.js.map