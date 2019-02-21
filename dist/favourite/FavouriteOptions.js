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
import OptionsView from "../options/OptionsView";
import RegionsData from "../data/RegionsData";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TransportUtil from "../trip/TransportUtil";
import "./FavouriteOptions.css";
import Constants from "../util/Constants";
import { SchoolGeocoder } from "../index";
var FavouriteOptions = /** @class */ (function (_super) {
    __extends(FavouriteOptions, _super);
    function FavouriteOptions(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    FavouriteOptions.prototype.render = function () {
        var _this = this;
        var options = this.props.favourite.options;
        return this.state.region ?
            React.createElement("div", { className: "FavouriteOptions", "aria-hidden": true },
                OptionsView.getOptionsModeIds(this.state.region)
                    .filter(function (mode) {
                    return options.isModeEnabled(mode.identifier) ||
                        (mode.identifier === ModeIdentifier.SCHOOLBUS_ID &&
                            (_this.props.favourite.from.source === SchoolGeocoder.SOURCE_ID || _this.props.favourite.to.source === SchoolGeocoder.SOURCE_ID));
                })
                    .map(function (modeId, index) {
                    var circleBg = modeId.icon === null;
                    var circleBorder = !circleBg;
                    var onDark = !modeId.identifier.includes(ModeIdentifier.SCHOOLBUS_ID); // TODO: Hardcoded for TC
                    var transportColor = TransportUtil.getTransportColorByIconS(TransportUtil.modeIdToIconS(modeId.identifier));
                    // const circleBg = false;
                    // const circleBorder = false;
                    // const onDark = false; // TODO: Hardcoded for TC
                    return React.createElement("img", { src: TransportUtil.getTransportIconModeId(modeId, false, onDark), className: "FavouriteOptions-icon " + (circleBg ? " FavouriteOptions-onDark" : ""), style: {
                            backgroundColor: circleBg ? (transportColor !== null ? transportColor : "black") : "none",
                            border: circleBorder ? "1px solid " + (transportColor !== null ? transportColor : "black") : "none",
                        }, key: index });
                }),
                options.wheelchair ?
                    React.createElement("img", { src: Constants.absUrl("/images/modeicons/ic-wheelchair.svg"), className: "FavouriteOptions-icon FavouriteOptions-onDark gl-charSpace", style: {
                            border: "1px solid grey"
                        } }) : null,
                options.bikeRacks ?
                    React.createElement("img", { src: Constants.absUrl("/images/modeicons/ic-bikeRack.svg"), className: "gl-charSpace FavouriteOptions-iconSize" }) : null) : null;
    };
    FavouriteOptions.prototype.componentDidMount = function () {
        var _this = this;
        var referenceLoc = this.props.favourite.from.isResolved() ? this.props.favourite.from :
            (this.props.favourite.to.isResolved() ? this.props.favourite.to : undefined);
        if (referenceLoc) {
            RegionsData.instance.getRegionP(referenceLoc)
                .then(function (region) {
                _this.setState({ region: region });
            });
        }
    };
    return FavouriteOptions;
}(React.Component));
export default FavouriteOptions;
//# sourceMappingURL=FavouriteOptions.js.map