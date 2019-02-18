import LocationUtil from "../util/LocationUtil";
var MapLocationSet = /** @class */ (function () {
    function MapLocationSet(map, locRenderer, popupRenderer) {
        // values: Location[] = [];
        this.valueToMarker = new Map();
        this.showing = true;
        this.map = map;
        this.locRenderer = locRenderer;
        this.popupRenderer = popupRenderer;
    }
    MapLocationSet.prototype.addValues = function (values) {
        var currentValues = Array.from(this.valueToMarker.keys());
        var _loop_1 = function (value) {
            if (currentValues.find(function (currValue) { return LocationUtil.equal(currValue, value); })) {
                return "continue";
            }
            var marker = this_1.locRenderer(value);
            if (this_1.popupRenderer) {
                marker.bindPopup(this_1.popupRenderer(value, marker));
            }
            this_1.valueToMarker.set(value, marker);
            if (this_1.showing) {
                marker.addTo(this_1.map);
            }
        };
        var this_1 = this;
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            _loop_1(value);
        }
    };
    MapLocationSet.prototype.setShow = function (show) {
        if (this.showing === show) {
            return;
        }
        this.showing = show;
        var currentValues = Array.from(this.valueToMarker.keys());
        for (var _i = 0, currentValues_1 = currentValues; _i < currentValues_1.length; _i++) {
            var value = currentValues_1[_i];
            if (show) {
                this.valueToMarker.get(value).addTo(this.map);
            }
            else {
                this.map.removeLayer(this.valueToMarker.get(value));
            }
        }
    };
    return MapLocationSet;
}());
export default MapLocationSet;
//# sourceMappingURL=MapLocationSet.js.map