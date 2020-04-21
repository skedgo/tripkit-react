import RoutingQuery from "../model/RoutingQuery";
import RoutingResults from "../model/trip/RoutingResults";
import NetworkUtil from "../util/NetworkUtil";
import {JsonConvert} from "json2typescript";
import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import Environment, {Env} from "../env/Environment";
import Util from "../util/Util";

class TripGoApi {

    public static SATAPP = "https://api.tripgo.com/v1";
    public static SATAPP_STAGING = "https://api.tripgo.com/v1";
    public static SATAPP_BETA = "https://bigbang.skedgo.com/satapp-beta";

    public static isBetaServer = false;
    public static apiKey = "";

    public static getServer(): string {
        if (Environment.isStaging()) {
            return this.SATAPP_STAGING;
        }
        if (Environment.isBeta()) {
            return this.SATAPP_BETA;
        }
        return this.SATAPP;
    }

    public static apiCall(endpoint: string, method: string, body?: any, cache: boolean = false): Promise<any> {
        const url = this.getSatappUrl(endpoint);
        return this.apiCallUrl(url, method, body, cache);
    }

    public static apiCallT<T>(endpoint: string, method: string, resultClassRef: { new(): T }, body?: any): Promise<T> {
        return this.apiCall(endpoint, method, body)
            .then(NetworkUtil.deserializer(resultClassRef));
    }

    public static getSatappUrl(endpoint: string): string {
        const server = this.getServer();
        return server + (endpoint.startsWith("/") ? "" : "/") + endpoint;
    }

    public static apiCallUrl(url: string, method: string, body?: any, cache: boolean = false): Promise<any> {
        // TODO: Fetch with chacé, just for development, to avoid doing so much api calls and accelerating answers.
        return NetworkUtil.fetch(url, {
            method: method,
            headers: {
                'X-TripGo-Version': 'w3.2018.12.20',
                'X-TripGo-Key': this.apiKey,
                'referer': 'https://tripgo.com',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        }, cache)
            // .then(NetworkUtil.jsonCallback); // TODO: Comment since NetworkUtil.fetch already calls jsonCallback.
    }

    public static updateRT(trip: Trip, query: RoutingQuery): Promise<Trip | undefined> {
        const updateURL = trip.updateURL;
        return TripGoApi.apiCallUrl(updateURL + (updateURL.includes("?") ? "&" : "?")
            + "v=11", NetworkUtil.MethodType.GET)
            .then((routingResultsJson: any) => {
                const routingResults: RoutingResults = Util.deserialize(routingResultsJson, RoutingResults);
                routingResults.setQuery(query);
                routingResults.setSatappQuery(trip.satappQuery);
                const tripGroups = routingResults.groups;
                if (tripGroups.length === 0 || tripGroups[0].trips.length === 0) {
                    throw new Error('Empty trip group.');
                }
                return tripGroups[0].trips[0];
            }).catch((reason: Error) => {
                // Our api answers 200 with a null json when there is no update, so return undefined;
                if (reason.message.includes("Unexpected end of JSON input")) {
                    return undefined;
                }
                Util.log(reason, Env.PRODUCTION);
                throw reason;
            })
    }

    public static findStopFromCode(regionCode: string, stopCode: string): Promise<StopLocation> {
        return this.apiCall("stopFinder.json", NetworkUtil.MethodType.POST,
            {region: regionCode, code: stopCode})
            .then((stopJson: any) => {
                return Util.deserialize(stopJson, StopLocation);
            });
    }

}

export default TripGoApi;