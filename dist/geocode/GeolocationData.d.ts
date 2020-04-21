import LatLng from "../model/LatLng";
import { Observable } from 'rxjs';
import { TKUserPosition } from "../util/GeolocationUtil";
declare class GeolocationData {
    private static _instance;
    static get instance(): GeolocationData;
    /**
     * @deprecated in favor of implementation in index.html, since we want code to be downloaded ASAP by browser.
     */
    requestIPLocation(): Promise<LatLng>;
    /**
     * @deprecated in favor of implementation in index.html, since we want code to be downloaded ASAP by browser.
     */
    requestCurrentLocationHTML5(): Promise<LatLng>;
    /**
     * @deprecated in favor of implementation in index.html, since we want code to be downloaded ASAP by browser.
     */
    checkGeolocationPermission(): Promise<boolean>;
    requestCurrentLocation(dontAskUser?: boolean, fallback?: boolean): Promise<TKUserPosition>;
    private currentLocInterval?;
    private currentLocBSubject?;
    getCurrentLocObservable(): Observable<TKUserPosition | undefined>;
    stopCurrentLocObservable(error?: Error): void;
}
export default GeolocationData;
