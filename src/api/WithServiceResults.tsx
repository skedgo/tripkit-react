import * as React from "react";
import {Moment} from "moment-timezone";
import Segment from "../model/trip/Segment";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {Subtract} from "utility-types";
import DateTimeUtil from "../util/DateTimeUtil";
import RegionsData from "../data/RegionsData";
import TripGoApi from "./TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import ServiceDeparturesResult from "../model/service/ServiceDeparturesResult";
import Features from "../env/Features";
import Service from "../model/service/Service";
import LatestResult from "../model/service/LatestResult";
import {IServiceResultsContext as IServiceResConsumerProps} from "../service/ServiceResultsProvider";
import StopLocation from "../model/StopLocation";
import ServiceDetail from "../model/service/ServiceDetail";
import {EventEmitter} from "fbemitter";
import TKShareHelper from "../share/TKShareHelper";
import StopsData from "../data/StopsData";

interface IWithServiceResultsProps {
    // TODO: Move to state, as startStop
    segment?: Segment;
}

interface IWithServiceResultsState {
    startStop?: StopLocation;
    initTime: Moment;       // Default to now - 30mins(?)
    departures: ServiceDeparture[];    // It's sorted.
    selected?: ServiceDeparture;
    filter: string;
    departuresFiltered: ServiceDeparture[];
    displayLimit: number;
    initTimeChanged: boolean;
}


// function withServiceResults<P extends IServiceResConsumerProps>(Consumer: React.ComponentType<P>) {
function withServiceResults<P extends IServiceResConsumerProps>(Consumer: React.ComponentType<any>) {

    return class WithServiceResults extends React.Component<Subtract<P, IServiceResConsumerProps> & IWithServiceResultsProps, IWithServiceResultsState> {

        public readonly idealMinDisplayed = 15;

        public requestsWithoutNewResults = 0;
        public prevFilter = "";
        public prevDeparturesCount = -1;

        public awaitingRealtime = false;
        public rTSchedule: any;

        public eventBus: EventEmitter = new EventEmitter();

        constructor(props: Subtract<P, IServiceResConsumerProps> & IWithServiceResultsProps) {
            super(props);
            // TODO in GWT implementation initialTime has the proper timezone
            const now = DateTimeUtil.getNow();
            let initialTime;
            if (props.segment) {
                initialTime = DateTimeUtil.momentTZTime(props.segment.startTime * 1000).add(-30, 'm');
                if (initialTime.isBefore(now)) {
                    initialTime = now;
                }
            } else {
                initialTime = now.add(-15, 'm');
            }
            this.state = {
                initTime: initialTime,
                departures: [],
                filter: "",
                departuresFiltered: [],
                displayLimit: 0,
                initTimeChanged: false
            };

            if (TKShareHelper.isSharedStopLink()) {
                const shareLinkPath = decodeURIComponent(document.location.pathname);
                const shareLinkSplit = shareLinkPath.split("/");
                const region = shareLinkSplit[2];
                const stopCode = shareLinkSplit[3];
                StopsData.instance.getStopFromCode(region, stopCode)
                    .then((stop: StopLocation) =>
                        RegionsData.instance.requireRegions().then(() => this.onStopChange(stop)));
            }

            if (TKShareHelper.isSharedServiceLink()) {
                const shareLinkPath = decodeURIComponent(document.location.pathname);
                const shareLinkSplit = shareLinkPath.split("/");
                const region = shareLinkSplit[2];
                const stopCode = shareLinkSplit[3];
                const serviceCode = shareLinkSplit[4];
                const initTime = DateTimeUtil.momentTZTime(parseInt(shareLinkSplit[5]) * 1000);
                StopsData.instance.getStopFromCode(region, stopCode)
                    .then((stop: StopLocation) =>
                        RegionsData.instance.requireRegions().then(() => {
                                this.setState({
                                    startStop: stop,
                                    initTime: initTime,
                                    departures: [],
                                    departuresFiltered: [],
                                    displayLimit: 0,
                                    initTimeChanged: true
                                }, () => {
                                    this.requestUntilServiceFound(serviceCode);
                                });
                            }
                        ));
            }

            this.rTSchedule = setInterval(() => {
                // TODO:
                // fireValueChangeEvent(); //to update 'time to depart' labels
                if (Features.instance.realtimeEnabled()) {
                    this.realtimeUpdate();
                }
            }, 10000);

            this.requestMoreDepartures = this.requestMoreDepartures.bind(this);
            this.onFilterChange = this.onFilterChange.bind(this);
            this.onInitTimeChange = this.onInitTimeChange.bind(this);
            this.onServiceSelection = this.onServiceSelection.bind(this);
            this.onStopChange = this.onStopChange.bind(this);
        }

        public requestMoreDepartures() {
            this.setState(() => {
                if (this.isWaiting()) {
                    return; // We are already awaiting for previously requested departures
                }
                this.setState({ displayLimit: this.state.displayLimit + this.getDisplaySnap() }, () => {
                    this.coverDisplayLimit()
                });
            })
        }

        public onFilterChange(filter: string) {
            this.setState({
                filter: filter,
                displayLimit: this.idealMinDisplayed
            });
            this.applyFilter(() => this.coverDisplayLimit());
        }

        public getDisplaySnap(): number {
            // TODO: check if it should be as follows, but may trigger a lot of requests, should set a max, say, 4 times.
            // return 45 * Math.max(this.state.departures.length / (this.state.departuresFiltered.length + 1), 1);
            return 45 * Math.max(this.state.departuresFiltered.length / (this.state.departures.length + 1), 1);
        }

        public getDisplayDepartures(): ServiceDeparture[] {
            return this.state.departuresFiltered.slice(0, this.state.displayLimit);
        }

        public isWaiting(): boolean {
            return this.state.displayLimit > this.state.departuresFiltered.length;
        }

        public onInitTimeChange(initTime: Moment) {
            this.setState({
                initTime: initTime,
                departures: [],
                departuresFiltered: [],
                displayLimit: 0,
                initTimeChanged: true
            }, () => {
                this.requestMoreDepartures();
            });
        }

        public onServiceSelection(departure?: ServiceDeparture) {
            this.setState({selected: departure});
            if (!departure || departure.serviceDetail) {
                return
            }
            const endpoint = "service.json"
                + "?region=" + RegionsData.instance.getRegion(departure.startStop!)!.name
                + "&serviceTripID=" + departure.serviceTripID
                + "&startStopCode=" + departure.startStopCode
                + "&embarkationDate=" + departure.startTime
                + "&encode=true";
            TripGoApi.apiCallT(endpoint, NetworkUtil.MethodType.GET, ServiceDetail)
                .then((result: ServiceDetail) => {
                        // if (result.isError()) {
                        //     throw new Error("Error loading departures.");
                        // }
                        const departureUpdate = departure;
                        departureUpdate.serviceDetail = result;
                        if (departure === this.state.selected) {
                            this.setState({selected: departureUpdate});
                        }
                    }
                );
        }

        public onStopChange(stop?: StopLocation) {
            this.setState({startStop: stop}, () => {
                if (stop) {
                    this.onInitTimeChange(DateTimeUtil.getNow().add(-15, 'm'));
                }
            })
        }

        public render(): React.ReactNode {
            const {...props} = this.props as IWithServiceResultsProps;
            const startStop = this.state.startStop;
            return <Consumer {...props}
                             stop={startStop}
                             onStopChange={this.onStopChange}
                             onRequestMore={this.requestMoreDepartures}
                             departures={this.getDisplayDepartures()}
                             waiting={this.isWaiting()}
                             onFilterChange={this.onFilterChange}
                             title={startStop ? (startStop.shortName ? startStop.shortName : startStop.name): ""}
                             initTime={this.state.initTimeChanged ? this.state.initTime : DateTimeUtil.getNow()}
                             onInitTimeChange={this.onInitTimeChange}
                             selectedService={this.state.selected}
                             onServiceSelection={this.onServiceSelection}
                             servicesEventBus={this.eventBus}
            />;
        }

        /**
         * requesting departures if those
         * matching the filter are not enough to fill the scroll panel.
         */
        public coverDisplayLimit() {
            if (this.state.displayLimit <= this.state.departuresFiltered.length) {
                this.prevDeparturesCount = this.state.departuresFiltered.length;
                return;
            }

            // Set a limit to the number of consecutive requests that do not bring new results. Specially for the case of no results displayed at all.
            if (this.state.departuresFiltered.length < this.idealMinDisplayed && this.prevDeparturesCount === this.state.departuresFiltered.length && this.state.filter.startsWith(this.prevFilter)) {
                this.requestsWithoutNewResults++;
            } else {
                this.requestsWithoutNewResults = 0;
            }

            this.prevDeparturesCount = this.state.departuresFiltered.length;
            this.prevFilter = this.state.filter;

            if (this.requestsWithoutNewResults >= 6 || (this.requestsWithoutNewResults >= 3 && this.state.departuresFiltered.length === 0)) {
                this.setState((prev: IWithServiceResultsState) => {
                    return { displayLimit: prev.departuresFiltered.length }
                });
                return;
            }

            this.requestDepartures().then((results: ServiceDeparture[]) => {
                this.setState((prev: IWithServiceResultsState) => {
                    this.updateDepartures(prev.departures.concat(results), () => this.coverDisplayLimit());
                });
            });
        }

        public updateDepartures(departures: ServiceDeparture[], callback?: () => void) {
            const departuresUpdate = WithServiceResults.sortDepartures(departures);
            this.setState({
                departures: departuresUpdate
            });
            this.applyFilter(callback);
        }

        public applyFilter(callback?: () => void) {
            this.setState((prevState: IWithServiceResultsState) => {
                return {
                    departuresFiltered: prevState.departures.filter((departure: ServiceDeparture) =>
                        this.matchesFilter(departure, prevState.filter))
                }
            }, callback);
        }

        public static sortDepartures(departures: ServiceDeparture[]): ServiceDeparture[] {
            return departures.slice().sort((s1: ServiceDeparture, s2: ServiceDeparture) => {
                return s1.actualStartTime - s2.actualStartTime;
            });
        }

        public requestDepartures(): Promise<ServiceDeparture[]> {
            let startStopCode = this.state.startStop!.code;
            const startRegionCode = RegionsData.instance.getRegion(this.state.startStop!)!.name;
            // Remove 'Region_Code-' from stop codes. Shouldn't come from backend anymore
            if (startStopCode.startsWith(startRegionCode + "-")) {
                startStopCode = startStopCode.substring((startRegionCode + "-").length);
            }
            const stopIDs = [startStopCode];
            // TODO: re-enable when implementing segment services.
            // const endStopIDs = [];
            // let disembarkationRegionCode: string | undefined = undefined;
            // if (this.props.segment) {
            // RegionsData.SegmentRegions segmentRegions = UserData.getRegionsData().getSegmentRegions(segment);
            // startRegionCode = segmentRegions.getStartRegion().getCode();
            // disembarkationRegionCode = !segmentRegions.getStartRegion().equals(segmentRegions.getEndRegion()) ?
            //     segmentRegions.getEndRegion().getCode() : null;
            // endStopIDs = Collections.singletonList(segment.getContinuationEndStopCode());
            // }
            const lastDepartureDate = this.getLastDepartureTime();
            const initialTimeAtRequest = this.state.initTime;
            const departuresRequest = {
                region: startRegionCode,
                embarkationStops: stopIDs,
                timeStamp: lastDepartureDate
            };
            return TripGoApi.apiCallT("departures.json", NetworkUtil.MethodType.POST, ServiceDeparturesResult, departuresRequest)
                .then((departuresResult: ServiceDeparturesResult) => {
                        // Initial time changed, which triggered a clear, so should discard these results
                        if (!initialTimeAtRequest.isSame(this.state.initTime)) {
                            throw new Error("Results form an old request.");
                        }
                        if (departuresResult.isError()) {
                            throw new Error("Error loading departures.");
                        }
                        return departuresResult.getDepartures(this.state.startStop!);
                    }
                );
        }

        public getLastDepartureTime(): number {
            let lastDepartureDate;
            if (this.state.departures.length === 0) {
                lastDepartureDate = Math.floor(this.state.initTime.valueOf() / 1000);
            }  else {
                lastDepartureDate = Math.floor(this.state.departures[this.state.departures.length - 1].startTime) + 1;
            }
            return lastDepartureDate;
        }

        public matchesFilter(departure: ServiceDeparture, filter: string): boolean {
            const filterSplit = filter.toLowerCase().split(" ");
            const shortName = departure.startStop ? departure.startStop.name.toLowerCase() : "";
            const serviceName = departure.serviceName ? departure.serviceName.toLowerCase() : "";
            const serviceNumber = departure.serviceNumber ? departure.serviceNumber.toLowerCase() : "";
            const serviceDirection = departure.serviceDirection ? departure.serviceDirection.toLowerCase() : "";
            return filterSplit.every((filterPart: string) =>
                (shortName + serviceName + serviceNumber + serviceDirection).includes(filterPart)
            );
        }

        public realtimeUpdate() {
            if (this.awaitingRealtime) {
                return;
            }

            const departures = this.getDisplayDepartures();

            if (departures.length === 0) {
                return;
            }

            const departuresToUpdate = departures.slice(0, 50);

            const startRegionCode = RegionsData.instance.getRegion(this.state.startStop!)!.name;
            const startStopCode = this.state.startStop!.code;
            const services = departuresToUpdate.filter((departure: ServiceDeparture) => {
                return departure.realTimeStatus === "IS_REAL_TIME";
            }).map((departure: ServiceDeparture) => {
                const service = new Service();
                service.serviceTripID = departure.serviceTripID;
                service.startStopCode = departure.startStopCode ? departure.startStopCode : startStopCode;
                // service.endStopCode = departure.endStopCode
                service.operator = departure.operator;
                service.startTime = departure.startTime;
                return service;
            });

            if (services.length === 0) {
                return;
            }

            this.awaitingRealtime = true;

            TripGoApi.apiCallT("latest.json", NetworkUtil.MethodType.POST, LatestResult,
                {
                    region: startRegionCode,
                    services: services
                }).then((result: LatestResult) => {
                    this.awaitingRealtime = false;
                    const servicesById: Map<string, Service> = new Map<string, Service>();
                    for (const service of result.services) {
                        servicesById.set(service.serviceTripID, service);
                    }
                    for (const departure of this.state.departures) {
                        // Remove realtime entry once applied to avoid it to be applied to future services that
                        // accidentally have the same id.
                        const service = servicesById.get(departure.serviceTripID);
                        // Check that stop codes coincide to avoid wrong matchings when it's a loop service that
                        // is going in the other direction. Stop allow to disambiguate since different directions
                        // correspond to different stops.
                        if (service && (service.startStopCode === undefined || service.startStopCode === departure.startStopCode)) {
                            servicesById.delete(departure.serviceTripID);
                            departure.service = service;
                        }
                    }
                    this.setState((state: IWithServiceResultsState) => {
                        this.updateDepartures(this.state.departures);
                    });
            });
        }

        private requestUntilServiceFound(serviceTripId: string, limit: number = 3) {
            if (limit <= 0) {
                return;
            }
            this.requestDepartures().then((results: ServiceDeparture[]) => {
                this.setState((prev: IWithServiceResultsState) => {
                    this.updateDepartures(prev.departures.concat(results), () => {
                        // This causes timetable to be populated with departures. Maybe just call at the end of the recursion,
                        // and avoid displaying the timetable in the meantime.
                        this.setState((prev: IWithServiceResultsState) => ({
                            displayLimit: prev.departures.length
                        }));
                        const targetService = results.find((result: ServiceDeparture) => result.serviceTripID === serviceTripId);
                        if (targetService) {
                            this.onServiceSelection(targetService);
                        } else {
                            this.requestUntilServiceFound(serviceTripId, limit - 1);
                        }
                    });
                });
            });
        }

        public componentWillUnmount() {
            if (this.rTSchedule) {
                clearInterval(this.rTSchedule);
            }
        }
    }

}

export default withServiceResults;

