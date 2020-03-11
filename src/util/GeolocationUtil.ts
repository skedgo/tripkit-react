// TODO: this was directly on script tag on index.html so executes ASAP. See how to achieve that other way.

function tKRequestIPLocation() {
    return fetch("https://ipapi.co/json/")
        .then(function(response){ return response.json() })
        .then(function(responseJson) {
            return [responseJson.latitude, responseJson.longitude];
        });
}

function tKRequestCurrentLocationHTML5() {
    return new Promise(function (resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (result) { resolve([result.coords.latitude, result.coords.longitude]) },
                function (error) { reject(error) });
        }});
}

export function tKCheckGeolocationPermission() {
    return new Promise(function (resolve, reject) {
        navigator.permissions ?
            // Permission API is supported
            navigator.permissions.query({
                name: 'geolocation'
            }).then(function (permission) {
                // is geolocation granted?
                resolve(permission.state === "granted")
            }) :
            // Permission API is not supported
            reject(new Error("Permission API is not supported"))
    })
}

export function tKRequestCurrentLocation(dontAskUser: any, fallback: boolean = false): Promise<any> {
    const tryIPFallbackFc = (fallback: boolean): Promise<any> => {
        if (fallback) {
            return tKRequestIPLocation();
        } else {
            throw new Error("Unable to detect user location.")
        }
    };
    if (dontAskUser) {
        return tKCheckGeolocationPermission()
            .then(function (granted) {
                // Permission API is supported
                if (granted) {
                    return tKRequestCurrentLocationHTML5();
                } else {
                    return tryIPFallbackFc(fallback);
                }
            })
            .catch(function () {
                // Permission API is not supported
                return tryIPFallbackFc(fallback);
            });
        // return this.requestCurrentLocationGMaps();
    }
    return tKRequestCurrentLocationHTML5()
        .catch(function () {
            return tryIPFallbackFc(fallback);
        });
}