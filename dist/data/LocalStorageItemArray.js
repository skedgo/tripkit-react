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
import LocalStorageItem from "./LocalStorageItem";
import { JsonConvert } from "json2typescript";
var LocalStorageItemArray = /** @class */ (function (_super) {
    __extends(LocalStorageItemArray, _super);
    function LocalStorageItemArray(elemClassRef, localStorageKey) {
        var _this = _super.call(this, Array, localStorageKey) || this;
        _this.elemClassRef = elemClassRef;
        return _this;
    }
    LocalStorageItemArray.prototype.deserialize = function (itemJson) {
        var jsonConvert = new JsonConvert();
        return jsonConvert.deserializeArray(itemJson, this.elemClassRef);
    };
    LocalStorageItemArray.prototype.add = function (elem) {
        var favourites = this.get();
        var foundFavIndex = favourites.findIndex(function (e) { return elem.equals(e); });
        if (foundFavIndex !== -1) {
            favourites.splice(foundFavIndex, 1);
        }
        favourites.unshift(elem);
        this.save(favourites);
    };
    LocalStorageItemArray.prototype.remove = function (elem) {
        var favourites = this.get();
        var foundFavIndex = favourites.findIndex(function (e) { return elem.equals(e); });
        if (foundFavIndex !== -1) {
            favourites.splice(foundFavIndex, 1);
        }
        this.save(favourites);
    };
    LocalStorageItemArray.prototype.has = function (elem) {
        var favourites = this.get();
        var foundFavIndex = favourites.findIndex(function (e) { return elem.equals(e); });
        return foundFavIndex !== -1;
    };
    return LocalStorageItemArray;
}(LocalStorageItem));
export default LocalStorageItemArray;
//# sourceMappingURL=LocalStorageItemArray.js.map