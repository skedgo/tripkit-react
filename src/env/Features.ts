import Environment from "./Environment";

class Features {

    private static _instance: Features;

    public static get instance(): Features {
        if (!this._instance) {
            this._instance = new Features();
        }
        return this._instance;
    }

    public lightRail() {
        return !Environment.isProd();
    }

    public schoolBuses() {
        // return !Environment.isProd();
        return false;
    }

}

export default Features;