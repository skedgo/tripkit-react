class GeocoderOptions {

    private _blockAutocompleteResults = true;
    private _resultsLimit: number | undefined;

    get resultsLimit(): number | undefined {
        return this._resultsLimit;
    }

    set resultsLimit(value: number | undefined) {
        this._resultsLimit = value;
    }

    set blockAutocompleteResults(value: boolean) {
        this._blockAutocompleteResults = value;
    }

    get blockAutocompleteResults(): boolean {
        return this._blockAutocompleteResults;
    }
}

export default GeocoderOptions;