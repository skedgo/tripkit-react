import LatLng from "../model/LatLng";
declare class GeolocationData {
    private static _instance;
    static readonly instance: GeolocationData;
    requestIPLocation(): Promise<LatLng>;
    requestCurrentLocationHTML5(): Promise<LatLng>;
    requestCurrentLocation(dontAskUser?: boolean): Promise<LatLng>;
}
export default GeolocationData;
