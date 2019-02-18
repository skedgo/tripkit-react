import LatLng from "./LatLng";
import L from "leaflet";
var BBox = /** @class */ (function () {
    /**
     * Empty constructor, necessary for Util.clone
     */
    function BBox() {
        // Avoid empty error
    }
    BBox.createBBox = function (ne, sw) {
        var instance = new BBox();
        instance._ne = ne;
        instance._sw = sw;
        return instance;
    };
    BBox.createBBoxArray = function (latLngs) {
        var lfBBox = L.latLngBounds(latLngs);
        var lfne = lfBBox.getNorthEast();
        var lfsw = lfBBox.getSouthWest();
        return BBox.createBBox(LatLng.createLatLng(lfne.lat, lfne.lng), LatLng.createLatLng(lfsw.lat, lfsw.lng));
    };
    Object.defineProperty(BBox.prototype, "ne", {
        get: function () {
            return this._ne;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "sw", {
        get: function () {
            return this._sw;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "minLat", {
        get: function () {
            return Math.min(this.ne.lat, this.sw.lat);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "maxLat", {
        get: function () {
            return Math.max(this.ne.lat, this.sw.lat);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "minLng", {
        get: function () {
            return Math.min(this.ne.lng, this.sw.lng);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "maxLng", {
        get: function () {
            return Math.max(this.ne.lng, this.sw.lng);
        },
        enumerable: true,
        configurable: true
    });
    BBox.prototype.getCenter = function () {
        return LatLng.createLatLng((this.ne.lat + this.sw.lat) / 2, (this.ne.lng + this.sw.lng) / 2);
    };
    return BBox;
}());
export default BBox;
//# sourceMappingURL=BBox.js.map