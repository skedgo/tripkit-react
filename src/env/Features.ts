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

    public lightRail() {
        return true;
    }

    public realtimeEnabled() {
        return true;
    }

}

Features.initialize();

export default Features;