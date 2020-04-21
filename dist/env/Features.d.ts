declare class Features {
    protected static _instance: Features;
    static initialize(): void;
    static get instance(): Features;
    lightRail(): boolean;
    realtimeEnabled(): boolean;
}
export default Features;
