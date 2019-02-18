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
import LeafletMap from "./LeafletMap";
var MboxMap = /** @class */ (function (_super) {
    __extends(MboxMap, _super);
    function MboxMap(containerId) {
        var _this = this;
        require('mapbox.js/theme/style.css');
        var mapbox = require('mapbox.js').mapbox;
        mapbox.accessToken = "pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA";
        _this = _super.call(this, mapbox.map(containerId, "mapbox.streets")) || this;
        return _this;
    }
    return MboxMap;
}(LeafletMap));
export default MboxMap;
//# sourceMappingURL=MboxMap.js.map