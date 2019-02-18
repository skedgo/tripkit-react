import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Environment from "../env/Environment";
import iplocation from "iplocation";
var GeolocationData = /** @class */ (function () {
    function GeolocationData() {
    }
    Object.defineProperty(GeolocationData, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new GeolocationData();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    GeolocationData.prototype.requestCurrentLocationGMaps = function () {
        return fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=" + Environment.GMAPS_API_KEY, {
            method: 'post'
        })
            .then(NetworkUtil.jsonCallback)
            .then(function (jsonData) {
            return Promise.resolve(LatLng.createLatLng(jsonData.location.lat, jsonData.location.lng));
        });
    };
    GeolocationData.prototype.requestIPLocation = function () {
        return iplocation('0.0.0.0', ["https://ipapi.co/json/"]).then(function (res) {
            // console.log(JSON.stringify(res));
            return LatLng.createLatLng(res.latitude, res.longitude);
        });
    };
    GeolocationData.prototype.requestCurrentLocationHTML5 = function () {
        return new Promise(function (resolve, reject) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (result) {
                    return resolve(LatLng.createLatLng(result.coords.latitude, result.coords.longitude));
                }, function (error) {
                    return reject(error);
                });
            }
        });
    };
    GeolocationData.prototype.requestCurrentLocation = function (dontAskUser) {
        if (dontAskUser) {
            return this.requestIPLocation();
            // return this.requestCurrentLocationGMaps();
        }
        return this.requestCurrentLocationHTML5();
    };
    return GeolocationData;
}());
export default GeolocationData;
//# sourceMappingURL=GeolocationData.js.map