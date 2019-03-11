import * as React from "react";
import {Moment} from "moment-timezone";
import StopLocation from "../model/StopLocation";
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

interface IWithServiceResultsProps {
    startStop: StopLocation;
    segment?: Segment;
}

interface IWithServiceResultsState {
    initTime: Moment;       // Default to now - 30mins(?)
    departures: ServiceDeparture[];    // It's sorted.
    filter: string;
    departuresFiltered: ServiceDeparture[];
    displayLimit: number;
}

interface IServiceResConsumerProps {
    onInitTimeChange?: (initTime: Moment) => void;
    onFilterChange?: (filter: string) => void;
    onRequestMore?: () => void;
    departures: ServiceDeparture[];
    waiting: boolean;
}


function withServiceResults<P extends IServiceResConsumerProps>(Consumer: React.ComponentType<P>) {

    return class WithServiceResults extends React.Component<Subtract<P, IServiceResConsumerProps> & IWithServiceResultsProps, IWithServiceResultsState> {

        public readonly idealMinDisplayed = 15;

        public requestsWithoutNewResults = 0;
        public prevFilter = "";
        public prevDeparturesCount = 0;

        public awaitingRealtime = false;

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
                initialTime = now;
            }
            this.state = {
                initTime: initialTime,
                departures: [],
                filter: "",
                departuresFiltered: [],
                displayLimit: 0
            };
            // TODO: configureTimeUpdate();
            this.requestMoreDepartures = this.requestMoreDepartures.bind(this);
        }

        public requestMoreDepartures() {
            if (this.state.displayLimit > this.state.departuresFiltered.length)   // That means that we are awaiting requested departures
            {
                return;
            }
            this.setState((prevState: IWithServiceResultsState) => {
                    return { displayLimit: prevState.displayLimit + this.getDisplaySnap() }
                },
                () => this.coverDisplayLimit());
        }

        public getDisplaySnap(): number {
            return 45 * Math.max(this.state.departuresFiltered.length / (this.state.departures.length + 1), 1);
        }

        public getDisplayDepartures(): ServiceDeparture[] {
            return this.state.departuresFiltered.slice(0, this.state.displayLimit);
        }

        public isWaiting(): boolean {
            return this.state.displayLimit > this.state.departuresFiltered.length;
        }

        public render(): React.ReactNode {
            const {startStop, segment, ...props} = this.props as IWithServiceResultsProps;
            return <Consumer {...props}
                             onRequestMore={this.requestMoreDepartures}
                             departures={this.getDisplayDepartures()}
                             waiting={this.isWaiting()}
            />;
        }

        /**
         * requesting departures if those
         * matching the filter are not enough to fill the scroll panel.
         */
        public coverDisplayLimit() {
            if (this.state.displayLimit <= this.state.departuresFiltered.length) {
                if (Features.instance.realtimeEnabled()) { // TODO && displayLimit > 0;
                    this.realtimeUpdate();
                }
                return;
            }

            // Set a limit to the number of consecutive requests that do not bring new results. Specially for the case of no results displayed at all.
            // if (this.state.departuresFiltered.length < this.idealMinDisplayed && this.prevDeparturesCount === this.state.departuresFiltered.length && this.state.filter.startsWith(this.prevFilter)) {
            //     this.requestsWithoutNewResults++;
            // }
            // else {
            //     this.requestsWithoutNewResults = 0;
            // }
            //
            // this.prevDeparturesCount = this.state.departuresFiltered.length;
            // this.prevFilter = this.state.filter;
            //
            // if (this.requestsWithoutNewResults >= 6 || (this.requestsWithoutNewResults >= 3 && this.state.departuresFiltered.length === 0)) {
            //     this.setState((prev: IWithServiceResultsState) => {
            //         return { displayLimit: prev.departuresFiltered.length }
            //     });
            //     return;
            // }

            this.requestDepartures().then((results: ServiceDeparture[]) => {
                this.setState((prev: IWithServiceResultsState) => {
                    const departuresUpdate = prev.departures.concat(results);
                    return {
                        departures: departuresUpdate,
                        departuresFiltered: departuresUpdate.filter((departure: ServiceDeparture) =>
                            this.matchesFilter(departure, this.state.filter))
                    }
                }, () => this.coverDisplayLimit());
            });

            // new DeparturesRequestCallback() {
            // @Override
            // public void onSuccess(List<GWTDeparture> result) {
            //         fireValueChangeEvent();
            //         coverDisplayLimit();    // (mutual) recursive call
            //     }
            // });
        }

        public static sortDepartures(departures: ServiceDeparture[]) {
            return departures.slice().sort((s1: ServiceDeparture, s2: ServiceDeparture) => {
                return s1.startTime - s2.startTime;
            });
        }

        public requestDepartures(): Promise<ServiceDeparture[]> {
            let startStopCode = this.props.startStop.code;
            const startRegionCode = RegionsData.instance.getRegion(this.props.startStop)!.name;
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
                        return WithServiceResults.sortDepartures(departuresResult.getDepartures(this.props.startStop));
                    }
                );
        }

        public getLastDepartureTime(): number {
            let lastDepartureDate;
            if (this.state.departures.length === 0) {
                lastDepartureDate = Math.floor(this.state.initTime.valueOf() / 1000);
            }  else {
                lastDepartureDate = Math.floor(this.state.departures[this.state.departures.length - 1].startTime / 1000) + 1;
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
            const departuresToUpdate = departures.slice(0, 50);

            if (departures.length === 0) {
                return;
            }

            const startRegionCode = RegionsData.instance.getRegion(this.props.startStop)!.name;
            const startStopCode = this.props.startStop.code;
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
            });

            // NetworkUtil.requestInFailChain(serverUrls, new NetworkUtil.AsyncCallableFail() {
            // @Override
            // public void asyncCall(String serverUrl, final NetworkUtil.ChainCallbackFail failCallback) {
            //         NetworkUtil.getLatestRest(serverUrl, latest, new MethodCallback<Latest>() {
            //         @Override
            //         public void onSuccess(Method method, Latest response) {
            //                 awaitingRealtime = false;
            //                 Messages.getInstance().removeMessage(messageType, messageContent);
            //                 realtimeServicesById.clear();
            //                 for (Latest.Service service : response.getServices())
            //                 realtimeServicesById.put(service.getServiceTripID(), service);
            //                 List<GWTDeparture> departures = getAllDepartures();
            //                 for (GWTDeparture departure : departures) {
            //                     // Remove realtime entry once applied to avoid it to be applied to future services that
            //                     // accidentally have the same id.
            //                     Latest.Service realtimeService = realtimeServicesById.remove(departure.getServiceTripID());
            //                     // Check that stop codes coincide to avoid wrong matchings when it's a loop service that
            //                     // is going in the other direction. Stop allow to disambiguate since different directions
            //                     // correspond to different stops.
            //                     if (realtimeService != null
            //                         && (realtimeService.getStartStopCode() == null || realtimeService.getStartStopCode().equals(departure.getStartStopCode())))
            //                         departure.setRealtimeService(realtimeService);
            //                 }
            //                 sortDepartures();
            //                 refreshFilter();
            //                 fireValueChangeEvent();
            //             }
            //
            //         @Override
            //         public void onFailure(Method method, Throwable exception) {
            //                 failCallback.nextRequest(exception);
            //             }
            //         });
            //     }
            //
            // @Override
            // public void onChainFailed(Throwable caught) {
            //         Messages.getInstance().addErrorMessage(messageType, messageContent);
            //     }
            // });
        }
    }
}

export default withServiceResults;
export {IServiceResConsumerProps};

