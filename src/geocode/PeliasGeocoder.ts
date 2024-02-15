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
import LocationUtil from "../util/LocationUtil";

export interface ResultAmmendments {
    remove?: {
        id?: string,
        label?: string
    }[],
    update?: {
        id?: string,
        label?: string,
        lat: number,
        lng: number
    }[],
    add?: { address: string, lat: number, lng: number, match?: (props: { query: string, address: string }) => boolean }[]
}

export interface PeliasGeocoderOptions extends GeocoderOptions {
    server: string;
    apiKey: string;
    restrictToBounds?: boolean;
    // Allow to pass region as constructor parameter to use it's polygon to restrict results.
    // TODO: make geocode method to receive a polygon instead of a bounding box (or both things).
    region?: Region;
    sources?: string;
    lang?: string;
    ammendments?: ResultAmmendments;
}

const absorbs = (r1: Location, r2: Location) => {
    // Make localities absorb any other location with the same name.
    const absorbs = r1.address === r2.address && r1.suggestion?.properties?.layer === "locality";
    absorbs && Util.log(r1.address + " " + r1.suggestion?.properties?.gid + " absorbs " + r2.address + " " + r2.suggestion?.properties?.gid, Env.PRODUCTION);
    return absorbs;
}
class PeliasGeocoder implements IGeocoder {

    private options: PeliasGeocoderOptions;
    private cache: GeocodingCache;

    constructor(options: PeliasGeocoderOptions) {
        this.options = options;
        if (this.options.reverseGeocoding === undefined) {  // Default reverseGeocoding to true.
            this.options.reverseGeocoding = true;
        }
        this.cache = new GeocodingCache();
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }

    private applyAbsorb(locations: Location[]): Location[] {
        return locations
            .reduce((prevailed: Location[], curr: Location) => {
                if (!prevailed.some(prevail => absorbs(prevail, curr))) {
                    prevailed.push(curr);
                }
                return prevailed;
            }, []);
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
            const url = this.options.server + "/autocomplete?api_key=" + this.options.apiKey
                + (bounds && this.options.restrictToBounds ?
                    "&boundary.rect.min_lat=" + bounds.minLat +
                    "&boundary.rect.max_lat=" + bounds.maxLat +
                    "&boundary.rect.min_lon=" + bounds.minLng +
                    "&boundary.rect.max_lon=" + bounds.maxLng : ""
                )
                + (focus ? "&focus.point.lat=" + focus.lat + "&focus.point.lon=" + focus.lng : "")
                + (this.options.resultsLimit !== undefined ? "&size=" + this.options.resultsLimit : "")
                + (this.options.sources ? "&sources=" + this.options.sources : "")
                + (this.options.lang ? "&lang=" + this.options.lang : "")
                + "&text=" + query;

            fetch(url, {
                method: NetworkUtil.MethodType.GET
            }).then(NetworkUtil.jsonCallback).then((json: any) => {
                const features = (json as FeatureCollection).features;
                let locationResults = !features ? [] : features
                    .map(result => PeliasGeocoder.locationFromAutocompleteResult(result, query));
                if (this.options.ammendments) {
                    const remove = this.options.ammendments?.remove || [];
                    locationResults = locationResults.filter(result => {
                        const matchRemove = remove.find(u => u.id ? u.id === result.id : u.label ? u.label === LocationUtil.getMainText(result) : false)
                        return !matchRemove;
                    });
                    const update = this.options.ammendments?.update || [];
                    locationResults = locationResults.map(result => {
                        const matchUpdate = update.find(u => u.id ? u.id === result.id : u.label ? u.label === LocationUtil.getMainText(result) : false)
                        if (matchUpdate && matchUpdate.lat && matchUpdate.lng) {
                            result.lat = matchUpdate.lat;
                            result.lng = matchUpdate.lng;
                        }
                        return result;
                    });
                    const add = this.options.ammendments?.add?.filter(add => {
                        return add.match ? add.match({ query, address: add.address }) : (query.length > 3 && LocationUtil.standarizeForMatch(add.address).startsWith(LocationUtil.standarizeForMatch(query)));
                    });
                    if (add) {
                        locationResults = add.map(a => Location.create(LatLng.createLatLng(a.lat, a.lng), a.address, "" + a.lat + a.lng, ""))
                            .concat(locationResults);
                    }

                }
                if (this.options.restrictToBounds) {
                    locationResults = locationResults.filter(result => !this.options.region || this.options.region.contains(result as any))
                }
                locationResults = this.applyAbsorb(locationResults);
                if (center) {
                    this.cache.addResults(query, autocomplete, center, locationResults);
                }
                callback(locationResults.slice(0, this.options.resultsLimit));
            }).catch(reason => {
                Util.log(url + " failed. Reason: " + reason, Env.PRODUCTION);
                callback([]);
            });
        } else {
            const url = this.options.server + "/search?api_key=" + this.options.apiKey
                + (bounds ?
                    "&boundary.rect.min_lat=" + bounds.minLat +
                    "&boundary.rect.max_lat=" + bounds.maxLat +
                    "&boundary.rect.min_lon=" + bounds.minLng +
                    "&boundary.rect.max_lon=" + bounds.maxLng : ""
                )
                + (focus ? "&focus.point.lat=" + focus.lat + "&focus.point.lon=" + focus.lng : "")
                + "&size=1"
                + (this.options.lang ? "&lang=" + this.options.lang : "")
                + "&text=" + query;
            fetch(url, {
                method: NetworkUtil.MethodType.GET
            }).then(NetworkUtil.jsonCallback).then((json: any) => {
                const features = (json as FeatureCollection).features;

                const locationResults = !features ? [] : features
                    .map(result => PeliasGeocoder.locationFromAutocompleteResult(result, query));
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
        const url = this.options.server + "/place?api_key=" + this.options.apiKey + "&ids=" + unresolvedLocation.id;
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
        const url = this.options.server + "/reverse?api_key=" + this.options.apiKey +
            "&point.lat=" + coord.lat + "&point.lon=" + coord.lng
            + "&size=1"
            + (this.options.lang ? "&lang=" + this.options.lang : "");
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

    private static locationFromAutocompleteResult(result: Feature, query?: string): Location {
        const id = result.properties !== null ? result.properties.gid : "";
        const point = result.geometry as Point;
        const latLng = LatLng.createLatLng(point.coordinates[1], point.coordinates[0]);
        const { label, street, housenumber } = result.properties!
        let address = label || "";
        if (street && !address.includes(street)) {
            const numAndStreet = (housenumber || "") + " " + street;
            address = !address ? numAndStreet :
                !address.includes(',') ? address + ", " + numAndStreet :
                    [address.slice(0, address.indexOf(',')), ', ', numAndStreet, address.slice(address.indexOf(','))].join('');
        }
        const name = '';
        const location = Location.create(latLng, address, id, name);
        location.suggestion = result;
        // TODO: enable to make LocaitonBox resolve the location to get details.
        // location.hasDetail = false;
        if (query) {
            location.structured_formatting = LocationUtil.match(query, location, { fillStructuredFormatting: true }).structuredFormatting;
        }
        return location;
    }

}

export default PeliasGeocoder;