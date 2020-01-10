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

function tKCheckGeolocationPermission() {
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

export function tKRequestCurrentLocation(dontAskUser: any): Promise<any> {
    if (dontAskUser) {
        return tKCheckGeolocationPermission()
            .then(function (granted) {
                // Permission API is supported
                return granted ? tKRequestCurrentLocationHTML5() : tKRequestIPLocation();
            })
            .catch(function () {
                // Permission API is not supported
                return tKRequestIPLocation();
            });
        // return this.requestCurrentLocationGMaps();
    }
    return tKRequestCurrentLocationHTML5()
        .catch(function () {
            return tKRequestIPLocation();
        });
}