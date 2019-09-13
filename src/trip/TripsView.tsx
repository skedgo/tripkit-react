import * as React from "react";
import Trip from "../model/trip/Trip";
import ITripRowProps from "./ITripRowProps";
import "./TripsView.css";
import IconSpin from '-!svg-react-loader!../images/ic-loading2.svg';
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TripRow from "./TripRow";
import TripGroup from "../model/trip/TripGroup";
import TKUICard from "../card/TKUICard";

interface ITKUIResultsViewProps {
    onChange?: (value: Trip) => void;
    onClicked?: () => void;
    className?: string;
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;
    config?: TKUIResultsViewConfig;
}

interface IConsumedProps {
    values: Trip[]; // SOT of trips is outside, so assume trips come sorted and picking sorting criteria is handled outside.
    value?: Trip;
    onChange?: (value: Trip) => void;
    waiting?: boolean; // TODO: allow values to be undefined so no need for waiting prop.
}

interface IProps extends ITKUIResultsViewProps, IConsumedProps {
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
        // if (this.props.eventBus) {
            // TODO: chech why this is no longer necessary. If still needed put this logic in a wrapper of
            // onAlternativeChange passed to TripRow.
            // this.props.eventBus.addListener(TRIP_ALT_PICKED_EVENT, (orig: TripGroup, update: TripGroup) => {
            //     setTimeout(() => {
            //         const updatedTripIndex = this.props.values.indexOf(update);
            //         if (updatedTripIndex !== -1) {
            //             this.rowRefs[updatedTripIndex].focus();
            //         }
            //     }, 100);
            //
            // });
        // }
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
            <TKUICard
                title={"Routing results"}
            >
                <div className={"TripsView gl-flex gl-column" + (this.props.className ? " " + this.props.className : "")}>
                    {this.props.values && this.props.values.map((trip: Trip, index: number) =>
                        this.props.config.renderTrip(
                            { value: trip,
                                className: trip === this.props.value ? "selected" : undefined,
                                onClick: this.props.onChange ?
                                    () => {
                                        if (this.props.onClicked) {
                                            this.props.onClicked();
                                        }
                                        return this.props.onChange!(trip);
                                    } :
                                    undefined,
                                onFocus: this.props.onChange ? () => this.props.onChange!(trip) : undefined,
                                onKeyDown: this.onKeyDown,
                                onAlternativeChange: this.props.onAlternativeChange,
                                key: index + trip.getKey(),
                                ref: (el: any) => this.rowRefs[index] = el
                            })
                    )}
                    {this.props.waiting ?
                        <IconSpin className="TripsView-iconLoading sg-animate-spin gl-align-self-center" focusable="false"/> : null}
                </div>
            </TKUICard>
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

const Consumer: React.SFC<{children: (props: Partial<IProps>) => React.ReactNode}> = (props: {children: (props: Partial<IProps>) => React.ReactNode}) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const consumerProps: Partial<IProps> = {
                    // TODO: very inefficient, move sort inside TripView component, should also receive a sort criteria.
                    // Or define provider TripSortProvider, that receives trips, and provides tripsSorted and
                    // onSortChange, and maintains in an internal state the trips sorted. Should consume from
                    // RoutingResultsProvider, so will come below it. Notice I'm doing something like Redux but
                    // with several providers, instead of a unique store provider.
                    values: TripsView.sortTrips(routingContext.trips!),
                    waiting: routingContext.waiting,
                    value: routingContext.selected,
                    onChange: (trip: Trip) => {
                        routingContext.onChange(trip);
                        routingContext.onReqRealtimeFor(trip);
                    },
                    onAlternativeChange: routingContext.onAlternativeChange
                };
                return props.children!(consumerProps);
            }}
        </RoutingResultsContext.Consumer>
    );
};

export const Connect = (RawComponent: React.ComponentType<IProps>) =>
    (addProps: ITKUIResultsViewProps) => {
        return (
            <Consumer>
                {(props: IConsumedProps) => {
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
                    return <RawComponent {...tripsViewProps}/>;
                }}
            </Consumer>
        )
    };

// export const TKUIResultsView = (addProps: ITKUIResultsViewProps) =>
export const TKUIResultsView = Connect(TripsView);

export default TripsView;
export {TKUIResultsViewConfig};