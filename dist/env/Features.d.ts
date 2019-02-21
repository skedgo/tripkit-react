declare class Features {
    protected static _instance: Features;
    static initialize(): void;
    static readonly instance: Features;
    lightRail(): boolean;
}
export default Features;
