declare class Features {
    private static _instance;
    static readonly instance: Features;
    lightRail(): boolean;
    schoolBuses(): boolean;
}
export default Features;
