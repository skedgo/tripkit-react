import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
import { Feature, FeatureCollection, Point } from "geojson";
import NetworkUtil from "../util/NetworkUtil";
import GeocodingCache from "./GeocodingCache";
import LatLng from "../model/LatLng";
import Util from "../util/Util";
import BBox from "../model/BBox";
import GeocoderOptions from "./GeocoderOptions";
import { Env } from "../env/Environment";
import Region from "../model/region/Region";

export interface TKMapboxGeocoderOptions extends GeocoderOptions {
    server: string;
    apiKey: string;
    restrictToBounds?: boolean;
    // Allow to pass region as constructor parameter to use it's polygon to restrict results.
    // TODO: make geocode method to receive a polygon instead of a bounding box (or both things).
    region?: Region;
    lang?: string;
}

class TKMapboxGeocoder implements IGeocoder {

    private options: TKMapboxGeocoderOptions;
    private cache: GeocodingCache;

    constructor(options: TKMapboxGeocoderOptions) {
        this.options = options;
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

        const url = `${this.options.server}/mapbox.places/${query}.json?access_token=${this.options.apiKey}\
&autocomplete=${autocomplete}`
            + (bounds && this.options.restrictToBounds ? `&bbox=${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}` : "")
            + (focus ? `&proximity=${focus.lng},${focus.lat}` : "")
            + (!autocomplete ? "&limit=1" :
                this.options.resultsLimit !== undefined ? `&limit=${this.options.resultsLimit}` : "")
            + (this.options.lang ? `&language=${this.options.lang}` : "")
            + (this.options.lang && this.options.lang === 'ja' ? `&worldview=jp` : "");

        fetch(url, {
            method: NetworkUtil.MethodType.GET
        }).then(NetworkUtil.jsonCallback).then((json: any) => {
            const features = (json as FeatureCollection).features;
            let locationResults = !features ? [] : features
                .map(result => TKMapboxGeocoder.locationFromAutocompleteResult(result));
            if (this.options.restrictToBounds) {
                locationResults = locationResults.filter(result => !this.options.region || this.options.region.contains(result as any))
            }
            if (center) {
                this.cache.addResults(query, autocomplete, center, locationResults);
            }
            callback(locationResults.slice(0, this.options.resultsLimit));
        }).catch(reason => {
            Util.log(url + " failed. Reason: " + reason, Env.PRODUCTION);
            callback([]);
        });
    }

    public resolve(unresolvedLocation: Location): Promise<Location> {
        // Placeholder for actual implementation, if needed.
        unresolvedLocation.hasDetail = true;
        return Promise.resolve(unresolvedLocation);
    }

    public reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void {
        const url = `${this.options.server}/mapbox.places/${coord.lng},${coord.lat}.json?access_token=${this.options.apiKey}`
            + (this.options.lang ? `&language=${this.options.lang}` : "")
            + (this.options.lang && this.options.lang === 'ja' ? `&worldview=jp` : "")
            + '&limit=1';

        fetch(url, {
            method: NetworkUtil.MethodType.GET
        }).then(NetworkUtil.jsonCallback).then((json: any) => {
            const features = (json as FeatureCollection).features;
            if (features.length > 0) {
                const geocodedLoc = TKMapboxGeocoder.locationFromAutocompleteResult(features[0]);
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
        const id = result.id?.toString() ?? "";
        const point = result.geometry as Point;
        const latLng = LatLng.createLatLng(point.coordinates[1], point.coordinates[0]);
        const placeName = result['place_name'];
        console.log(placeName + " <- coming address")
        let address = (result as any).context.reverse().reduce((acc, comp) =>
            acc + (comp.id.startsWith("postcode") || comp.id.startsWith("country") ? "" : comp.text), "");
        address += (result as any).text + ((result as any).address ?? (result as any).properties.address ?? "");    
        console.log(address + " <- built from parts")
        const name = '';
        const location = Location.create(latLng, address, id, name);
        location.suggestion = result;
        // TODO: enable to make LocaitonBox resolve the location to get details.
        // location.hasDetail = false;
        return location;
    }

}

export default TKMapboxGeocoder;