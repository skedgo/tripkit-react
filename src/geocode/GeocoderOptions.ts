import Location from "../model/Location";

class GeocoderOptions {

    public blockAutocompleteResults = true;
    public resultsLimit?: number;
    public renderIcon?: (location: Location) => JSX.Element;

}

export default GeocoderOptions;