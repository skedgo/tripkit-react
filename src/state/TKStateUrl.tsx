import * as React from "react";
import {TKState, default as TKStateConsumer} from "../config/TKStateConsumer";
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
import MultiGeocoderOptions from "../geocode/MultiGeocoderOptions";
import Util from "../util/Util";
import {TKError} from "..";
import {ERROR_LOADING_DEEP_LINK} from "../error/TKErrorHelper";

interface IProps {
    tKState: TKState;
}

class TKStateUrl extends React.Component<IProps, {}> {

    private getUrlFromState(state: TKState): string {
        if (state.selectedTrip) {
            return TKShareHelper.getTempShareTripLink(state.selectedTrip);
        }
        if (state.selectedService) {
            return TKShareHelper.getShareService(state.selectedService);
        }
        if (state.stop) {
            return TKShareHelper.getShareTimetable(state.stop);
        }
        if (state.query && !state.query.isEmpty()) {
            return TKShareHelper.getShareQuery(state.query)
        }
        return '/';
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
            tKState.onWaitingStateLoad(true);
            tKState.onTripJsonUrl(sharedTripJsonUrl)
                .then(() => tKState.onWaitingStateLoad(false))
                .catch((error: Error) => tKState.onWaitingStateLoad(false,
                    new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false)));
        } else if (TKShareHelper.isSharedStopLink()) {
            tKState.onWaitingStateLoad(true);
            const shareLinkPath = decodeURIComponent(document.location.pathname);
            const shareLinkSplit = shareLinkPath.split("/");
            const region = shareLinkSplit[2];
            const stopCode = shareLinkSplit[3];
            StopsData.instance.getStopFromCode(region, stopCode)
                .then((stop: StopLocation) =>
                    RegionsData.instance.requireRegions().then(() => {
                        this.props.tKState.onQueryUpdate({to: stop});
                        this.props.tKState.onStopChange(stop);
                    }))
                .then(() => tKState.onWaitingStateLoad(false))
                .catch((error: Error) => tKState.onWaitingStateLoad(false,
                    new TKError("Error loading timetable", ERROR_LOADING_DEEP_LINK, false)));
        } else if (TKShareHelper.isSharedServiceLink()) {
            tKState.onWaitingStateLoad(true);
            const shareLinkPath = decodeURIComponent(document.location.pathname);
            const shareLinkSplit = shareLinkPath.split("/");
            const region = shareLinkSplit[2];
            const stopCode = shareLinkSplit[3];
            const serviceCode = shareLinkSplit[4];
            const initTime = DateTimeUtil.momentFromTimeTZ(parseInt(shareLinkSplit[5]) * 1000);
            StopsData.instance.getStopFromCode(region, stopCode)
                .then((stop: StopLocation) =>
                    RegionsData.instance.requireRegions().then(() => {
                        this.props.tKState.onQueryUpdate({to: stop});
                        return this.props.tKState.onFindAndSelectService(stop, serviceCode, initTime);
                    }))
                .then(() => tKState.onWaitingStateLoad(false))
                .catch((error: Error) => tKState.onWaitingStateLoad(false,
                    new TKError("Error loading service", ERROR_LOADING_DEEP_LINK, false)));
        } else if (TKShareHelper.isSharedArrivalLink()) {
            const shareLinkS = document.location.search;
            const queryMap = queryString.parse(shareLinkS.startsWith("?") ? shareLinkS.substr(1) : shareLinkS);
            if (queryMap.lat && queryMap.lng) {
                tKState.onWaitingStateLoad(true);
                const arrivalLoc = Location.create(LatLng.createLatLng(parseFloat(queryMap.lat), parseFloat(queryMap.lng)), "", "", "");
                const customGeocoders = tKState.config.geocoding ? tKState.config.geocoding.customGeocoders : undefined;
                const geocodingData = new MultiGeocoder(MultiGeocoderOptions.default(false, customGeocoders));
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
        }
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
