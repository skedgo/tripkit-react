declare class GMapUtil {
    static preloadedMap: any;
    static alreadyFitWidget: any;
    static initialUserPosition: any;
    static pathname: string;
    static hostname: string;
    static isWidget: boolean;
    static isFullWidget: boolean;
    static isComWidget: boolean;
    static isCityStats: boolean;
    static isShowWorld: boolean;
    static initMap(): void;
    private static restrictToWorld;
    static addOsmMapType(map: any): void;
    private static getCurrentLocation;
    private static fitMapWidget;
    private static fitMap;
    private static setCenter;
    private static movePointInPixels;
    static getPreloadedMap(): any;
    static isAlreadyFitWidget(): any;
    static getInitialUserPosition(): any;
    static isGoogleMapsLoaded(): boolean;
}
export default GMapUtil;
