/// <reference types="react" />
import Location from "../model/Location";
declare class GeocoderOptions {
    blockAutocompleteResults: boolean;
    resultsLimit?: number;
    renderIcon?: (location: Location) => JSX.Element;
}
export default GeocoderOptions;
