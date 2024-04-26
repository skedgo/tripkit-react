import Location from "../model/Location";

interface GeocoderOptions {
    blockAutocompleteResults?: boolean;  // default true
    resultsLimit?: number;
    renderIcon?: (location: Location) => JSX.Element;
    reverseGeocoding?: boolean; // default depends on geocoder.    
    compare?: (l1: Location, l2: Location, query: string) => number;
}

export default GeocoderOptions;