import * as React from "react";
import Trip from "../model/trip/Trip";
import ITripRowProps from "./ITripRowProps";
import {tKUIResultsDefaultStyle} from "./TKUIResultsView.css";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TripRow from "./TripRow";
import TripGroup from "../model/trip/TripGroup";
import TKUICard from "../card/TKUICard";
import {ClassNameMap, CSSProperties} from "react-jss";
import {CSSProps, withStyleProp} from "../jss/StyleHelper";
import classNames from "classnames";

interface ITKUIResultsViewProps {
    onChange?: (value: Trip) => void;
    onClicked?: () => void;
    className?: string;
    styles?: any;
}

interface IConsumedProps {
    values: Trip[]; // SOT of trips is outside, so assume trips come sorted and picking sorting criteria is handled outside.
    value?: Trip;
    onChange?: (value: Trip) => void;
    waiting?: boolean; // TODO: allow values to be undefined so no need for waiting prop.
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;
}

interface IProps extends ITKUIResultsViewProps, IConsumedProps {
    classes: ClassNameMap<keyof ITKUIResultsStyle>
}

export interface ITKUIResultsStyle {
    main: CSSProps<IProps>;
    row: CSSProps<IProps>;
    rowSelected: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
}

class TKUIResultsViewConfig {
    public styles: ITKUIResultsStyle = tKUIResultsDefaultStyle;
    public renderTrip: <P extends ITripRowProps>(tripRowProps: P) => JSX.Element
        = <P extends ITripRowProps>(props: P) => <TripRow {...props}/>;

    public static instance = new TKUIResultsViewConfig();
}

class TKUIResultsView extends React.Component<IProps, {}> {

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
        const classes = this.props.classes;
        return (
            <TKUICard
                title={"Routing results"}
            >
                <div className={classNames("TKUIResultsView", this.props.className, classes.main)}>
                    {this.props.values && this.props.values.map((trip: Trip, index: number) =>
                        TKUIResultsViewConfig.instance.renderTrip(
                            { value: trip,
                                className: classNames(classes.row, trip === this.props.value && classes.rowSelected),
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
                        <IconSpin className={classes.iconLoading} focusable="false"/> : null}
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

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    // TODO: Can also consume styles property from a global styles provider.
    return (
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const consumerProps: IConsumedProps = {
                    // TODO: very inefficient, move sort inside TripView component, should also receive a sort criteria.
                    // Or define provider TripSortProvider, that receives trips, and provides tripsSorted and
                    // onSortChange, and maintains in an internal state the trips sorted. Should consume from
                    // RoutingResultsProvider, so will come below it. Notice I'm doing something like Redux but
                    // with several providers, instead of a unique store provider.
                    values: TKUIResultsView.sortTrips(routingContext.trips!),
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

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent);
    return (addProps: ITKUIResultsViewProps) => {
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
                    const stylesToPass = addProps.styles || TKUIResultsViewConfig.instance.styles;
                    return <RawComponentStyled {...tripsViewProps} styles={stylesToPass}/>;
                }}
            </Consumer>
        )
    };
};

export default Connect(TKUIResultsView);

export {TKUIResultsViewConfig};