import RoutingQuery from "../model/RoutingQuery";
import RoutingResults from "../model/trip/RoutingResults";
import NetworkUtil from "../util/NetworkUtil";
import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import { Env } from "../env/Environment";
import Util from "../util/Util";

class TripGoApi {

    public static SATAPP = "https://api.tripgo.com/v1";
    public static SATAPP_STAGING = "https://api.tripgo.com/v1";
    public static SATAPP_BETA = "https://bigbang.skedgo.com/satapp-beta";

    public static isBetaServer = false;
    public static apiKey = "";
    public static server = TripGoApi.SATAPP;
    public static userToken?: string = undefined;
    public static accountAccessToken?: string = undefined;
    public static userID?: string = undefined;
    public static locale?: Promise<string> = undefined;

    public static getServer(): string {
        return this.server;
    }

    public static apiCall(endpoint: string, method: string, body?: any, cache: boolean = false): Promise<any> {
        const url = this.getSatappUrl(endpoint);
        return this.apiCallUrl(url, method, body, cache);
    }

    public static getSatappUrl(endpoint: string): string {
        const server = this.getServer();
        return server + (endpoint.startsWith("/") ? "" : "/") + endpoint;
    }

    public static apiCallT<T>(endpoint: string, method: string, resultClassRef: { new(): T }, body?: any): Promise<T> {
        return this.apiCall(endpoint, method, body)
            .then(NetworkUtil.deserializer(resultClassRef));
    }

    public static apiCallUrlT<T>(url: string, method: string, resultClassRef: { new(): T }, body?: any): Promise<T> {
        return this.apiCallUrl(url, method, body)
            .then(NetworkUtil.deserializer(resultClassRef));
    }

    public static apiCallUrl(url: string, method: string, body?: any, cache: boolean = false): Promise<any> {
        // TODO: Fetch with chacé, just for development, to avoid doing so much api calls and accelerating answers.
        return Promise.resolve(this.locale).then(locale =>
            NetworkUtil.fetch(url, {
                method: method,
                headers: {
                    'X-TripGo-Version': 'w3.2018.12.20',
                    'X-TripGo-Key': this.apiKey,
                    'referer': 'https://tripgo.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...this.userToken && {
                        'userToken': this.userToken
                    },
                    ...this.accountAccessToken && {
                        'X-Account-Access-Token': this.accountAccessToken
                    },
                    ...this.userID && {
                        'userID': this.userID
                    },
                    ...locale && locale !== 'en' && {
                        'accept-language': [locale, 'en'].join(',')
                    }
                },
                body: body ? JSON.stringify(body) : undefined
            }, cache)
            // .then(NetworkUtil.jsonCallback); // TODO: Comment since NetworkUtil.fetch already calls jsonCallback.
        )
    }

    public static updateRT(trip: Trip, query: RoutingQuery): Promise<Trip | undefined> {
        const updateURL = trip.updateURL;
        return TripGoApi.apiCallUrl(updateURL + (updateURL.includes("?") ? "&" : "?")
            + "v=11" + '&includeStops=true', NetworkUtil.MethodType.GET)
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
                // Don't re-throw exception since we are not showing any message to user for now.
                return undefined;
            })
    }

    public static findStopFromCode(regionCode: string, stopCode: string): Promise<StopLocation> {
        return this.apiCall("stopFinder.json", NetworkUtil.MethodType.POST,
            { region: regionCode, code: stopCode })
            .then((stopJson: any) => {
                return Util.deserialize(stopJson, StopLocation);
            });
    }

    public static defaultToVersion(url: string, v: number) {
        return !url.includes('v=') ?
            url + (url.includes("?") ? "&" : "?") + "v=" + v : url;
    }

}

export default TripGoApi;