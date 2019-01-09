import TripGoApi from "./TripGoApi";
import * as React from "react";
import TripGroup from "../model/trip/TripGroup";
import Trip from "../model/trip/Trip";
import {ITripPlannerProps as RResultsConsumerProps} from "../trip-planner/ITripPlannerProps";
import RoutingQuery from "../model/RoutingQuery";
import {Subtract} from "utility-types";

interface IWithRoutingResultsProps {
    urlQuery?: RoutingQuery;
}

interface IWithRoutingResultsState {
    query: RoutingQuery;
    trips: Trip[] | null;
    selected?: Trip;
    waiting: boolean;
}

function withRoutingResults<P extends RResultsConsumerProps>(Consumer: React.ComponentType<P>) {

    return class WithRoutingResults extends React.Component<Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps, IWithRoutingResultsState> {

        public realtimeInterval: any;

        constructor(props: Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps) {
            super(props);
            this.state = {
                query: RoutingQuery.create(),
                trips: null,
                waiting: false
            };
            this.onQueryChange = this.onQueryChange.bind(this);
            this.onReqRealtimeFor = this.onReqRealtimeFor.bind(this);
            this.onAlternativeChange = this.onAlternativeChange.bind(this);
        }

        public onQueryChange(query: RoutingQuery) {
            const prevQuery = this.state.query;
            this.setState({ query: query });
            if (query.isComplete(true)) {
                if (!prevQuery.sameApiQueries(query)) { // Avoid requesting routing again if query url didn't change, e.g. dropped location resolved.
                    this.setState({
                        trips: [],
                        waiting: true
                    });
                    TripGoApi.computeTrips(query).then((tripPromises: Array<Promise<Trip[]>>) => {
                        if (tripPromises.length === 0) {
                            this.setState({waiting: false});
                            return;
                        }
                        const waitingState = {
                            query: query,
                            remaining: tripPromises.length
                        };
                        tripPromises.map((tripsP: Promise<Trip[]>) => tripsP.then((trips: Trip[]) => {
                            if (!this.state.query.sameApiQueries(query)) {
                                return;
                            }
                            if (trips !== null && this.state.trips !== null) {
                                trips = trips.filter((trip: Trip) => !this.alreadyAnEquivalent(trip, this.state.trips!))
                            }
                            if (tripPromises.length === 1 && trips.length > 0 && trips[0].isBicycleTrip()) {
                                trips = (trips[0] as TripGroup).trips;
                            }
                            this.setState(prevState => {
                                return {trips: prevState.trips!.concat(trips)}
                            });
                            this.checkWaiting(waitingState)
                        }).catch((reason: any) => {
                            console.log(reason);
                            this.checkWaiting(waitingState)
                        }))
                    });
                }
            } else {
                if (this.state.trips !== null) {
                    this.setState({
                        trips: null,
                        waiting: false
                    });
                }
            }
        }

        public checkWaiting(waitingState: any) {
            if (!this.state.query.sameApiQueries(waitingState.query)) {
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

        public render(): React.ReactNode {
            const { urlQuery, ...props } = this.props as IWithRoutingResultsProps;
            return <Consumer {...props}
                             query={this.state.query}
                             onQueryChange={this.onQueryChange}
                             trips={this.state.trips}
                             waiting={this.state.waiting}
                             onReqRealtimeFor={this.onReqRealtimeFor}
                             onAlternativeChange={this.onAlternativeChange}
            />;
        }


        public componentDidMount(): void {
            const urlQuery: RoutingQuery | undefined = this.props.urlQuery;
            if (urlQuery) {
                this.onQueryChange(urlQuery);
            }
        }
    }
}

export default withRoutingResults;
export {IWithRoutingResultsProps, IWithRoutingResultsState};