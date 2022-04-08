/* global google */
import Location from "../model/Location";
import Util from "../util/Util";
import LatLng from "../model/LatLng";
import IGeocoder from "./IGeocoder";
import BBox from "../model/BBox";
import GeocoderOptions from "./GeocoderOptions";

class GoogleGeocoder implements IGeocoder {

    public static readonly SOURCE_ID = "GOOGLE";
    public static readonly API_KEY = "AIzaSyBNHDLhhQ3XCeu-mD8CsVqH1woeMncu7Ao";

    private mapStub = new google.maps.Map(document.createElement("div"), {
        center: {lat: -33.866, lng: 151.196},
        zoom: 15
    });
    private googleAutocomplete = new google.maps.places.AutocompleteService();
    private googlePlaces = new google.maps.places.PlacesService(this.mapStub);
    // private googleGeocoder = new google.maps.Geocoder;

    private options: GeocoderOptions;

    constructor(options: GeocoderOptions) {
        this.options = options;
        // this.cache = new GeocodingCache();
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        if (!query) {
            callback([]);
            return;
        }
        const latLngBounds = bounds ? new /*global google*/google.maps.LatLngBounds({lat: bounds.ne.lat, lng: bounds.ne.lng}, {lat: bounds.sw.lat, lng: bounds.sw.lng}) : undefined;
        // Reference: https://developers.google.com/maps/documentation/javascript/reference/3/places-widget#AutocompletionRequest
        // noinspection JSUnusedLocalSymbols
        this.googleAutocomplete.getPlacePredictions({ input: query, bounds: latLngBounds },
            // (results: google.maps.places.AutocompletePrediction[], status: google.maps.places.PlacesServiceStatus) => {
            (results, status: google.maps.places.PlacesServiceStatus) => {
                const locationResults = results == null ? [] : results.map(result => GoogleGeocoder.locationFromAutocompleteResult(result) );
                callback(locationResults);
            });
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }

    public getSourceId(): string {
        return GoogleGeocoder.SOURCE_ID;
    }

    public resolve(unresolvedLocation: Location): Promise<Location> {
        if (!unresolvedLocation.id) {
            const resolved = Util.deepClone(unresolvedLocation);
            resolved.lat = -1;
            resolved.lng = -1;
            return Promise.resolve(resolved);
        }
        return new Promise<Location>((resolve, reject) =>{
            this.googlePlaces.getDetails({
                placeId: unresolvedLocation.id,
                fields: ["address_component", "adr_address", "alt_id", "formatted_address", "geometry", "icon", "id", "name", "permanently_closed", "photo", "place_id", "plus_code", "scope", "type", "url", "utc_offset", "vicinity"]
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
        });
    }

    public reverseGeocode(coord: LatLng, callback: (location: Location | null) => void) {
        // this.googleGeocoder.geocode({location: {lat: coord.lat, lng: coord.lng}}, (results: GeocoderResult[], status: GeocoderStatus) => {
        //     if (status.toString() === 'OK' && results[0]) {
        //         const geocodedLoc = GoogleGeocoder.locationFromGeocoderResult(results[0]);
        //         geocodedLoc.lat = coord.lat;
        //         geocodedLoc.lng = coord.lng;
        //         callback(geocodedLoc);
        //         return;
        //     }
        //     callback(null);
        // })
    }

    // private static locationFromGeocoderResult(result: GeocoderResult): Location {
    //     const address = result.formatted_address;
    //     const name = '';
    //     return Location.create(LatLng.createLatLng(result.geometry.location.lat(), result.geometry.location.lng()), address, result.place_id, name);
    // }

    private static locationFromAutocompleteResult(result: google.maps.places.AutocompletePrediction): Location {
        const address = result.structured_formatting.main_text + ', ' + result.structured_formatting.secondary_text;
        const name = '';
        const location = Location.create(new LatLng(), address, result.place_id, name);
        // location.suggestion = result;
        return location;
    }

}

export default GoogleGeocoder;