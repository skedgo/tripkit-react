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
 * @returns {Promise<boolean | undefined>} where
 * null means permissions api is unsupported,
 * true means 'granted',
 * false means 'denied', and
 * undefined means 'prompt'
 */

export function tKCheckGeolocationPermission(): Promise<boolean | undefined | null> {
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
            resolve(null);
    })
}

// TODO: maybe use a strings enum.
// Adv: better type checking.
// Disadv: need to centralize error code listing in the enum.
export const ERROR_GEOLOC_INACCURATE = "ERROR_GEOLOC_INNACURATE";
export const ERROR_GEOLOC_DENIED = "ERROR_GEOLOC_DENIED";

function requestCurrentLocationHTML5(accuracyThreshold?: number): Promise<[number, number]> {
    return new Promise(function (resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // Success callback
                function (result) {
                    if (accuracyThreshold === undefined || result.coords.accuracy < accuracyThreshold) {
                        resolve([result.coords.latitude, result.coords.longitude]);
                    } else {
                        reject (new TKError("Inaccurate geolocation.", ERROR_GEOLOC_INACCURATE))
                    }
                },
                // Error callback
                function (error) {
                    reject(new TKError(error.message, ERROR_GEOLOC_DENIED));
                });
        }});
}

function tKRequestCurrentLocationHTML5(dontAskUser: boolean = false, accuracyThreshold?: number): Promise<[number, number]> {
    return tKCheckGeolocationPermission()
        .then(function (granted: boolean | undefined | null) {
            if (granted ||  // Permission granted
                ((granted === null || granted === undefined) && !dontAskUser)) { // Permission API unsupported or didn't prompt user, and can ask user.
                return requestCurrentLocationHTML5(accuracyThreshold);
            } else { // granted === false || ((granted === null || granted === undefined) && dontAskUser)
                throw granted === false ? new TKError("Location tracking blocked by user.", ERROR_GEOLOC_DENIED) :
                    granted === null ? new Error("Permission API is not supported, unable to get HTML5 geolocation without (possibly) asking the user.") :
                        new Error("Unable to get HTML5 geolocation without asking the user.");
            }
        });
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