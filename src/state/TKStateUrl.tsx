import * as React from "react";
import TKStateConsumer from "../config/TKStateConsumer";
import {TKState} from "../config/TKState";
import TKShareHelper from "../share/TKShareHelper";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import RegionsData from "../data/RegionsData";
import DateTimeUtil from "../util/DateTimeUtil";
import Location from "../model/Location";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import MultiGeocoder from "../geocode/MultiGeocoder";
import LatLng from "../model/LatLng";
import * as queryString from "query-string";
import Util from "../util/Util";
import {TKError} from "..";
import {ERROR_LOADING_DEEP_LINK} from "../error/TKErrorHelper";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Trip from "../model/trip/Trip";
import {getGeocodingOptions} from "../geocode/TKGeocodingOptions";

interface IProps {
    tKState: TKState;
}

enum URLFields {
    FROM = "fr",
    TO = "to",
    TIME = "ti",
    TIME_PREF = "pr",
    SERVICE = "se",
    TRIP = "tr"
}

const URL_FIELD_SEPARATOR = "/";
const URL_FIELD_VALUE_SEPARATOR = ":";
const URL_VALUE_COMPONENT_SEPARATOR = "+";




class TKStateUrl extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        this.loadTripState = this.loadTripState.bind(this);
        this.loadTimetableState = this.loadTimetableState.bind(this);
        this.setStateFromUrl = this.setStateFromUrl.bind(this);
    }

    private getUrlFromState(state: TKState): string {
        const fieldsMap: Map<URLFields, string> = new Map<URLFields, string>();
        if (state.query) {
            const query = state.query;
            if (query.from) {
                fieldsMap.set(URLFields.FROM, this.getLocationFieldValue(query.from));
            }
            if (query.to) {
                fieldsMap.set(URLFields.TO, this.getLocationFieldValue(query.to));
            }
            if (query.timePref !== TimePreference.NOW || query.isComplete(true)) {
                fieldsMap.set(URLFields.TIME_PREF,
                    query.timePref === TimePreference.NOW || query.timePref === TimePreference.LEAVE ? "1" : "2");
                fieldsMap.set(URLFields.TIME, Math.floor(query.time.valueOf() / 1000).toString());
            }
        }
        if (state.stop) {
            fieldsMap.set(URLFields.SERVICE, this.getServiceFieldValue(state.stop, state.timetableFilter, state.selectedService));
        }
        if (state.selectedTrip && state.tripDetailsView) {
            fieldsMap.set(URLFields.TRIP, this.getTripFieldValue(state.selectedTrip));
        }
        let statePath = "/";
        for (const field of Object.values(URLFields)) {
            if (fieldsMap.has(field)) {
                statePath = this.addField(field, fieldsMap.get(field)!, statePath);
            }
        }
        return statePath;
    }

    private setStateFromUrl(path: string) {
        const fields = path.substring(1).split(URL_FIELD_SEPARATOR);
        const fieldsMap: Map<URLFields, string> = new Map<URLFields, string>();
        for (const field of fields) {
            const fieldValuePair = field.split(URL_FIELD_VALUE_SEPARATOR);
            fieldsMap.set(fieldValuePair[0] as URLFields, fieldValuePair[1]);
        }
        const query = new RoutingQuery();
        if (fieldsMap.has(URLFields.FROM)) {
            query.from = this.parseLocationFieldValue(fieldsMap.get(URLFields.FROM)!);
        }
        if (fieldsMap.has(URLFields.TO)) {
            query.to = this.parseLocationFieldValue(fieldsMap.get(URLFields.TO)!);
        }
        if (fieldsMap.has(URLFields.TIME_PREF)) {
            const timePref = fieldsMap.get(URLFields.TIME_PREF);
            query.timePref = timePref === "1" ? TimePreference.LEAVE :
                timePref === "2" ? TimePreference.ARRIVE : TimePreference.NOW;
        }
        if (fieldsMap.has(URLFields.TIME)) {
            const timeMilis = Number(fieldsMap.get(URLFields.TIME)) * 1000;
            query.time = DateTimeUtil.momentFromTimeTZ(timeMilis);
        }

        let tripJsonUrl: string | undefined = undefined;
        if (fieldsMap.has(URLFields.TRIP)) {
            tripJsonUrl = decodeURIComponent(fieldsMap.get(URLFields.TRIP)!);
        }

        const tKState = this.props.tKState;
        if (tripJsonUrl) {
            this.loadTripState(tripJsonUrl);
            return;
        }

        tKState.onQueryChange(query);
        if (query.from || fieldsMap.has(URLFields.TIME_PREF) || fieldsMap.has(URLFields.TIME)) {
            tKState.onDirectionsView(true);
        }

        if (query.isComplete(true)) {
            return;
        }

        if (fieldsMap.has(URLFields.SERVICE)) {
            const stopFieldData = this.parseServiceFieldValue(fieldsMap.get(URLFields.SERVICE)!);
            this.loadTimetableState(stopFieldData.regionCode, stopFieldData.stopCode, stopFieldData.filter, stopFieldData.serviceTripID, stopFieldData.startTime);
        }

        // TODO: Check why sometimes map breaks saying style is not loaded (I saw it on tripgo.com).


        // for (const field of Object.values(URLFields)) {
        //     if (fieldsMap.has(field)) {
        //         console.log(fieldsMap.get(field));
        //     }
        // }
    }

    private addField(field: string, value: string, fieldsPath: string): string {
        return fieldsPath
            + (fieldsPath.endsWith(URL_FIELD_SEPARATOR) ? "" : URL_FIELD_SEPARATOR)
            + field + URL_FIELD_VALUE_SEPARATOR + value;
    }

    private getLocationFieldValue(location: Location): string {
        return location.lat + "," + location.lng
            + URL_VALUE_COMPONENT_SEPARATOR + encodeURIComponent(location.address || "")
            + URL_VALUE_COMPONENT_SEPARATOR + encodeURIComponent((location.id ? location.id : ""))
            + URL_VALUE_COMPONENT_SEPARATOR + encodeURIComponent((location.source ? location.source : ""));
    }

    private parseLocationFieldValue(locationS: string): Location {
        const locationValues = locationS.split(URL_VALUE_COMPONENT_SEPARATOR);
        const latLngCoords = locationValues[0].split(",");
        const latLng = locationValues[0] ? LatLng.createLatLng(Number(latLngCoords[0]), Number(latLngCoords[1])) : new LatLng();
        const address = decodeURIComponent(locationValues[1]);
        const id = decodeURIComponent(locationValues[2]);
        const source = decodeURIComponent(locationValues[3]);
        return Location.create(latLng, address, id, "", source);
    }

    private getServiceFieldValue(stop: StopLocation, filter: string, service?: ServiceDeparture): string {
        return RegionsData.instance.getRegion(stop)!.name
            + URL_VALUE_COMPONENT_SEPARATOR + encodeURIComponent(service && service.startStop? service.startStop.code : stop.code)
            + URL_VALUE_COMPONENT_SEPARATOR + encodeURIComponent(filter)
            + (service ? URL_VALUE_COMPONENT_SEPARATOR + encodeURIComponent(service.serviceTripID) + URL_VALUE_COMPONENT_SEPARATOR + service.startTime : "");
    }

    private parseServiceFieldValue(serviceS: string): {regionCode: string, stopCode: string, filter: string, serviceTripID?: string, startTime?: number} {
        const stopComps = serviceS.split(URL_VALUE_COMPONENT_SEPARATOR);
        return {
            regionCode: stopComps[0],
            stopCode: decodeURIComponent(stopComps[1]),
            filter: decodeURIComponent(stopComps[2]),
            ...stopComps.length >= 5 &&
            {
                serviceTripID: decodeURIComponent(stopComps[3]),
                startTime: parseInt(stopComps[4])
            }
        };
    }

    private getTripFieldValue(trip: Trip): string {
        return encodeURIComponent(trip.temporaryURL);
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (this.props.tKState.waitingStateLoad) {
            return;
        }
        const prevUrl = this.getUrlFromState(prevProps.tKState);
        const url = this.getUrlFromState(this.props.tKState);
        if (url !== prevUrl) {
            window.history.replaceState(null, '', url)
        }
    }

    public componentDidMount(): void {
        const sharedTripJsonUrl = TKShareHelper.getSharedTripJsonUrl();
        const tKState = this.props.tKState;
        if (sharedTripJsonUrl) {
            this.loadTripState(sharedTripJsonUrl);
        } else if (TKShareHelper.isSharedStopLink()) {
            const shareLinkPath = decodeURIComponent(document.location.pathname);
            const shareLinkSplit = shareLinkPath.split("/");
            const region = shareLinkSplit[2];
            const stopCode = shareLinkSplit[3];
            this.loadTimetableState(region, stopCode, "");
        } else if (TKShareHelper.isSharedServiceLink()) {
            tKState.onWaitingStateLoad(true);
            const shareLinkPath = decodeURIComponent(document.location.pathname);
            const shareLinkSplit = shareLinkPath.split("/");
            const region = shareLinkSplit[2];
            const stopCode = shareLinkSplit[3];
            const serviceCode = shareLinkSplit[4];
            const initTimeInSecs = parseInt(shareLinkSplit[5]);
            this.loadTimetableState(region, stopCode, "", serviceCode, initTimeInSecs);
        } else if (TKShareHelper.isSharedArrivalLink()) {
            const shareLinkS = document.location.search;
            const queryMap = queryString.parse(shareLinkS.startsWith("?") ? shareLinkS.substr(1) : shareLinkS);
            if (queryMap.lat && queryMap.lng) {
                tKState.onWaitingStateLoad(true);
                const arrivalLoc = Location.create(LatLng.createLatLng(parseFloat(queryMap.lat), parseFloat(queryMap.lng)), "", "", "");
                const geocodingData = new MultiGeocoder(getGeocodingOptions(tKState.config.geocoding));
                geocodingData.reverseGeocode(arrivalLoc, (location: Location | null) => {
                    if (location !== null) {
                        const routingQuery = queryMap.at ? RoutingQuery.create(null,
                            location, TimePreference.ARRIVE,
                            DateTimeUtil.momentFromTimeTZ(parseInt(queryMap.at) * 1000)) :
                            RoutingQuery.create(null, location);
                        tKState.onViewportChange({
                            center: arrivalLoc,
                            zoom: 13
                        });
                        tKState.onQueryChange(routingQuery);
                        if (queryMap.at) {
                            this.setState({directionsView: true})
                        }
                        TKShareHelper.resetToHome();
                    }
                    // reverseGeocode never returns null or an error, but a location with address "Location".
                    tKState.onWaitingStateLoad(false);
                });
            }
        } else if (TKShareHelper.isSharedQueryLink()) {
            const transports = TKShareHelper.parseTransportsQueryParam();
            if (transports) {
                const update = Util.iAssign(tKState.userProfile, {transportOptions: transports});
                tKState.onUserProfileChange(update);
            }
            const query = TKShareHelper.parseSharedQueryLink();
            const viewport = TKShareHelper.parseViewport();
            if (viewport) {
                tKState.onViewportChange(viewport);
            }
            if (query) {
                tKState.onQueryChange(query);
                if (query.from) {
                    tKState.onDirectionsView(true);
                }
            }
        } else {
            this.setStateFromUrl(document.location.pathname);
        }
    }

    private loadTripState(sharedTripJsonUrl) {
        const tKState = this.props.tKState;
        tKState.onWaitingStateLoad(true);
        tKState.onTripJsonUrl(sharedTripJsonUrl)
            .then(() => {
                tKState.onWaitingStateLoad(false);
                tKState.onTripDetailsView(true);
            })
            .catch((error: Error) => tKState.onWaitingStateLoad(false,
                new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
    }

    private loadTimetableState(regionCode: string, stopCode: string, filter: string, serviceID?: string, timeInSecs?: number) {
        const tKState = this.props.tKState;
        tKState.onWaitingStateLoad(true);
        StopsData.instance.getStopFromCode(regionCode, stopCode)
            .then((stop: StopLocation) =>
                RegionsData.instance.requireRegions().then(() => {
                    this.props.tKState.onQueryUpdate({to: stop});
                    if (!serviceID || !timeInSecs) {
                        filter && this.props.tKState.onFilterChange(filter);
                        return this.props.tKState.onStopChange(stop);
                    } else {
                        filter && this.props.tKState.onFilterChange(filter);
                        const initTime = DateTimeUtil.momentFromTimeTZ(timeInSecs * 1000);
                        return this.props.tKState.onFindAndSelectService(stop, serviceID, initTime);
                    }
                }))
            .then(() => tKState.onWaitingStateLoad(false))
            .catch((error: Error) => tKState.onWaitingStateLoad(false,
                new TKError(!serviceID || !timeInSecs ? "Error loading timetable" : "Error loading service",
                    ERROR_LOADING_DEEP_LINK, false)));
    }

    public render(): React.ReactNode {
        return null;
    }

}

export default (props: {}) =>
    <TKStateConsumer>
        {(state: TKState) =>
            <TKStateUrl {...props}
                        tKState={state}
            />
        }
    </TKStateConsumer>
