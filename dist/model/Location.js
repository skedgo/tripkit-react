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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import LatLng from '../model/LatLng';
import Util from "../util/Util";
import { JsonObject, JsonProperty } from "json2typescript";
import { GeocodingSourceConverter } from "../location_box/GeocodingSource";
var Location = /** @class */ (function (_super) {
    __extends(Location, _super);
    /**
     * Empty constructor, necessary for Util.clone
     */
    function Location() {
        var _this = _super.call(this) || this;
        _this._class = '';
        _this._address = '';
        _this._name = '';
        _this._id = '';
        _this._source = undefined;
        return _this;
    }
    Location_1 = Location;
    Location.create = function (latlng, address, id, name, source) {
        var instance = Util.iAssign(new Location_1(), latlng);
        instance._address = address;
        instance._name = name;
        instance._id = id;
        instance._source = source;
        return instance;
    };
    Location.createCurrLoc = function () {
        return this.create(new LatLng(), this.currLocText, "", "");
    };
    Location.prototype.isResolved = function () {
        return !this.isNull();
    };
    Location.prototype.getKey = function () {
        return String(this.lat + this.lng);
    };
    Object.defineProperty(Location.prototype, "class", {
        get: function () {
            return this._class;
        },
        set: function (value) {
            this._class = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Location.prototype, "address", {
        get: function () {
            return this._address;
        },
        set: function (value) {
            this._address = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Location.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Location.prototype, "id", {
        get: function () {
            return this._id;
        },
        set: function (value) {
            this._id = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Location.prototype, "source", {
        get: function () {
            return this._source;
        },
        set: function (value) {
            this._source = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Location.prototype, "suggestion", {
        get: function () {
            return this._suggestion;
        },
        set: function (value) {
            this._suggestion = value;
        },
        enumerable: true,
        configurable: true
    });
    Location.prototype.getDisplayString = function () {
        return this.name ? this.name : (this.address.includes(', ') ? this.address.substr(0, this.address.indexOf(', ')) : this.address);
    };
    Location.prototype.isCurrLoc = function () {
        return this.address === Location_1.currLocText;
    };
    Location.prototype.toJson = function () {
        return {
            lat: this.lat,
            lng: this.lng,
            address: this.address,
            name: this.name
        };
    };
    var Location_1;
    Location.currLocText = "My location";
    __decorate([
        JsonProperty('class', String, true),
        __metadata("design:type", String)
    ], Location.prototype, "_class", void 0);
    __decorate([
        JsonProperty('address', String, true),
        __metadata("design:type", String)
    ], Location.prototype, "_address", void 0);
    __decorate([
        JsonProperty('name', String, true),
        __metadata("design:type", String)
    ], Location.prototype, "_name", void 0);
    __decorate([
        JsonProperty('id', String, true),
        __metadata("design:type", String)
    ], Location.prototype, "_id", void 0);
    __decorate([
        JsonProperty('source', GeocodingSourceConverter, true),
        __metadata("design:type", Object)
    ], Location.prototype, "_source", void 0);
    Location = Location_1 = __decorate([
        JsonObject,
        __metadata("design:paramtypes", [])
    ], Location);
    return Location;
}(LatLng));
export default Location;
//# sourceMappingURL=Location.js.map