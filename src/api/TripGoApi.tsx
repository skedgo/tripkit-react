import RoutingQuery from "../model/RoutingQuery";
import RoutingResults from "../model/trip/RoutingResults";
import NetworkUtil from "../util/NetworkUtil";
import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import { Env } from "../env/Environment";
import Util from "../util/Util";
import BookingInfo from "../model/trip/BookingInfo";
import PaymentOption from "../model/trip/PaymentOption";
import BookingReview from "../model/trip/BookingReview";
import EphemeralResult from "../model/payment/EphemeralResult";
import { i18n } from "../i18n/TKI18nConstants";

type TripGoApiHeader = "X-TripGo-Version" | "X-TripGo-Key" | "X-TripGo-Client-Id" | "X-Tsp-Client-UserId" | "X-Tsp-Client-tenantId" | "X-Account-Access-Token" | "userID" | "userToken";
export type TripGoApiHeadersMap = { [key in TripGoApiHeader]?: string } | { [key: string]: string };

class TripGoApi {

    public static SATAPP = "https://api.tripgo.com/v1";
    public static SATAPP_STAGING = "https://api.tripgo.com/v1";
    public static SATAPP_BETA = "https://api-beta.tripgo.com/v1";

    public static isBetaServer = false;
    public static apiKey = "";
    public static server = TripGoApi.SATAPP;
    public static userToken?: string = undefined;
    public static resetUserToken: () => void = () => { };
    public static clientID?: string = undefined;
    public static accountAccessToken?: string = undefined;
    public static userID?: string = undefined;
    public static locale?: Promise<string> = undefined;
    public static apiVersion: number = 13;
    public static apiHeadersOverride?: TripGoApiHeadersMap | ((params: { defaultHeaders: TripGoApiHeadersMap, requestUrl: URL }) => TripGoApiHeadersMap | undefined);

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
        return this.fetchAPI(url, {
            method,
            body,
            tkcache: cache
        });
    }

    public static fetchAPI(
        url: string,
        options: RequestInit & {
            tkcache?: boolean
        }): Promise<any> {
        const { tkcache = false, ...fetchOptions } = options
        // TODO: Fetch with cache, just for development, to avoid doing so much api calls and accelerating answers.
        return Promise.resolve(this.locale).then(locale => {
            const defaultHeaders: TripGoApiHeadersMap = {
                'X-TripGo-Version': 'w3.2018.12.20',
                'X-TripGo-Key': this.apiKey,
                ...this.clientID && {
                    'X-TripGo-Client-Id': this.clientID
                },
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
                },
                ...options.headers as any
            };
            let apiHeadersOverride: TripGoApiHeadersMap | undefined;
            if (Util.isFunction(this.apiHeadersOverride)) {
                try {
                    apiHeadersOverride = (this.apiHeadersOverride as ((params: { defaultHeaders: TripGoApiHeadersMap, requestUrl: URL }) => TripGoApiHeadersMap))({ defaultHeaders, requestUrl: new URL(url) });
                } catch (e) {
                    console.log(e);
                }
            } else {
                apiHeadersOverride = this.apiHeadersOverride as TripGoApiHeadersMap | undefined;
            }
            const headers = {
                ...defaultHeaders,
                ...apiHeadersOverride
            };
            // Remove headers with value `undefined`, which may come in `TKUIConfig.apiHeadersOverride`
            // to remove a given (default) header.
            Object.keys(headers).forEach(headerKey => {
                if (headers[headerKey] === undefined) {
                    delete headers[headerKey];
                }
            })
            return NetworkUtil.fetch(url, {
                ...fetchOptions,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            }, tkcache);
        }
        );
    }

    public static updateRT(trip: Trip, query: RoutingQuery): Promise<Trip | undefined> {
        const updateURL = trip.updateURL;
        return TripGoApi.apiCallUrl(TripGoApi.defaultToVersion(updateURL, TripGoApi.apiVersion) + '&includeStops=true', NetworkUtil.MethodType.GET)
            .then((routingResultsJson: any) => {
                if (!routingResultsJson) {
                    // Our api answers 200 with no content when there is no update. Should return 204.
                    return undefined;
                }
                const routingResults: RoutingResults = Util.deserialize(routingResultsJson, RoutingResults);
                routingResults.setQuery(query);
                routingResults.setSatappQuery(trip.satappQuery);
                const tripGroups = routingResults.groups;
                if (tripGroups.length === 0 || tripGroups[0].trips.length === 0) {
                    throw new Error('Empty trip group.');
                }
                return tripGroups[0].trips[0];
            }).catch((reason: Error) => {
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

    private static addQueryParam(url: string, paramName: string, paramValue: string): string {
        return url + (url.includes("?") ? "&" : "?") + paramName + "=" + paramValue;
    }

    public static defaultToVersion(url: string, v: number) {
        let result = this.addQueryParam(url, "unit", i18n.distanceUnit());
        return !result.includes('v=') ?
            this.addQueryParam(result, "v", v.toString()) : result;
    }

    public static requestBookingOptions(bookingInfosUrl: string): Promise<BookingInfo[]> {
        return TripGoApi.apiCallUrl(bookingInfosUrl, "GET")
            .then((bookingsInfoJsonArray) => {
                return bookingsInfoJsonArray.map(infoJson => Util.deserialize(infoJson, BookingInfo));
            })
    }

    public static submitBookingOption(bookingForm: BookingInfo): Promise<{
        paymentOptions?: PaymentOption[],
        reviews?: BookingReview[],
        publishableApiKey: string,
        ephemeralKey: EphemeralResult,
        refreshURLForSourceObject: string
    }> {
        return TripGoApi.apiCallUrl(bookingForm.bookingURL, NetworkUtil.MethodType.POST, Util.serialize(bookingForm))
            // For testing without performing booking.
            // Promise.resolve({ "type": "bookingForm", "action": { "title": "Done", "done": true }, "refreshURLForSourceObject": "https://lepton.buzzhives.com/satapp/booking/v1/2c555c5c-b40d-481a-89cc-e753e4223ce6/update" })
            .then(this.deserializeBookingResult);
    }

    public static deserializeRoutingResults(resultsJson): RoutingResults {
        return Util.deserialize(resultsJson, RoutingResults);
    }

    public static deserializeBookingInfo(bookingInfoJson): BookingInfo {
        return Util.deserialize(bookingInfoJson, BookingInfo);
    }

    public static deserializeBookingResult(bookingResultJson): {
        paymentOptions?: PaymentOption[],
        reviews?: BookingReview[],
        publishableApiKey: string,
        ephemeralKey: EphemeralResult,
        refreshURLForSourceObject: string
    } {
        return ({
            ...bookingResultJson,
            reviews: bookingResultJson.review && Util.jsonConvert().deserializeArray(bookingResultJson.review, BookingReview),
        });
    }

}

export default TripGoApi;
export { TripGoApi };