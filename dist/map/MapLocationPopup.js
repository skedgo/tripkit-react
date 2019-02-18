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
import BikePodLocation from "../model/location/BikePodLocation";
import "./MapLocationPopup.css";
var MapLocationPopup = /** @class */ (function (_super) {
    __extends(MapLocationPopup, _super);
    function MapLocationPopup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MapLocationPopup.prototype.render = function () {
        var link = this.props.value instanceof BikePodLocation ? "https://airbike.network/#download" : undefined;
        return (React.createElement("div", { className: "MapLocationPopup" },
            React.createElement("div", null, this.props.value.name),
            link ?
                React.createElement("a", { href: link, target: "_blank", className: "gl-link" }, "real-time info") : null));
    };
    return MapLocationPopup;
}(React.Component));
export default MapLocationPopup;
//# sourceMappingURL=MapLocationPopup.js.map