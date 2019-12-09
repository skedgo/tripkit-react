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
import {Env} from "../env/Environment";

class PeliasGeocoder implements IGeocoder {

    public static readonly SOURCE_ID = "PELIAS";

    private geocodeServer: string;
    private apiKey: string;

    private options: GeocoderOptions;
    private cache: GeocodingCache;

    constructor(geocodeServer: string, apiKey: string) {
        this.geocodeServer = geocodeServer;
        this.apiKey = apiKey;
        this.options = new GeocoderOptions();
        this.cache = new GeocodingCache();
    }

    public getSourceId(): string {
        return PeliasGeocoder.SOURCE_ID;
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
        const url = this.geocodeServer + "/autocomplete?api_key=" + this.apiKey
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
            callback(locationResults.slice(0, this.options.resultsLimit));
        }).catch(reason => {
            Util.log(url + " failed. Reason: " + reason, Env.PRODUCTION);
            callback([]);
        });
    }

    public resolve(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void {
        const url = this.geocodeServer +  "/place?api_key=" + this.apiKey + "&ids=" + unresolvedLocation.id;
        fetch(url, {
            method: NetworkUtil.MethodType.GET
        }).then(NetworkUtil.jsonCallback).then((json: any) => {
            // TODO: implement properly
            unresolvedLocation.hasDetail = true;
            callback(unresolvedLocation);
        }).catch(() => {
            unresolvedLocation.hasDetail = true;
            callback(unresolvedLocation)
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
            callback(null);
        }).catch(reason => {
            Location.create(coord, "Location", "", "Location", PeliasGeocoder.SOURCE_ID);
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
        const location = Location.create(latLng, address, id, name, this.SOURCE_ID);
        location.suggestion = result;
        // TODO: enable to make LocaitonBox resolve the location to get details.
        // location.hasDetail = false;
        return location;
    }

}

export default PeliasGeocoder;