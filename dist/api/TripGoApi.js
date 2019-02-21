import RoutingResults from "../model/trip/RoutingResults";
import NetworkUtil from "../util/NetworkUtil";
import { JsonConvert } from "json2typescript";
import StopLocation from "../model/StopLocation";
import Environment from "../env/Environment";
var TripGoApi = /** @class */ (function () {
    function TripGoApi() {
    }
    TripGoApi.getServer = function () {
        if (Environment.isStaging()) {
            return this.SATAPP_STAGING;
        }
        if (Environment.isBeta()) {
            return this.SATAPP_BETA;
        }
        return this.SATAPP;
    };
    TripGoApi.apiCall = function (endpoint, method, body) {
        var url = this.getSatappUrl(endpoint);
        return this.apiCallUrl(url, method, body);
    };
    TripGoApi.getSatappUrl = function (endpoint) {
        var server = this.getServer();
        return server + "/" + endpoint;
    };
    TripGoApi.apiCallUrl = function (url, method, body, prod) {
        return fetch(url, {
            method: method,
            headers: {
                'X-TripGo-Version': 'w3.2018.12.20',
                'X-TripGo-Key': this.apiKey,
                'referer': 'https://tripgo.com',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        })
            .then(NetworkUtil.jsonCallback);
    };
    TripGoApi.updateRT = function (trip, query) {
        var updateURL = trip.updateURL;
        return TripGoApi.apiCallUrl(updateURL + (updateURL.includes("?") ? "&" : "?")
            + "v=11", NetworkUtil.MethodType.GET)
            .then(function (routingResultsJson) {
            var jsonConvert = new JsonConvert();
            var routingResults = jsonConvert.deserialize(routingResultsJson, RoutingResults);
            routingResults.setQuery(query);
            routingResults.setSatappQuery(trip.satappQuery);
            var tripGroups = routingResults.groups;
            if (tripGroups.length === 0) {
                throw new Error('Empty trip group.');
            }
            return tripGroups[0];
        }).catch(function (reason) {
            // Our api answers 200 with a null json when there is no update, so return undefined;
            if (reason.message.includes("Unexpected end of JSON input")) {
                return undefined;
            }
            console.log(reason);
            throw reason;
        });
    };
    TripGoApi.findStopFromCode = function (regionCode, stopCode) {
        return this.apiCall("stopFinder.json", NetworkUtil.MethodType.POST, { region: regionCode, code: stopCode })
            .then(function (stopJson) {
            var jsonConvert = new JsonConvert();
            return jsonConvert.deserialize(stopJson, StopLocation);
        });
    };
    TripGoApi.SATAPP = "https://api.tripgo.com/v1";
    TripGoApi.SATAPP_STAGING = "https://api.tripgo.com/v1";
    TripGoApi.SATAPP_BETA = "https://bigbang.skedgo.com/satapp-beta";
    TripGoApi.isBetaServer = false;
    TripGoApi.apiKey = "";
    return TripGoApi;
}());
export default TripGoApi;
//# sourceMappingURL=TripGoApi.js.map