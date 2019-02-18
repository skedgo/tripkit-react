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
var SegmentDescription = /** @class */ (function (_super) {
    __extends(SegmentDescription, _super);
    function SegmentDescription() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SegmentDescription.prototype.render = function () {
        var segment = this.props.value;
        return (React.createElement("div", { className: "TripSegmentDetail-descrPanel" },
            React.createElement("div", { className: "TripSegmentDetail-subTitle" }, segment.getAction()),
            React.createElement("div", { className: "TripSegmentDetail-notes text" }, segment.getNotes().map(function (note, i) {
                return React.createElement("div", { key: i }, note);
            }))));
    };
    return SegmentDescription;
}(React.Component));
export default SegmentDescription;
//# sourceMappingURL=SegmentDescription.js.map