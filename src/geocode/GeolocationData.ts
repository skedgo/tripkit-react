import LatLng from "../model/LatLng";
import iplocation from "iplocation";
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import {tKRequestCurrentLocation} from "../util/GeolocationUtil";

class GeolocationData {

    private static _instance: GeolocationData;

    public static get instance(): GeolocationData {
        if (!this._instance) {
            this._instance = new GeolocationData();
        }
        return this._instance;
    }

    // public requestCurrentLocationGMaps(): Promise<LatLng> {
    //     return fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=" + Environment.GMAPS_API_KEY,
    //         {
    //             method: 'post'
    //         })
    //         .then(NetworkUtil.jsonCallback)
    //         .then((jsonData) => {
    //             return Promise.resolve(LatLng.createLatLng(jsonData.location.lat, jsonData.location.lng));
    //         });
    // }

    /**
     * @deprecated in favor of implementation in index.html, since we want code to be downloaded ASAP by browser.
     */

    public requestIPLocation(): Promise<LatLng> {
        return iplocation('0.0.0.0', ["https://ipapi.co/json/"]).then((res) => {
            return LatLng.createLatLng(res.latitude, res.longitude);
        });
    }

    /**
     * @deprecated in favor of implementation in index.html, since we want code to be downloaded ASAP by browser.
     */

    public requestCurrentLocationHTML5(): Promise<LatLng> {
        return new Promise<LatLng>((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (result) => {
                        return resolve(LatLng.createLatLng(result.coords.latitude, result.coords.longitude));
                    },
                    (error) => {
                        return reject(error);
                    });
            }
        });
    }

    /**
     * @deprecated in favor of implementation in index.html, since we want code to be downloaded ASAP by browser.
     */

    public checkGeolocationPermission(): Promise<boolean> {
        return new Promise((resolve, reject) =>
            navigator.permissions ?
                // Permission API is supported
                navigator.permissions.query({
                    name: 'geolocation'
                }).then(permission =>
                    // is geolocation granted?
                    resolve(permission.state === "granted")
                ) :

                // Permission API is not supported
                reject(new Error("Permission API is not supported"))
        )
    }

    // public requestCurrentLocation(dontAskUser?: boolean): Promise<LatLng> {
    //     if (dontAskUser) {
    //         return this.checkGeolocationPermission()
    //             .then((granted: boolean) => // Permission API is supported
    //                 granted ? this.requestCurrentLocationHTML5() : this.requestIPLocation()
    //             ).catch(() => this.requestIPLocation()); // Permission API is not supported
    //         // return this.requestCurrentLocationGMaps();
    //     }
    //     return this.requestCurrentLocationHTML5();
    // }

    public requestCurrentLocation(dontAskUser?: boolean): Promise<LatLng> {
        return tKRequestCurrentLocation(dontAskUser)
            .then((userLocation: [number, number]) =>
                LatLng.createLatLng(userLocation[0], userLocation[1])
            );
    }

    private currentLocInterval?: any;
    private currentLocBSubject?: BehaviorSubject<LatLng | undefined>;

    public getCurrentLocObservable(): Observable<LatLng | undefined> {
        if (!this.currentLocBSubject) {
            this.currentLocBSubject = new BehaviorSubject<LatLng | undefined>(undefined);
            this.currentLocInterval = setInterval(() => {
                this.requestCurrentLocation()
                    .then((currentLoc: LatLng) =>
                        this.currentLocBSubject && this.currentLocBSubject.next(currentLoc))
                    .catch((error: Error) => {
                        console.log(error);
                        if (this.currentLocInterval) {
                            clearInterval(this.currentLocInterval);
                        }
                        if (this.currentLocBSubject) {
                            this.currentLocBSubject.next(undefined);
                            this.currentLocBSubject = undefined;
                        }
                    });
                // const value = this.currentLocBSubject!.getValue();
                // this.currentLocBSubject!.next(LatLng.createLatLng(value ? value.lat + 1 : 0, 0));
            }, 3000);
        }
        return this.currentLocBSubject.asObservable();
    }

    public stopCurrentLocObservable() {
        if (this.currentLocInterval) {
            clearInterval(this.currentLocInterval);
            this.currentLocInterval = undefined;
        }
        if (this.currentLocBSubject) {
            this.currentLocBSubject.complete();
            this.currentLocBSubject = undefined;
        }
    }

}

export default GeolocationData;