import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
import {Feature, FeatureCollection, Point} from "geojson";
import NetworkUtil from "../util/NetworkUtil";
import GeocodingCache from "./GeocodingCache";
import LatLng from "../model/LatLng";
import Util from "../util/Util";
import BBox from "../model/BBox";
import GeocoderOptions from "./GeocoderOptions";
import {Env} from "../env/Environment";

class PeliasGeocoder implements IGeocoder {

    private geocodeServer: string;
    private apiKey: string;

    private options: GeocoderOptions;
    private cache: GeocodingCache;

    // Added as constructor parameter, just for this geocoder, instead of a new option field, general for any geocoder.
    private restrictToBounds: boolean;

    constructor(geocodeServer: string, apiKey: string, restrictToBounds: boolean = false) {
        this.geocodeServer = geocodeServer;
        this.apiKey = apiKey;
        this.restrictToBounds = restrictToBounds;
        this.options = new GeocoderOptions();
        this.cache = new GeocodingCache();
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        if (!query) {
            callback([]);
            return;
        }

        const center = focus ? focus : (bounds ? bounds.getCenter() : null);
        if (center !== null) {
            const cachedResults = this.cache.getResults(query, autocomplete, center);
            if (cachedResults !== null) {
                callback(cachedResults.slice(0, this.options.resultsLimit));
                return;
            }
        }
        if (autocomplete) {
            const url = this.geocodeServer + "/autocomplete?api_key=" + this.apiKey
                + (bounds && this.restrictToBounds ?
                        "&boundary.rect.min_lat=" + bounds.minLat +
                        "&boundary.rect.max_lat=" + bounds.maxLat +
                        "&boundary.rect.min_lon=" + bounds.minLng +
                        "&boundary.rect.max_lon=" + bounds.maxLng : ""
                )
                + (focus ? "&focus.point.lat=" + focus.lat + "&focus.point.lon=" + focus.lng : "")
                + (this.options.resultsLimit !== undefined ? "&size=" + this.options.resultsLimit : "")
                + "&text=" + query;

            fetch(url, {
                method: NetworkUtil.MethodType.GET
            }).then(NetworkUtil.jsonCallback).then((json: any) => {
                const features = (json as FeatureCollection).features;
                const locationResults = !features ? [] : features
                    .map(result => PeliasGeocoder.locationFromAutocompleteResult(result));
                if (center) {
                    this.cache.addResults(query, autocomplete, center, locationResults);
                }
                callback(locationResults.slice(0, this.options.resultsLimit));
            }).catch(reason => {
                Util.log(url + " failed. Reason: " + reason, Env.PRODUCTION);
                callback([]);
            });
        } else {
            const url = this.geocodeServer + "/search?api_key=" + this.apiKey
                + (bounds ?
                        "&boundary.rect.min_lat=" + bounds.minLat +
                        "&boundary.rect.max_lat=" + bounds.maxLat +
                        "&boundary.rect.min_lon=" + bounds.minLng +
                        "&boundary.rect.max_lon=" + bounds.maxLng : ""
                )
                + (focus ? "&focus.point.lat=" + focus.lat + "&focus.point.lon=" + focus.lng : "")
                + "&size=1"
                + "&text=" + query;
            fetch(url, {
                method: NetworkUtil.MethodType.GET
            }).then(NetworkUtil.jsonCallback).then((json: any) => {
                const features = (json as FeatureCollection).features;
                const locationResults = !features ? [] : features
                    .map(result => PeliasGeocoder.locationFromAutocompleteResult(result));
                if (center) {
                    this.cache.addResults(query, autocomplete, center, locationResults);
                }
                callback(locationResults.slice(0, this.options.resultsLimit));
            }).catch(reason => {
                Util.log(url + " failed. Reason: " + reason, Env.PRODUCTION);
                callback([]);
            });
        }
    }

    public resolve(unresolvedLocation: Location): Promise<Location> {
        const url = this.geocodeServer + "/place?api_key=" + this.apiKey + "&ids=" + unresolvedLocation.id;
        return fetch(url, {
            method: NetworkUtil.MethodType.GET
        }).then(NetworkUtil.jsonCallback).then((json: any) => {
            // TODO: implement properly
            unresolvedLocation.hasDetail = true;
            return unresolvedLocation;
        }).catch(() => {
            unresolvedLocation.hasDetail = true;
            return unresolvedLocation;
        });
    }

    public reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void {
        const url = this.geocodeServer + "/reverse?api_key=" + this.apiKey +
            "&point.lat="+ coord.lat + "&point.lon=" + coord.lng;
        fetch(url, {
            method: NetworkUtil.MethodType.GET
        }).then(NetworkUtil.jsonCallback).then((json: any) => {
            const features = (json as FeatureCollection).features;
            if (features.length > 0) {
                const geocodedLoc = PeliasGeocoder.locationFromAutocompleteResult(features[0]);
                geocodedLoc.lat = coord.lat;
                geocodedLoc.lng = coord.lng;
                callback(geocodedLoc);
                return
            }
            throw new Error("Unable to reverse geocode the location");
        }).catch(reason => {
            callback(null);
        });
    }

    private static locationFromAutocompleteResult(result: Feature): Location {
        const id = result.properties !== null ? result.properties.gid : "";
        const point = result.geometry as Point;
        const latLng = LatLng.createLatLng(point.coordinates[1], point.coordinates[0]);
        const address = result.properties !== null ?
            (result.properties.label ? result.properties.label :
                (result.properties.name ? result.properties.name : "")) : "";
        const name = '';
        const location = Location.create(latLng, address, id, name);
        location.suggestion = result;
        // TODO: enable to make LocaitonBox resolve the location to get details.
        // location.hasDetail = false;
        return location;
    }

}

export default PeliasGeocoder;