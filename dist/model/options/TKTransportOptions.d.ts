export declare enum DisplayConf {
    NORMAL = 0,
    BRIEF = 1,
    HIDDEN = 2
}
declare class TKTransportOptions {
    private transportToOption;
    private avoidTransports;
    setTransportOption(mode: string, option: DisplayConf): void;
    getTransportOption(mode: string): DisplayConf;
    isModeEnabled(mode: string): boolean;
    setPreferredTransport(mode: string, enabled: boolean): void;
    isPreferredTransport(mode: string): boolean;
}
export default TKTransportOptions;
