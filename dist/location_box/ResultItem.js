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
import React, { Component } from "react";
import './ResultItem.css';
import IconCurrLoc from '-!svg-react-loader!../images/ic-curr-loc.svg';
import LocationUtil from "../util/LocationUtil";
import Environment from "../env/Environment";
import SkedgoGeocoder from "../geocode/SkedgoGeocoder";
var ResultItem = /** @class */ (function (_super) {
    __extends(ResultItem, _super);
    function ResultItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ResultItem.prototype.render = function () {
        var addressComponent;
        if (this.props.location.suggestion
            && this.props.location.suggestion.structured_formatting) { // Google result
            var mainAddressComponent = void 0;
            var structuredFormatting = this.props.location.suggestion.structured_formatting;
            var mainText = structuredFormatting.main_text;
            var matchedSubstrings = structuredFormatting.main_text_matched_substrings;
            var offset = 0;
            var mainAddressComponents = [];
            for (var _i = 0, matchedSubstrings_1 = matchedSubstrings; _i < matchedSubstrings_1.length; _i++) {
                var matchedSubstring = matchedSubstrings_1[_i];
                var substrOffset = matchedSubstring.offset;
                var substrLength = matchedSubstring.length;
                if (offset < substrOffset) {
                    mainAddressComponents.push(React.createElement("span", { key: offset }, mainText.substr(offset, substrOffset)));
                }
                mainAddressComponents.push(React.createElement("span", { key: substrOffset, className: "ResultItem-matchingSubstr" }, mainText.substr(substrOffset, substrLength)));
                offset = substrOffset + substrLength;
            }
            mainAddressComponents.push(React.createElement("span", { key: offset }, mainText.substr(offset, mainText.length)));
            mainAddressComponent = React.createElement("span", { key: 1, className: "ResultItem-mainAddress" }, mainAddressComponents);
            addressComponent = React.createElement("span", { className: "ResultItem-address" },
                " ",
                [
                    mainAddressComponent,
                    React.createElement("span", { key: 2, className: "ResultItem-secondaryAddress" }, structuredFormatting.secondary_text)
                ]);
        }
        else {
            addressComponent =
                React.createElement("span", { className: "ResultItem-address" },
                    (Environment.isDevAnd(this.props.location.source === SkedgoGeocoder.SOURCE_ID && false) ? "*SG*" : "") +
                        LocationUtil.getMainText(this.props.location),
                    React.createElement("span", { key: 2, className: "ResultItem-secondaryAddress" }, LocationUtil.getSecondaryText(this.props.location)));
        }
        return (React.createElement("div", { key: this.props.key, style: { background: this.props.highlighted ? '#efeded' : 'white' }, className: "gl-flex gl-space-between ResultItem" + (this.props.location.isCurrLoc() ? " currLoc" : ""), onClick: this.props.onClick, role: "option", id: this.props.id, "aria-selected": this.props.ariaSelected },
            addressComponent,
            this.props.location.isCurrLoc() ? React.createElement(IconCurrLoc, { "aria-hidden": true, focusable: "false" }) : "",
            this.props.location.icon ?
                React.createElement("img", { src: this.props.location.icon, className: "ResultItem-icon" }) : ""));
    };
    return ResultItem;
}(Component));
export default ResultItem;
//# sourceMappingURL=ResultItem.js.map