class Features {

    protected static _instance: Features;

    public static initialize() {
        this._instance = new Features();
    }

    public static get instance(): Features {
        // if (!this._instance) {
        //     this._instance = new Features();
        // }
        return this._instance;
    }

    private _modeSpecificMapTilesEnabled = true;

    public lightRail() {
        return true;
    }

    public realtimeEnabled: boolean = true;

    get modeSpecificMapTilesEnabled(): boolean {
        return this._modeSpecificMapTilesEnabled;
    }

    set modeSpecificMapTilesEnabled(value: boolean) {
        this._modeSpecificMapTilesEnabled = value;
    }
}

Features.initialize();

export default Features;