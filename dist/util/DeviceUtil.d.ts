export declare enum Device {
    PHONE = "PHONE",
    TABLET = "TABLET",
    DESKTOP = "DESKTOP"
}
export declare enum OS {
    IOS = "IOS",
    ANDROID = "ANDROID",
    OTHER = "OTHER"
}
export declare enum BROWSER {
    CHROME = "CHROME",
    SAFARI = "SAFARI",
    FIREFOX = "FIREFOX",
    OPERA = "OPERA",
    IE = "IE",
    EDGE = "EDGE",
    OTHER = "OTHER"
}
declare class DeviceUtil {
    static deviceS: string;
    private static findDevice;
    private static findOS;
    private static findBrowser;
    static device: Device;
    static os: OS;
    static browser: BROWSER;
    static isPhone: boolean;
    static isTablet: boolean;
    static isDesktop: boolean;
    static isIOS: boolean;
    static isAndroid: boolean;
    static initCss(): void;
}
export default DeviceUtil;
