import TripGoApi from "./TripGoApi";
import * as React from "react";
import TripGroup from "../model/trip/TripGroup";
import Trip from "../model/trip/Trip";
import {ITripPlannerProps as RResultsConsumerProps} from "../trip-planner/ITripPlannerProps";
import RoutingQuery from "../model/RoutingQuery";
import {Subtract} from "utility-types";

function withRoutingResults<P extends RResultsConsumerProps>(Consumer: React.ComponentType<P>) {

    interface IWithRoutingResultsProps {
        urlQuery?: RoutingQuery;
    }

    interface IWithRoutingResultsState {
        query: RoutingQuery;
        trips: Trip[] | null;
        waiting: boolean;
    }

    return class WithRoutingResults extends React.Component<Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps, IWithRoutingResultsState> {

        constructor(props: Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps) {
            super(props);
            this.state = {
                query: RoutingQuery.create(),
                trips: null,
                waiting: false
            };
            this.onQueryChange = this.onQueryChange.bind(this);
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

        private checkWaiting(waitingState: any) {
            if (!this.state.query.sameApiQueries(waitingState.query)) {
                return;
            }
            waitingState.remaining--;
            if (waitingState.remaining === 0) {
                this.setState({waiting: false});
            }
        }

        private alreadyAnEquivalent(newTrip: Trip, trips:Trip[]): boolean {
            return !!trips.find((trip: Trip) => this.equivalentTrips(trip, newTrip));
        }

        private equivalentTrips(tripA: Trip, tripB: Trip): boolean {
            return tripA.depart === tripB.depart &&
                tripA.arrive === tripB.arrive &&
                tripA.weightedScore === tripB.weightedScore &&
                tripA.caloriesCost === tripB.caloriesCost &&
                tripA.carbonCost === tripB.carbonCost &&
                tripA.hassleCost === tripB.hassleCost &&
                tripA.segments.length === tripB.segments.length;
        }

        public render(): React.ReactNode {
            const { urlQuery, ...props } = this.props as IWithRoutingResultsProps;
            return <Consumer {...props}
                             query={this.state.query}
                             onQueryChange={this.onQueryChange}
                             trips={this.state.trips}
                             waiting={this.state.waiting}
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