class Features {

    protected static _instance: Features;

    public static initialize() {
        console.log("Features:initialize()");
        this._instance = new Features();
    }

    public static get instance(): Features {
        // if (!this._instance) {
        //     this._instance = new Features();
        // }
        return this._instance;
    }

    public lightRail() {
        console.log("Features:lightRail()");
        return true;
    }

}

Features.initialize();

export default Features;