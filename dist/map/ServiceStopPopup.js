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
import "./ServiceStopPopup.css";
import StopsData from "../data/StopsData";
import RegionsData from "../data/RegionsData";
var ServiceStopPopup = /** @class */ (function (_super) {
    __extends(ServiceStopPopup, _super);
    function ServiceStopPopup(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        return _this;
    }
    ServiceStopPopup.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "ServiceStopPopup" },
            React.createElement("div", { className: "ServiceStopPopup-name" }, this.props.stop.name),
            this.state.interchangeUrl ?
                React.createElement("div", { className: "ServiceStopPopup-link gl-link", onClick: function () { return window.open(_this.state.interchangeUrl, '_blank'); } }, "View stop map") :
                null));
    };
    ServiceStopPopup.prototype.componentDidMount = function () {
        var _this = this;
        RegionsData.instance.getRegionP(this.props.segment.from).then(function (region) {
            StopsData.instance.getStopFromCode(region.name, _this.props.stop.code)
                .then(function (stopLocation) {
                if (stopLocation.url) {
                    _this.setState({ interchangeUrl: stopLocation.url });
                }
            });
        });
    };
    return ServiceStopPopup;
}(React.Component));
export default ServiceStopPopup;
//# sourceMappingURL=ServiceStopPopup.js.map