// TODO: this was directly on script tag on index.html so executes ASAP. See how to achieve that other way.

import {TKError} from "../error/TKError";

function tKRequestIPLocation(): Promise<[number, number]> {
    return fetch("https://ipapi.co/json/")
        .then(function(response){ return response.json() })
        .then(function(responseJson) {
            return [responseJson.latitude, responseJson.longitude];
        });
}


/**
 * @returns {Promise<boolean | undefined>} where true means 'granted', false means 'denied' and undefined means 'prompt'
 */

export function tKCheckGeolocationPermission(): Promise<boolean | undefined> {
    return new Promise(function (resolve, reject) {
        navigator.permissions ?
            // Permission API is supported
            navigator.permissions.query({
                name: 'geolocation'
            }).then(function (permission) {
                // is geolocation granted?
                resolve(permission.state === "granted" ? true : permission.state === "denied" ? false : undefined)
            }) :
            // Permission API is not supported
            reject(new Error("Permission API is not supported"))
    })
}

// TODO: maybe use a strings enum.
// Adv: better type checking.
// Disadv: need to centralize error code listing in the enum.
export const ERROR_GEOLOC_INACCURATE = "GEOLOC_INNACURATE";

function requestCurrentLocationHTML5(accuracyThreshold?: number): Promise<[number, number]> {
    return new Promise(function (resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // Success callback
                function (result) {
                    console.log(result);
                    if (accuracyThreshold === undefined || result.coords.accuracy < accuracyThreshold) {
                        resolve([result.coords.latitude, result.coords.longitude]);
                    } else {
                        reject (new TKError("Inaccurate geolocation.", ERROR_GEOLOC_INACCURATE))
                    }
                },
                // Error callback
                function (error) { reject(error) });
        }});
}

function tKRequestCurrentLocationHTML5(dontAskUser: boolean = false, accuracyThreshold?: number): Promise<[number, number]> {
    if (dontAskUser) {
        return tKCheckGeolocationPermission()
            .catch(function () {
                // Permission API is not supported
                throw new Error('Unable to get HTML5 geolocation without (possibly) asking the user.');
            })
            .then(function (granted: boolean | undefined) {
                // Permission API is supported
                if (granted) {
                    return requestCurrentLocationHTML5(accuracyThreshold);
                } else {
                    throw granted === false ? new Error('Location tracking blocked by user.') :
                        new Error('Unable to get HTML5 geolocation without asking the user.');
                }
            })
        // return this.requestCurrentLocationGMaps();
    }
    // It's ok to ask the user
    return requestCurrentLocationHTML5(accuracyThreshold);
}

export function tKRequestCurrentLocation(dontAskUser: boolean = false, accuracyThreshold?: number, fallback: boolean = false): Promise<[number, number]> {
    return tKRequestCurrentLocationHTML5(dontAskUser, accuracyThreshold)
        .catch(function (error: Error) {
            if (fallback) {
                return tKRequestIPLocation();
            } else {
                throw error;
            }
        });
}