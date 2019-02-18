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
import "./FavouriteBtn.css";
import FavouritesData from "../data/FavouritesData";
import IconAdd from "-!svg-react-loader!../images/ic-star-outline.svg";
import IconRemove from "-!svg-react-loader!../images/ic-star-filled.svg";
import OptionsData from "../data/OptionsData";
import Options from "../model/Options";
var FavouriteBtn = /** @class */ (function (_super) {
    __extends(FavouriteBtn, _super);
    function FavouriteBtn(props) {
        return _super.call(this, props) || this;
    }
    FavouriteBtn.prototype.render = function () {
        var _this = this;
        var exists = this.props.favourite !== null && FavouritesData.instance.has(this.props.favourite);
        return (this.props.favourite !== null ?
            React.createElement("button", { className: "FavouriteBtn-main gl-link gl-flex gl-align-center", "aria-label": "Add to favourites", "aria-pressed": exists, onClick: function () {
                    if (_this.props.favourite === null) {
                        return;
                    }
                    if (exists) {
                        FavouritesData.instance.remove(_this.props.favourite);
                    }
                    else {
                        _this.props.favourite.options = Object.assign(new Options(), FavouritesData.getFavOptionsPart(OptionsData.instance.get()));
                        FavouritesData.instance.add(_this.props.favourite);
                    }
                } },
                exists ?
                    React.createElement(IconRemove, { className: "FavouriteBtn-iconStar FavouriteBtn-iconStar-remove", "aria-hidden": true, focusable: "false" }) :
                    React.createElement(IconAdd, { className: "FavouriteBtn-iconStar FavouriteBtn-iconStar-add", "aria-hidden": true, focusable: "false" }),
                exists ? "Remove favourite" : "Add to favourites")
            :
                null);
    };
    FavouriteBtn.prototype.componentDidMount = function () {
        var _this = this;
        FavouritesData.instance.addChangeListener(function () { return _this.forceUpdate(); });
    };
    return FavouriteBtn;
}(React.Component));
export default FavouriteBtn;
//# sourceMappingURL=FavouriteBtn.js.map