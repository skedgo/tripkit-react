/* global google */
import Location from "../model/Location";
import Util from "../util/Util";
import LatLng from "../model/LatLng";
import IGeocoder from "./IGeocoder";
import BBox from "../model/BBox";
import GeocoderOptions from "./GeocoderOptions";

export interface TKGoogleGeocoderOptions extends GeocoderOptions {
    restrictToBounds?: boolean;
    lang?: string;
}

class TKGoogleGeocoder implements IGeocoder {

    private googleAutocomplete;
    private getGoogleAutocomplete = () => {
        if (!this.googleAutocomplete) {
            this.googleAutocomplete = new google.maps.places.AutocompleteService();
        }
        return this.googleAutocomplete;
    };

    private googlePlaces;
    private getGooglePlaces = () => {
        if (!this.googlePlaces) {
            const mapStub = new google.maps.Map(document.createElement("div"), {
                center: { lat: -33.866, lng: 151.196 },
                zoom: 15
            });
            this.googlePlaces = new google.maps.places.PlacesService(mapStub);
        }
        return this.googlePlaces;
    };

    private googleGeocoder;
    private getGoogleGeocoder = () => {
        if (!this.googleGeocoder) {
            this.googleGeocoder = new google.maps.Geocoder();
        }
        return this.googleGeocoder;
    };

    private autocompleteSessionToken;
    private getAutocompleteSessionToken = () => {
        if (!this.autocompleteSessionToken) {
            this.autocompleteSessionToken = new google.maps.places.AutocompleteSessionToken();
        }
        return this.autocompleteSessionToken;
    };

    private discardToken() {
        this.autocompleteSessionToken = undefined;
    }

    private options: TKGoogleGeocoderOptions;

    constructor(options: TKGoogleGeocoderOptions) {
        this.options = options;
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        if (!query) {
            callback([]);
            return;
        }
        const latLngBounds = bounds ? new /*global google*/google.maps.LatLngBounds({ lat: bounds.sw.lat, lng: bounds.sw.lng }, { lat: bounds.ne.lat, lng: bounds.ne.lng }) : undefined;
        // Reference: https://developers.google.com/maps/documentation/javascript/reference/3/places-widget#AutocompletionRequest
        // Other: https://developers.google.com/maps/documentation/javascript/place-autocomplete#address_forms
        // noinspection JSUnusedLocalSymbols
        this.getGoogleAutocomplete().getPlacePredictions({
            // AutocompletionRequest interface: https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest
            input: query,
            locationRestriction: this.options.restrictToBounds ? latLngBounds : undefined,     // `bounds` was deprecated            
            locationBias: this.options.restrictToBounds ? undefined : latLngBounds,            // `location` was deprecated            
            componentRestrictions: this.options.lang && this.options.lang === 'ja' ? {
                country: 'jp'
            } : undefined,
            sessionToken: this.getAutocompleteSessionToken()

        }, (results, status: google.maps.places.PlacesServiceStatus) => {
            const locationResults = (results ?? [])
                .map(result => TKGoogleGeocoder.locationFromAutocompleteResult(result));
            callback(locationResults.slice(0, this.options.resultsLimit));
        });
        // Search shouldn't be necessary for now.
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }


    public resolve(unresolvedLocation: Location): Promise<Location> {
        if (!unresolvedLocation.id) {
            const resolved = Util.deepClone(unresolvedLocation);
            resolved.lat = -1;
            resolved.lng = -1;
            return Promise.resolve(resolved);
        }
        return new Promise<Location>((resolve, reject) => {
            this.getGooglePlaces().getDetails({
                placeId: unresolvedLocation.id,
                // fields: ["address_component", "adr_address", "alt_id", "formatted_address", "geometry", "icon", "id", "name", "permanently_closed", "photo", "place_id", "plus_code", "scope", "type", "url", "utc_offset", "vicinity"]
                fields: ["geometry"]
            }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    if (place && place.geometry) {
                        const placeLocation = place.geometry.location!;
                        const resolvedLocation = Util.clone(unresolvedLocation);
                        resolvedLocation.lat = placeLocation.lat();
                        resolvedLocation.lng = placeLocation.lng();
                        resolve(resolvedLocation);
                    }
                } else {
                    const resolved = Util.deepClone(unresolvedLocation);
                    resolved.lat = -1;
                    resolved.lng = -1;
                    resolve(resolved);
                }
            });
            this.discardToken();
        });
    }

    public reverseGeocode(coord: LatLng, callback: (location: Location | null) => void) {
        this.getGoogleGeocoder().geocode({ location: { lat: coord.lat, lng: coord.lng } }, (results, status) => {
            if (status.toString() === 'OK' && results[0]) {
                const geocodedLoc = TKGoogleGeocoder.locationFromGeocoderResult(results[0]);
                geocodedLoc.lat = coord.lat;
                geocodedLoc.lng = coord.lng;
                callback(geocodedLoc);
                return;
            }
            callback(null);
        });
    }

    private static locationFromGeocoderResult(result): Location {
        // To make it match the location creted from the corresponding autocomplete result
        const splitComponent = result.address_components?.[1]?.long_name;
        const address = splitComponent ?
            result.formatted_address.replace(splitComponent, "," + splitComponent)
            //.split(",").reverse().join(", ") // This was to reverse the address for jp client.
            : result.formatted_address;
        const name = '';
        return Location.create(LatLng.createLatLng(result.geometry.location.lat(), result.geometry.location.lng()), address, result.place_id, name);
    }

    private static locationFromAutocompleteResult(result: google.maps.places.AutocompletePrediction): Location {
        const address = result.structured_formatting.main_text +
            (result.structured_formatting.secondary_text ? ', ' + result.structured_formatting.secondary_text : "");
        const name = '';
        const location = Location.create(new LatLng(), address, result.place_id, name);
        // Uncomment to highlight match.
        // location.suggestion = result;
        return location;
    }

}

export default TKGoogleGeocoder;