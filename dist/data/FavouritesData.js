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
import FavouriteTrip from "../model/FavouriteTrip";
import LocalStorageItemArray from "./LocalStorageItemArray";
import Util from "../util/Util";
import Location from "../model/Location";
var FavouritesData = /** @class */ (function (_super) {
    __extends(FavouritesData, _super);
    function FavouritesData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FavouritesData, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new FavouritesData(FavouriteTrip, "FAVOURITES");
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FavouritesData, "recInstance", {
        get: function () {
            if (!this._recInstance) {
                this._recInstance = new FavouritesData(FavouriteTrip, "RECENT");
            }
            return this._recInstance;
        },
        enumerable: true,
        configurable: true
    });
    FavouritesData.prototype.add = function (elem) {
        if (elem.from.isCurrLoc()) {
            elem = Util.iAssign(elem, { from: Location.createCurrLoc() });
        }
        if (elem.to.isCurrLoc()) {
            elem = Util.iAssign(elem, { to: Location.createCurrLoc() });
        }
        _super.prototype.add.call(this, elem);
    };
    // private static getTestFavourites(): FavouriteTrip[] {
    //     return [
    //         FavouriteTrip.create(
    //             Location.create(LatLng.createLatLng(-33.8674899, 151.2048442), "Test loc 1", "lalala", ""),
    //             Location.create(LatLng.createLatLng(-33.9, 151.1), "Test loc 2", "lalala2", "")
    //         ),
    //         FavouriteTrip.create(
    //             Location.create(LatLng.createLatLng(-33.8674899, 151.2048442), "Test loc 1", "lalala", ""),
    //             Location.create(LatLng.createLatLng(-33.9, 151.1), "Test loc 2", "lalala2", "")
    //         )
    //     ];
    // }
    FavouritesData.getFavOptionsPart = function (options) {
        var favPart = Object.assign({}, options);
        delete favPart._mapLayers;
        return favPart;
    };
    return FavouritesData;
}(LocalStorageItemArray));
export default FavouritesData;
//# sourceMappingURL=FavouritesData.js.map