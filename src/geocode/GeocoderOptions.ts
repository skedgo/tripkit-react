import Location from "../model/Location";

interface GeocoderOptions {
    blockAutocompleteResults?: boolean;  // default true
    resultsLimit?: number;
    renderIcon?: (location: Location) => JSX.Element;
    reverseGeocoding?: boolean; // default depends on geocoder.
}

export default GeocoderOptions;