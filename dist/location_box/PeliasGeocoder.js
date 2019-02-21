import Location from "../model/Location";
import NetworkUtil from "../util/NetworkUtil";
import GeocodingCache from "./GeocodingCache";
import LatLng from "../model/LatLng";
import Util from "../util/Util";
import GeolocationData from "./GeolocationData";
import GeocoderOptions from "./GeocoderOptions";
var PeliasGeocoder = /** @class */ (function () {
    function PeliasGeocoder(geocodeServer, apiKey) {
        this.geocodeServer = geocodeServer;
        this.apiKey = apiKey;
        this.options = new GeocoderOptions();
        this.cache = new GeocodingCache();
    }
    PeliasGeocoder.prototype.getSourceId = function () {
        return PeliasGeocoder.SOURCE_ID;
    };
    PeliasGeocoder.prototype.getOptions = function () {
        return this.options;
    };
    PeliasGeocoder.prototype.geocode = function (query, autocomplete, bounds, focus, callback) {
        var _this = this;
        var center = focus ? focus : (bounds ? bounds.getCenter() : null);
        if (center !== null) {
            var cachedResults = this.cache.getResults(query, autocomplete, center);
            if (cachedResults !== null) {
                callback(cachedResults.slice(0, 5));
                return;
            }
        }
        var url = this.geocodeServer + "/autocomplete?api_key=" + this.apiKey
            + (bounds ?
                "&boundary.rect.min_lat=" + bounds.minLat +
                    "&boundary.rect.max_lat=" + bounds.maxLat +
                    "&boundary.rect.min_lon=" + bounds.minLng +
                    "&boundary.rect.max_lon=" + bounds.maxLng : "")
            + (focus ? "&focus.point.lat=" + focus.lat + "&focus.point.lon=" + focus.lng : "")
            + "&text=" + query;
        fetch(url, {
            method: NetworkUtil.MethodType.GET
        }).then(NetworkUtil.jsonCallback).then(function (json) {
            var features = json.features;
            var locationResults = !features ? [] : features
                .map(function (result) { return PeliasGeocoder.locationFromAutocompleteResult(result); });
            if (center) {
                _this.cache.addResults(query, autocomplete, center, locationResults);
            }
            callback(locationResults.slice(0, 5));
        }).catch(function (reason) {
            console.log(url + " failed. Reason: " + reason);
            callback([]);
        });
    };
    PeliasGeocoder.prototype.resolve = function (unresolvedLocation, callback) {
        if (unresolvedLocation.isCurrLoc()) {
            GeolocationData.instance.requestCurrentLocation().then(function (latLng) {
                callback(Util.iAssign(unresolvedLocation, latLng));
            });
        }
    };
    PeliasGeocoder.prototype.reverseGeocode = function (coord, callback) {
        var url = this.geocodeServer + "/reverse?api_key=ge-63f76914953caba8" +
            "&point.lat=" + coord.lat + "&point.lon=" + coord.lng;
        fetch(url, {
            method: NetworkUtil.MethodType.GET
        }).then(NetworkUtil.jsonCallback).then(function (json) {
            var features = json.features;
            if (features.length > 0) {
                var geocodedLoc = PeliasGeocoder.locationFromAutocompleteResult(features[0]);
                geocodedLoc.lat = coord.lat;
                geocodedLoc.lng = coord.lng;
                callback(geocodedLoc);
                return;
            }
            callback(null);
        }).catch(function (reason) {
            Location.create(coord, "Location", "", "Location", PeliasGeocoder.SOURCE_ID);
        });
    };
    PeliasGeocoder.locationFromAutocompleteResult = function (result) {
        var id = result.properties !== null ? result.properties.id : "";
        var point = result.geometry;
        var latLng = LatLng.createLatLng(point.coordinates[1], point.coordinates[0]);
        var address = result.properties !== null ?
            (result.properties.label ? result.properties.label :
                (result.properties.name ? result.properties.name : "")) : "";
        var name = '';
        var location = Location.create(latLng, address, id, name, this.SOURCE_ID);
        location.suggestion = result;
        return location;
    };
    PeliasGeocoder.SOURCE_ID = "PELIAS";
    return PeliasGeocoder;
}());
export default PeliasGeocoder;
//# sourceMappingURL=PeliasGeocoder.js.map