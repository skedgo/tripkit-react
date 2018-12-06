import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
import {Feature, FeatureCollection, Point} from "geojson";
import NetworkUtil from "../util/NetworkUtil";
import GeocodingCache from "./GeocodingCache";
import LatLng from "../model/LatLng";
import Util from "../util/Util";
import GeolocationData from "./GeolocationData";
import BBox from "../model/BBox";
import GeocoderOptions from "./GeocoderOptions";
import GeocodingSource from "./GeocodingSource";

class PeliasGeocoder implements IGeocoder {

    private readonly GEOCODE_SERVER = "https://api.geocode.earth/v1";
    // private static readonly GEOCODE_SERVER = "https://api.dev.geocode.earth/v1";

    private options: GeocoderOptions;
    private cache: GeocodingCache;

    constructor() {
        this.options = new GeocoderOptions();
        this.cache = new GeocodingCache();
    }

    public getSourceId(): GeocodingSource {
        return GeocodingSource.PELIAS;
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        const center = focus ? focus : (bounds ? bounds.getCenter() : null);
        if (center !== null) {
            const cachedResults = this.cache.getResults(query, autocomplete, center);
            if (cachedResults !== null) {
                callback(cachedResults.slice(0, 5));
                return;
            }
        }
        const url = this.GEOCODE_SERVER + "/autocomplete?api_key=ge-63f76914953caba8"
            + (bounds ?
                    "&boundary.rect.min_lat=" + bounds.minLat +
                    "&boundary.rect.max_lat=" + bounds.maxLat +
                    "&boundary.rect.min_lon=" + bounds.minLng +
                    "&boundary.rect.max_lon=" + bounds.maxLng : ""
            )
            + (focus ? "&focus.point.lat=" + focus.lat + "&focus.point.lon=" + focus.lng : "")
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
            callback(locationResults.slice(0, 5));
        }).catch(reason => {
            console.log(url + " failed. Reason: " + reason);
            callback([]);
        });
    }

    public resolve(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void {
        if (unresolvedLocation.isCurrLoc()) {
            GeolocationData.instance.requestCurrentLocation().then((latLng: LatLng) => {
                callback(Util.iAssign(unresolvedLocation, latLng));
            })
        }
    }

    public reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void {
        const url = this.GEOCODE_SERVER + "/reverse?api_key=ge-63f76914953caba8" +
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
            callback(null);
        }).catch(reason => {
            Location.create(coord, "Location", "", "Location", GeocodingSource.PELIAS);
        });
    }

    private static locationFromAutocompleteResult(result: Feature): Location {
        const id = result.properties !== null ? result.properties.id : "";
        const point = result.geometry as Point;
        const latLng = LatLng.createLatLng(point.coordinates[1], point.coordinates[0]);
        const address = result.properties !== null ?
            (result.properties.label ? result.properties.label :
                (result.properties.name ? result.properties.name : "")) : "";
        const name = '';
        const location = Location.create(latLng, address, id, name, GeocodingSource.PELIAS);
        location.suggestion = result;
        return location;
    }

}

export default PeliasGeocoder;