class GeocoderOptions {

    private _blockAutocompleteResults = true;

    set blockAutocompleteResults(value: boolean) {
        this._blockAutocompleteResults = value;
    }

    get blockAutocompleteResults(): boolean {
        return this._blockAutocompleteResults;
    }
}

export default GeocoderOptions;