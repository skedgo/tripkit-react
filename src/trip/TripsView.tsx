import * as React from "react";
import Trip from "../model/trip/Trip";
import ITripRowProps, {TRIP_ALT_PICKED_EVENT} from "./ITripRowProps";
import "./TripsView.css";
import IconSpin from '-!svg-react-loader!../images/ic-loading2.svg';
import {EventEmitter} from "fbemitter";
import TripGroup from "../model/trip/TripGroup";
import {RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import ITripPlannerProps from "../trip-planner/ITripPlannerProps";
import {ITripSelectionContext, TripSelectionContext} from "../trip-planner/TripSelectionProvider";
import TripRow from "./TripRow";

// TODO: maybe define TKUIResultsViewProps subtracting ConnectionProps (those injected by the connector) from
// IProps, and adding MergeHandlerProps (handler we want to merge)

interface ITKUIResultsViewProps {
    onChange?: (value: Trip) => void;
    className?: string;
    eventBus?: EventEmitter;
    config?: TKUIResultsViewConfig;
}

interface IConnectionProps {
    values: Trip[]; // SOT of trips is outside, so assume trips come sorted and picking sorting criteria is handled outside.
    value?: Trip;
    onChange?: (value: Trip) => void;
    waiting?: boolean; // TODO: allow values to be undefined so no need for waiting prop.
}

interface IProps extends ITKUIResultsViewProps, IConnectionProps {
    config: TKUIResultsViewConfig;
}

class TKUIResultsViewConfig {
    public renderTrip: <P extends ITripRowProps>(tripRowProps: P) => JSX.Element
        = <P extends ITripRowProps>(props: P) => <TripRow {...props}/>;
}

class TripsView extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        config: new TKUIResultsViewConfig()
    };

    private rowRefs: any[] = [];

    constructor(props: IProps) {
        super(props);
        if (this.props.eventBus) {
            this.props.eventBus.addListener(TRIP_ALT_PICKED_EVENT, (orig: TripGroup, update: TripGroup) => {
                setTimeout(() => {
                    const updatedTripIndex = this.props.values.indexOf(update);
                    if (updatedTripIndex !== -1) {
                        this.rowRefs[updatedTripIndex].focus();
                    }
                }, 100);

            });
        }
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    private onKeyDown(e: any) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            const selectedI = this.props.value ? this.props.values.indexOf(this.props.value) : 0;
            if (this.props.onChange) {
                const nextIndex = this.nextIndex(selectedI, e.keyCode === 38);
                this.props.onChange(this.props.values[nextIndex]);
                this.rowRefs[nextIndex].focus();
            }
        }
    }

    private nextIndex(i: number, prev: boolean) {
        return (i + (prev ? -1 : 1) + this.props.values.length) % this.props.values.length;
    }

    public render(): React.ReactNode {
        return (
            <div className={"TripsView gl-flex gl-column" + (this.props.className ? " " + this.props.className : "")}>
                {this.props.values && this.props.values.map((trip: Trip, index: number) =>
                    this.props.config.renderTrip(
                        { value: trip,
                            className: trip === this.props.value ? "selected" : undefined,
                            onClick: this.props.onChange ? () => this.props.onChange!(trip) : undefined,
                            onFocus: this.props.onChange ? () => this.props.onChange!(trip) : undefined,
                            onKeyDown: this.onKeyDown,
                            eventBus: this.props.eventBus,
                            key: index + trip.getKey(),
                            ref: (el: any) => this.rowRefs[index] = el
                        })
                )}
                {this.props.waiting ?
                    <IconSpin className="TripsView-iconLoading sg-animate-spin gl-align-self-center" focusable="false"/> : null}
            </div>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (!prevProps.value && this.props.value && this.rowRefs[this.props.values.indexOf(this.props.value)]) {
            this.rowRefs[this.props.values.indexOf(this.props.value)].focus();
        }

        // If first group of trips arrived
        if (!prevProps.value &&
            // prevState.tripsSorted && prevState.tripsSorted.length === 0 &&
            this.props.values && this.props.values.length > 0) {
            setTimeout(() => {
                if (this.props.values && this.props.values.length > 0 && this.props.onChange) {
                    this.props.onChange(this.props.values[0])
                }
            }, 2000);
        }
    }

    public static sortTrips(trips: Trip[]) {
        return trips.slice().sort((t1: Trip, t2: Trip) => {
            return t1.weightedScore - t2.weightedScore;
        });
    }
}

const Connector: React.SFC<{children: (props: Partial<IProps>) => React.ReactNode}> = (props: {children: (props: Partial<IProps>) => React.ReactNode}) => {
// const Connector: React.SFC<any> = (props: any) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingResultsContext: ITripPlannerProps) => {
                return (
                    <TripSelectionContext.Consumer>
                        {(tripSelectionContext: ITripSelectionContext) => {
                            const consumerProps: Partial<IProps> = {
                                // TODO: very inefficient, move sort inside TripView component, should also receive a sort criteria.
                                // Or define provider TripSortProvider, that receives trips, and provides tripsSorted and
                                // onSortChange, and maintains in an internal state the trips sorted. Should consume from
                                // RoutingResultsProvider, so will come below it. Notice I'm doing something like Redux but
                                // with several providers, instead of a unique store provider.
                                values: TripsView.sortTrips(routingResultsContext.trips!),
                                waiting: routingResultsContext.waiting,
                                value: tripSelectionContext.selected,
                                onChange: (trip: Trip) => {
                                    tripSelectionContext.onChange(trip);
                                    routingResultsContext.onReqRealtimeFor(trip);
                                }
                            };
                            return props.children!(consumerProps);
                        }}
                    </TripSelectionContext.Consumer>
                )
            }}
        </RoutingResultsContext.Consumer>
    );
};

export const TKUIResultsView = (addProps: ITKUIResultsViewProps) =>
    <Connector>
        {(props: IConnectionProps) => {
            let onChangeToPass;
            if (addProps.onChange && props.onChange) {
                onChangeToPass = (trip: Trip) => {
                    props.onChange!(trip);
                    addProps.onChange!(trip);
                }
            } else {
                onChangeToPass = addProps.onChange ? addProps.onChange : props.onChange;
            }
            const tripsViewProps = {...addProps, ...props, onChange: onChangeToPass} as IProps;
            return <TripsView {...tripsViewProps}/>;
        }}
    </Connector>;

export default TripsView;
export {TKUIResultsViewConfig};