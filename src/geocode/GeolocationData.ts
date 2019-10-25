import LatLng from "../model/LatLng";
import iplocation from "iplocation";

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

    public requestIPLocation(): Promise<LatLng> {
        return iplocation('0.0.0.0', ["https://ipapi.co/json/"]).then((res) => {
            return LatLng.createLatLng(res.latitude, res.longitude);
        });
    }

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

    public requestCurrentLocation(dontAskUser?: boolean): Promise<LatLng> {
        if (dontAskUser) {
            return this.requestIPLocation();
            // return this.requestCurrentLocationGMaps();
        }
        return this.requestCurrentLocationHTML5();
    }

}

export default GeolocationData;