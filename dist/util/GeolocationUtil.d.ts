import LatLng from "../model/LatLng";
/**
 * @returns {Promise<boolean | undefined>} where
 * null means permissions api is unsupported,
 * true means 'granted',
 * false means 'denied', and
 * undefined means 'prompt'
 */
export declare function tKCheckGeolocationPermission(): Promise<boolean | undefined | null>;
export declare const ERROR_GEOLOC_INACCURATE = "ERROR_GEOLOC_INNACURATE";
export declare const ERROR_GEOLOC_DENIED = "ERROR_GEOLOC_DENIED";
export interface TKUserPosition {
    latLng: LatLng;
    accuracy?: number;
}
export declare function tKRequestCurrentLocation(dontAskUser?: boolean, fallback?: boolean): Promise<TKUserPosition>;
