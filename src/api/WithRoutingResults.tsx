import React from "react";
import TripGoApi from "./TripGoApi";
import TripGroup from "../model/trip/TripGroup";
import Trip from "../model/trip/Trip";
import {IRoutingResultsContext as RResultsConsumerProps} from "../trip-planner/RoutingResultsProvider";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import {Subtract} from "utility-types";
import RegionsData from "../data/RegionsData";
import NetworkUtil from "../util/NetworkUtil";
import Environment, {Env} from "../env/Environment";
import RoutingResults from "../model/trip/RoutingResults";
import Location from "../model/Location";
import Region from "../model/region/Region";
import LatLng from "../model/LatLng";
import Features from "../env/Features";
import Util from "../util/Util";
import DateTimeUtil from "../util/DateTimeUtil";
import TKShareHelper from "../share/TKShareHelper";
import * as queryString from "query-string";
import MultiGeocoder from "../geocode/MultiGeocoder";
import TKUserProfile from "../model/options/TKUserProfile";
import MapUtil from "../util/MapUtil";
import RegionInfo from "../model/region/RegionInfo";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Segment from "../model/trip/Segment";
import {TKError} from "../error/TKError";
import TripUtil from "../trip/TripUtil";

interface IWithRoutingResultsProps {
    initViewport?: {center?: LatLng, zoom?: number};
    options: TKUserProfile;
    computeModeSets?: (query: RoutingQuery, options: TKUserProfile) => string[][];
    locale?: string;
}

interface IWithRoutingResultsState {
    query: RoutingQuery;
    preFrom?: Location;
    preTo?: Location;
    inputTextFrom: string;
    inputTextTo: string
    viewport?: {center?: LatLng, zoom?: number};
    region?: Region; // Once region gets instantiated (with a valid region), never becomes undefined.
    regionInfo?: RegionInfo;
    directionsView: boolean;    // It means: compute trips for query whenever it is complete.
    trips?: Trip[];
    selected?: Trip;
    tripDetailsView: boolean;
    sort: TripSort;
    waiting: boolean;
    routingError?: TKError;
    waitingTripUpdate: boolean;
    tripUpdateError?: Error;    // When waitingTripUpdate === false, if undefined it indicates success, if not, it gives the error.
    waitingStateLoad: boolean;
    stateLoadError?: Error;
}

export enum TripSort {
    OVERALL = "Preferred",
    TIME = "Arrival",
    DURATION = "Duration",
    PRICE = "Price",
    CARBON = "Greener"
}

// function withRoutingResults<P extends RResultsConsumerProps>(Consumer: React.ComponentType<P>) {
function withRoutingResults<P extends RResultsConsumerProps>(Consumer: any) {

    return class WithRoutingResults extends React.Component<Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps, IWithRoutingResultsState> {

        public realtimeInterval: any;

        constructor(props: Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps) {
            super(props);
            this.state = {
                query: RoutingQuery.create(),
                inputTextFrom: "",
                inputTextTo: "",
                sort: TripSort.OVERALL,
                waiting: false,
                waitingTripUpdate: false,
                viewport: {center: MapUtil.worldCoords, zoom: 2},
                directionsView: false,
                tripDetailsView: false,
                waitingStateLoad: false
            };

            this.onQueryChange = this.onQueryChange.bind(this);
            this.onQueryUpdate = this.onQueryUpdate.bind(this);
            this.onTripJsonUrl = this.onTripJsonUrl.bind(this);
            this.onChange = this.onChange.bind(this);
            this.onSortChange = this.onSortChange.bind(this);
            this.onViewportChange = this.onViewportChange.bind(this);
            this.onDirectionsView = this.onDirectionsView.bind(this);
            this.onTripDetailsView = this.onTripDetailsView.bind(this);
            this.onReqRealtimeFor = this.onReqRealtimeFor.bind(this);
            this.onAlternativeChange = this.onAlternativeChange.bind(this);
            this.onSegmentServiceChange = this.onSegmentServiceChange.bind(this);
            this.refreshRegion = this.refreshRegion.bind(this);
            this.refreshRegionInfo = this.refreshRegionInfo.bind(this);
            this.onWaitingStateLoad = this.onWaitingStateLoad.bind(this);
        }

        public sortTrips(trips: Trip[], sort: TripSort) {
            return trips.slice().sort((t1: Trip, t2: Trip) => {
                switch (sort) {
                    case TripSort.TIME: {
                        return this.state.query.timePref === TimePreference.ARRIVE ?
                            t2.depart - t1.depart : t1.arrive - t2.arrive;
                    }
                    case TripSort.DURATION: {
                        return (t1.arrive - t1.depart) - (t2.arrive - t2.depart);
                    }
                    case TripSort.PRICE: {
                        const t1Cost = t1.moneyCost === null ? Number.MAX_SAFE_INTEGER : t1.moneyCost;
                        const t2Cost = t2.moneyCost === null ? Number.MAX_SAFE_INTEGER : t2.moneyCost;
                        return t1Cost - t2Cost;
                    }
                    case TripSort.CARBON: {
                        return t1.carbonCost - t2.carbonCost;
                    }
                    default: return t1.weightedScore - t2.weightedScore;
                }
            });
        }

        public onQueryChange(query: RoutingQuery) {
            const prevQuery = this.state.query;
            const alreadyOnDirectionsView = this.state.directionsView;
            this.setState({ query: query }, () => {
                this.refreshRegion();
                // TODO: Next logic currently does not depend on this.state.region, although it should (in computeModeSets).
                // In that execute next code after refreshRegion took effect on state.
                if (query.isComplete(true)) {
                    // Just refresh trips if already on directions view when called
                    // onQueryChange. In that case trips will be computed when
                    // this.onDirectionsView(true) is called.
                    if (alreadyOnDirectionsView &&
                        !this.sameApiQueries(prevQuery, this.props.options, query, this.props.options)) { // Avoid requesting routing again if query url didn't change, e.g. dropped location resolved.
                        this.refreshTrips();
                    }
                } else {
                    if (this.state.trips !== undefined) {
                        this.setState({
                            trips: undefined,
                            waiting: false,
                            routingError: undefined
                        });
                    }
                }
            });
        }

        public onQueryUpdate(update: Partial<RoutingQuery>) {
            this.onQueryChange(Util.iAssign(this.state.query, update));
        }

        public onChange(select?: Trip): void {
            this.setState({
                selected: select
            });
            // Clearing selected should also clear realtime update interval.
            if (select === undefined) {
                this.onReqRealtimeFor(undefined);
            }
        }

        public onSortChange(sort: TripSort): void {
            this.setState((prev: IWithRoutingResultsState) => ({
                sort: sort,
                trips: prev.trips && this.sortTrips(prev.trips, sort)
            }));
        }

        public onViewportChange(viewport: {center?: LatLng, zoom?: number}) {
            this.setState({viewport: viewport}, () => this.refreshRegion());
        }

        public onDirectionsView(directionsView: boolean) {
            if (this.state.directionsView !== directionsView) {
                this.setState({directionsView: directionsView}, () => {
                    if (this.state.query.isComplete(true) && this.state.directionsView) {
                        this.refreshTrips();
                    }
                });
            }
        }

        public onTripDetailsView(tripDetailsView: boolean) {
            if (this.state.tripDetailsView !== tripDetailsView) {
                this.setState({ tripDetailsView: tripDetailsView });
            }
        }

        public refreshRegion() {
            const query = this.state.query;
            const viewport = this.state.viewport;
            // Just trigger region change from viewport change if zoom is greater then 6 (avoids moving on zoom out viewport to pass through multiple regions, and avoids initial world zoom to set region).
            const referenceLatLng = query.from && query.from.isResolved() ? query.from :
                (query.to && query.to.isResolved() ? query.to :
                    // The viewport center is worldCoords initially, don't use it as reference
                    (viewport && viewport.center
                    && JSON.stringify(viewport.center) !== JSON.stringify(MapUtil.worldCoords)
                    && viewport.zoom && viewport.zoom > 6 ? // avoids region change when moving map zoomed out, including on initial world zoom.
                        viewport.center : undefined));
            RegionsData.instance.requireRegions().then(() => {
                if (referenceLatLng) {
                    RegionsData.instance.getCloserRegionP(referenceLatLng).then((region: Region) => {
                        if (region.polygon === "") {
                            Util.log("empty region");
                        }
                        if (this.state.region === region) {
                            return;
                        }
                        this.setState({region: region},
                            () => this.refreshRegionInfo());
                    });
                } else if (RegionsData.instance.getRegionList()!.length === 1 // Singleton region
                    && this.state.region !== RegionsData.instance.getRegionList()![0]) {
                    this.setState({region: RegionsData.instance.getRegionList()![0]},
                        () => this.refreshRegionInfo());
                }
            });
        }

        public refreshRegionInfo() {
            if (this.state.region && (!this.state.regionInfo || this.state.region.name !== this.state.regionInfo.code)) {
                // this.setState({regionInfo: undefined});
                RegionsData.instance.getRegionInfoP(this.state.region.name)
                    .then((regionInfo: RegionInfo) => this.setState(() => ({regionInfo: regionInfo})));
            }
        }

        public refreshTrips() {
            const query = this.state.query;
            const options = this.props.options;
            this.setState({
                trips: [],
                waiting: true,
                routingError: undefined
            });
            this.computeTrips(query)
                .then((tripPromises: Array<Promise<Trip[]>>) => {
                    if (tripPromises.length === 0) {
                        this.setState({waiting: false});
                        return;
                    }
                    const waitingState = {
                        query: query,
                        options: options,
                        remaining: tripPromises.length
                    };
                    tripPromises.map((tripsP: Promise<Trip[]>) => tripsP.then((trips: Trip[]) => {
                        if (!this.sameApiQueries(this.state.query, this.props.options, query, options)) {
                            return;
                        }
                        if (trips !== null && this.state.trips !== null) {
                            trips = trips.filter((trip: Trip) => !this.alreadyAnEquivalent(trip, this.state.trips!))
                        }
                        this.setState(prevState => {
                            return {trips: this.sortTrips(prevState.trips!.concat(trips), this.state.sort)}
                        });
                        this.checkWaiting(waitingState)
                    }).catch((error: TKError) => {
                        Util.log(error, Env.PRODUCTION);
                        this.checkWaiting(waitingState);
                        this.setState({routingError: error});
                    }))
                });
        }

        public checkWaiting(waitingState: any) {
            if (!this.sameApiQueries(this.state.query, this.props.options, waitingState.query, waitingState.options)) {
                return;
            }
            waitingState.remaining--;
            if (waitingState.remaining === 0) {
                this.setState({waiting: false});
            }
        }

        public alreadyAnEquivalent(newTrip: Trip, trips:Trip[]): boolean {
            return !!trips.find((trip: Trip) => this.equivalentTrips(trip, newTrip));
        }

        public equivalentTrips(tripA: Trip, tripB: Trip): boolean {
            return tripA.depart === tripB.depart &&
                tripA.arrive === tripB.arrive &&
                tripA.weightedScore === tripB.weightedScore &&
                tripA.caloriesCost === tripB.caloriesCost &&
                tripA.carbonCost === tripB.carbonCost &&
                tripA.hassleCost === tripB.hassleCost &&
                tripA.segments.length === tripB.segments.length;
        }

        public onReqRealtimeFor(selected?: Trip) {
            if (this.realtimeInterval) {
                clearInterval(this.realtimeInterval);
            }
            if (!Features.instance.realtimeEnabled()) {
                return;
            }
            if (!selected || !selected.updateURL) {  // No realtime data for the trip.
                return;
            }
            this.realtimeInterval = setInterval(() => {
                const updateURL = selected.updateURL;
                TripGoApi.updateRT(selected, this.state.query)
                    .then((tripUpdate: Trip | undefined) => {
                        // updateURL !== selected.updateURL will happen if selected trip group changed selected
                        // alternative, so shouldn't update.
                        if (!tripUpdate || updateURL !== selected.updateURL) {
                            return;
                        }
                        const selectedTGroup = selected as TripGroup;
                        selectedTGroup.replaceAlternative(selectedTGroup.getSelectedTrip(), tripUpdate);
                        this.setState({});
                    });
            }, 10000);
        }

        public onAlternativeChange(group: TripGroup, alt: Trip) {
            if (group.trips.indexOf(alt) !== -1) {
                group.setSelected(group.trips.indexOf(alt));
                this.setState({});
                return;
            }
        }

        public onSegmentServiceChange(segment: Segment, service: ServiceDeparture, callback: () => void) {
            const selectedTrip = this.state.selected;
            if (!selectedTrip) {
                return;
            }

            // Find if there's already a trip for that service among selected trip alternatives.
            const selectedTripGroup = selectedTrip as TripGroup;
            for (const alternative of selectedTripGroup.trips) {
                for (const altSegment of alternative.segments) {
                    if (TripUtil.sameService(altSegment, service)) {
                        this.onAlternativeChange(selectedTripGroup, alternative);
                        callback && callback();
                        return;
                    }
                }
            }

            // Compute trip involving service through waypoints.json endpoint.
            this.setState({waitingTripUpdate: true, tripUpdateError: undefined});
            const waypointSegments: any[] = [];
            for (const tripSegment of selectedTrip.segments) {
                if (!tripSegment.modeIdentifier) {
                    continue;
                }
                let waypointSegment: any;
                if (tripSegment.serviceTripID && tripSegment.serviceTripID === segment.serviceTripID) {
                    const segmentRegions = RegionsData.instance.getSegmentRegions(segment);
                    waypointSegment = {
                        start: service.startStopCode,
                        end: service.endStopCode,
                        modes: [tripSegment.modeIdentifier],
                        startTime: service.startTime,
                        endTime: service.endTime,
                        serviceTripID: service.serviceTripID,
                        operator: service.operator,
                        region: segmentRegions[0].name,
                        ...segmentRegions[0] !== segmentRegions[1] ? {
                            disembarkationRegion: segmentRegions[1].name
                        } : undefined
                    };
                } else {
                    const startLoc = tripSegment.from;
                    const endLoc = tripSegment.to;
                    waypointSegment = {
                        start: "(" + startLoc.lat + "," + startLoc.lng + ")",
                        end: "(" + endLoc.lat + "," + endLoc.lng + ")",
                        modes: [tripSegment.modeIdentifier]
                    }
                }
                waypointSegments.push(waypointSegment);
            }
            const requestBody = {
                config: {v: 11},
                segments: waypointSegments
            };
            TripGoApi.apiCallT("waypoint.json", NetworkUtil.MethodType.POST, RoutingResults, requestBody)
                .then((result: RoutingResults) => {
                    const tripAlternative = result.groups[0].trips[0];
                    // Set trip alternative queryTime and queryIsLeaveAfter with values of the original group, that is,
                    // consider as if the alternative trip came originally with the group. This ensures it's properly
                    // classified as a past or future trip by comparing trip departure time with query time (TKUITripRow).
                    // TODO: an alternative is to save original query on trip.query and use that instead of trip.queryTime
                    // and trip.queryIsLeaveAfter. Other relevant cases to check:
                    // - realtime trip udpates: confirmed that queryTime coming with update coincides with original query time.
                    // - load shared trip.
                    const referenceTrip = selectedTripGroup.trips.length > 0 && selectedTripGroup.trips[0];
                    if (referenceTrip) {
                        tripAlternative.queryTime = referenceTrip.queryTime;
                        tripAlternative.queryIsLeaveAfter = referenceTrip.queryIsLeaveAfter;
                    }
                    selectedTripGroup.trips.push(tripAlternative);
                    const sorting = (t1: Trip, t2: Trip) => {
                        return t1.weightedScore - t2.weightedScore;
                    };
                    selectedTripGroup.trips.sort(sorting);
                    this.onAlternativeChange(selectedTripGroup, tripAlternative);
                    this.setState({waitingTripUpdate: false});
                })
                .catch(() => this.setState({waitingTripUpdate: false, tripUpdateError: new TKError("Error updating trip")}))
                .finally(() => callback && callback());
        };

        public onWaitingStateLoad(waiting: boolean, error?: Error) {
            this.setState({
                waitingStateLoad: waiting,
                stateLoadError: error
            });
        }

        public render(): React.ReactNode {
            const props = this.props as IWithRoutingResultsProps;
            return <Consumer
                {...props}
                query={this.state.query}
                onQueryChange={this.onQueryChange}
                onQueryUpdate={this.onQueryUpdate}
                onTripJsonUrl={this.onTripJsonUrl}
                preFrom={this.state.preFrom}
                preTo={this.state.preTo}
                onPreChange={(from: boolean, location?: Location) => {
                    if (from) {
                        this.setState({preFrom: location})
                    } else {
                        this.setState({preTo: location})
                    }
                }}
                inputTextFrom={this.state.inputTextFrom}
                inputTextTo={this.state.inputTextTo}
                onInputTextChange={(from: boolean, text: string) => {
                    if (from) {
                        this.setState({inputTextFrom: text});
                    } else {
                        this.setState({inputTextTo: text});
                    }
                }}
                region={this.state.region}
                regionInfo={this.state.regionInfo}
                viewport={this.state.viewport}
                onViewportChange={this.onViewportChange}
                directionsView={this.state.directionsView}
                onDirectionsView={this.onDirectionsView}
                trips={this.state.trips}
                waiting={this.state.waiting}
                routingError={this.state.routingError}
                waitingTripUpdate={this.state.waitingTripUpdate}
                tripUpdateError={this.state.tripUpdateError}
                selectedTrip={this.state.selected}
                onChange={this.onChange}
                tripDetailsView={this.state.tripDetailsView}
                onTripDetailsView={this.onTripDetailsView}
                sort={this.state.sort}
                onSortChange={this.onSortChange}
                onReqRealtimeFor={this.onReqRealtimeFor}
                onAlternativeChange={this.onAlternativeChange}
                onSegmentServiceChange={this.onSegmentServiceChange}
                waitingStateLoad={this.state.waitingStateLoad}
                stateLoadError={this.state.stateLoadError}
                onWaitingStateLoad={this.onWaitingStateLoad}
            />;
        }


        public componentDidMount(): void {
            if (this.props.initViewport) {
                this.onViewportChange(this.props.initViewport);
            }
            this.refreshRegion();
        }

        public onTripJsonUrl(tripUrl: string): Promise<void> {
            return TripGoApi.apiCallUrlT(tripUrl, NetworkUtil.MethodType.GET, RoutingResults)
                .then((routingResults: RoutingResults) => {
                    const firstTrip = routingResults.groups[0].trips[0];
                    const from = firstTrip.segments[0].from;
                    const to = firstTrip.segments[firstTrip.segments.length - 1].to;
                    const query = RoutingQuery.create(from, to,
                        firstTrip.queryIsLeaveAfter ? TimePreference.LEAVE : TimePreference.ARRIVE,
                        firstTrip.queryTime ? DateTimeUtil.momentFromTimeTZ(firstTrip.queryTime * 1000) : undefined);
                    routingResults.setQuery(query);
                    routingResults.setSatappQuery(tripUrl);
                    const trips = routingResults.groups;
                    const sortedTrips = this.sortTrips(trips, this.state.sort);
                    this.setState({
                        query: query,
                        trips: sortedTrips,
                        selected: sortedTrips[0],
                        directionsView: true
                    });
                });
        }

        public componentDidUpdate(prevProps: Readonly<Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps>,
                                  prevState: Readonly<IWithRoutingResultsState>): void {
            if (this.props.options !== prevProps.options &&
                this.state.query.isComplete(true) && this.state.directionsView &&
                !this.sameApiQueries(this.state.query, prevProps.options, this.state.query, this.props.options)) {
                this.refreshTrips();
            }
            // Clear selected
            if (prevState.trips !== this.state.trips) {
                if (!this.state.trips || this.state.trips.length === 0) {
                    this.onChange(undefined);
                }
            }
        }

        public sameApiQueries(q1: RoutingQuery, opts1: TKUserProfile, q2: RoutingQuery, opts2: TKUserProfile): boolean {
            // To avoid considering 2 queries as different because timepref is NOW and RoutingQuery.time is
            // computed on call, using DateTimeUtil.getNow(), so with bad luck will fall on different seconds.
            // if (q1.timePref === TimePreference.NOW && q2.timePref === TimePreference.NOW) {
            //     const fixedNow = DateTimeUtil.getNow();
            //     q1 = Util.iAssign(q1, {timePref: TimePreference.LEAVE, time: fixedNow});
            //     q2 = Util.iAssign(q2, {timePref: TimePreference.LEAVE, time: fixedNow});
            // }
            let modeSetsQ1;
            let modeSetsQ2;
            const regionQ1 = this.getQueryRegion(q1);
            const regionQ2 = this.getQueryRegion(q2);
            if (RegionsData.instance.hasRegions()) {
                const computeModeSetsFc = this.props.computeModeSets ? this.props.computeModeSets! : this.computeModeSets;
                modeSetsQ1 = computeModeSetsFc(q1, opts1);
                modeSetsQ2 = computeModeSetsFc(q2, opts2);
            } else {
                modeSetsQ1 = [[]]; // Put empty set to put something if called with no region,
                modeSetsQ2 = [[]]; // which happens when checking if same query on TripPlanner.componentDidMount
            }
            const q1Urls = modeSetsQ1.map((modeSet: string[]) => {
                return q1.getQueryUrl(modeSet, opts1, regionQ1 && RegionsData.instance.getRegionInfo(regionQ1.name));
            });
            const q2Urls = modeSetsQ2.map((modeSet: string[]) => {
                return q2.getQueryUrl(modeSet, opts2, regionQ2 && RegionsData.instance.getRegionInfo(regionQ2.name));
            });
            return JSON.stringify(q1Urls) === JSON.stringify(q2Urls);
        }

        public getQueryUrlsWaitRegions(query: RoutingQuery): Promise<string[]> {
            return RegionsData.instance.requireRegions().then(() => {
                const queryRegion = this.getQueryRegion(query)!;
                // Waiting for region info is not necessary if I send all avoid modes, which may include modes that are
                // not present in the region.
                return RegionsData.instance.getRegionInfoP(queryRegion.name).then((regionInfo: RegionInfo) => {
                    const computeModeSetsFc = this.props.computeModeSets ? this.props.computeModeSets! : this.computeModeSets;
                    return computeModeSetsFc(query, this.props.options).map((modeSet: string[]) => {
                        return query.getQueryUrl(modeSet, this.props.options, regionInfo);
                    });
                });
            });
        }

        public computeModeSets(query: RoutingQuery, options: TKUserProfile): string[][] {
            const referenceLatLng = query.from && query.from.isResolved() ? query.from : (query.to && query.to.isResolved() ? query.to : undefined);
            if (!referenceLatLng) {
                return [];
            }
            const region = RegionsData.instance.getRegion(referenceLatLng);
            if (!region) {
                return [];
            }
            const modes = region.modes;
            const enabledModes = modes.filter((mode: string) =>
                (options.transportOptions.isModeEnabled(mode)
                    || (mode === "wa_wal" && options.wheelchair))  // send wa_wal as mode when wheelchair is true.
            );
            const modeSets = enabledModes.map((mode: string) => [mode]);
            const multiModalSet: string[] = enabledModes.slice();
            if (multiModalSet.length > 1) {
                modeSets.push(multiModalSet);
            }
            return modeSets;
        }

        public computeTrips(query: RoutingQuery): Promise<Array<Promise<Trip[]>>> {
            const routingPromises: Promise<Array<Promise<Trip[]>>> = this.getQueryUrlsWaitRegions(query).then((queryUrls: string[]) => {
                return queryUrls.length === 0 ? [] : queryUrls.map((endpoint: string) => {
                    return TripGoApi.apiCall(endpoint, NetworkUtil.MethodType.GET, undefined, false)
                        .then((routingResultsJson: any) => {
                            if (routingResultsJson.error) {
                                throw new TKError(routingResultsJson.error, routingResultsJson.errorCode.toString(), routingResultsJson.usererror);
                            }
                            const routingResults: RoutingResults = Util.deserialize(routingResultsJson, RoutingResults);
                            routingResults.setQuery(query);
                            routingResults.setSatappQuery(TripGoApi.getSatappUrl(endpoint));
                            return routingResults.groups;
                        })
                        .catch(reason => {
                            if (Environment.isDevAnd(false)) {
                                const routingResults: RoutingResults = Util.deserialize(this.getRoutingResultsJSONTest(), RoutingResults);
                                return routingResults.groups;
                            }
                            throw reason.code ? reason : new TKError(reason.message);
                        });
                });
            });
            return routingPromises;
        }

        public getQueryRegion(query: RoutingQuery): Region | undefined {
            const referenceLatLng = query.from && query.from.isResolved() ? query.from :
                (query.to && query.to.isResolved() ? query.to : undefined);
            return referenceLatLng && RegionsData.instance.getRegion(referenceLatLng);
        }

        public getRoutingResultsJSONTest(): any {
            // const jsonS = '{"groups":[{"sources":[{"disclaimer":"OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.","provider":{"name":"OpenStreetMap","website":"https://www.openstreetmap.org"}}],"trips":[{"arrive":1535501699,"availability":"AVAILABLE","caloriesCost":246,"carbonCost":0,"currencySymbol":"$","depart":1535495684,"hassleCost":0,"mainSegmentHashCode":-589341551,"moneyCost":0,"moneyUSDCost":0,"plannedURL":"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142","queryIsLeaveAfter":true,"queryTime":1535495684,"saveURL":"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142","segments":[{"availability":"AVAILABLE","endTime":1535501699,"segmentTemplateHashCode":-589341551,"startTime":1535495684}],"temporaryURL":"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142","weightedScore":47}]}],"region":"AU_ACT_Canberra","regions":["AU_ACT_Canberra"],"segmentTemplates":[{"action":"Walk<DURATION>","from":{"class":"Location","lat":-35.28192,"lng":149.1285,"timezone":"Australia/Sydney"},"hashCode":-589341551,"metres":6789,"mini":{"description":"Charlotte Street & Scarborough Street","instruction":"Walk","mainValue":"7.0km"},"modeIdentifier":"wa_wal","modeInfo":{"alt":"Walk","color":{"blue":99,"green":199,"red":30},"identifier":"wa_wal","localIcon":"walk"},"notes":"7.0km","streets":[{"encodedWaypoints":"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB","metres":6784}],"to":{"address":"Charlotte Street & Scarborough Street","class":"Location","lat":-35.33416,"lng":149.12386,"timezone":"Australia/Sydney"},"travelDirection":180,"turn-by-turn":"WALKING","type":"unscheduled","visibility":"in summary"}]}';
            const jsonS = "{\"groups\":[{\"sources\":[{\"disclaimer\":\"\\u00a9 OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.\",\"provider\":{\"name\":\"OpenStreetMap\",\"website\":\"https://www.openstreetmap.org\"}}],\"trips\":[{\"arrive\":1535501699,\"availability\":\"AVAILABLE\",\"caloriesCost\":246,\"carbonCost\":0,\"currencySymbol\":\"$\",\"depart\":1535495684,\"hassleCost\":0,\"mainSegmentHashCode\":-589341551,\"moneyCost\":0,\"moneyUSDCost\":0,\"plannedURL\":\"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142\",\"queryIsLeaveAfter\":true,\"queryTime\":1535495684,\"saveURL\":\"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142\",\"segments\":[{\"availability\":\"AVAILABLE\",\"endTime\":1535501699,\"segmentTemplateHashCode\":-589341551,\"startTime\":1535495684}],\"temporaryURL\":\"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142\",\"weightedScore\":47}]}],\"region\":\"AU_ACT_Canberra\",\"regions\":[\"AU_ACT_Canberra\"],\"segmentTemplates\":[{\"action\":\"Walk<DURATION>\",\"from\":{\"class\":\"Location\",\"lat\":-35.28192,\"lng\":149.1285,\"timezone\":\"Australia/Sydney\"},\"hashCode\":-589341551,\"metres\":6789,\"mini\":{\"description\":\"Charlotte Street & Scarborough Street\",\"instruction\":\"Walk\",\"mainValue\":\"7.0km\"},\"modeIdentifier\":\"wa_wal\",\"modeInfo\":{\"alt\":\"Walk\",\"color\":{\"blue\":99,\"green\":199,\"red\":30},\"identifier\":\"wa_wal\",\"localIcon\":\"walk\"},\"notes\":\"7.0km\",\"streets\":[{\"encodedWaypoints\":\"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB\",\"metres\":6784}],\"to\":{\"address\":\"Charlotte Street & Scarborough Street\",\"class\":\"Location\",\"lat\":-35.33416,\"lng\":149.12386,\"timezone\":\"Australia/Sydney\"},\"travelDirection\":180,\"turn-by-turn\":\"WALKING\",\"type\":\"unscheduled\",\"visibility\":\"in summary\"}]}";
            return JSON.parse(jsonS);
        }
    }
}

export default withRoutingResults;