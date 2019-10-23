import * as React from "react";
import Trip from "../model/trip/Trip";
import {tKUIResultsDefaultStyle} from "./TKUIResultsView.css";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TripGroup from "../model/trip/TripGroup";
import TKUICard from "../card/TKUICard";
import {ClassNameMap, CSSProperties} from "react-jss";
import {CSSProps, withStyleProp} from "../jss/StyleHelper";
import classNames from "classnames";
import {TripSort} from "../api/WithRoutingResults";
import {TimePreference} from "..";
import RoutingQuery from "../model/RoutingQuery";
import Select, { components } from 'react-select';
import TKUITripRow, {ITKUITripRowProps} from "./TKUITripRow";
import TKMetricClassifier, {Badges} from "./TKMetricClassifier";

export interface ITKUIResultsViewProps {
    onChange?: (value: Trip) => void;
    onDetailsClicked?: () => void;
    className?: string;
    styles?: any;
}

interface IConsumedProps {
    values: Trip[]; // SOT of trips is outside, so assume trips come sorted and picking sorting criteria is handled outside.
    value?: Trip;
    onChange?: (value: Trip) => void;
    waiting?: boolean; // TODO: allow values to be undefined so no need for waiting prop.
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;
    query: RoutingQuery;
    sort: TripSort;
    onSortChange: (sort: TripSort) => void;
}

interface IProps extends ITKUIResultsViewProps, IConsumedProps {
    classes: ClassNameMap<keyof ITKUIResultsStyle>;
}

export interface ITKUIResultsStyle {
    main: CSSProps<IProps>;
    row: CSSProps<IProps>;
    rowSelected: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
    sortBar: CSSProps<IProps>;
    sortSelectContainer: CSSProps<IProps>;
    sortSelectControl: CSSProps<IProps>;
    sortSelectSingleValue: CSSProps<IProps>;
}

class TKUIResultsViewConfig {
    public styles: ITKUIResultsStyle = tKUIResultsDefaultStyle;
    public renderTrip: <P extends ITKUITripRowProps>(tripRowProps: P) => JSX.Element
        = <P extends ITKUITripRowProps>(props: P) => <TKUITripRow {...props}/>;

    public static instance = new TKUIResultsViewConfig();
}

interface IState {
    tripToBadge: Map<Trip, Badges>;
}

class TKUIResultsView extends React.Component<IProps, IState> {

    private rowRefs: any[] = [];
    private justFocused: boolean = false;

    constructor(props: IProps) {
        super(props);
        this.state = {
            tripToBadge: new Map<Trip, Badges>()
        };
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

    private getSortOptions(): any[] {
        return Object.values(TripSort)
            .filter((value: string) => value !== TripSort.CARBON)
            .map((value: string) => {
                let label = value;
                if (value === TripSort.TIME && this.props.query.timePref === TimePreference.ARRIVE) {
                    label = "Departure";
                }
                label = "Sort by " + label;
                return { value: value, label: label};
            });
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
        const sortOptions = this.getSortOptions();
        return (
            <TKUICard
                title={"Routing results"}
            >
                <div className={classNames(this.props.className, classes.main)}>
                    <div className={classes.sortBar}>
                        <Select
                            options={sortOptions}
                            value={sortOptions.find((option: any) => option.value === this.props.sort)}
                            onChange={(option) => this.props.onSortChange(option.value as TripSort)}
                            isSearchable={false}
                            styles={{
                                container: styles => ({...styles, ...this.props.styles.sortSelectContainer}),
                                control: styles => ({...styles, ...this.props.styles.sortSelectControl}),
                                indicatorsContainer: styles => ({...styles, display: 'none'}),
                                singleValue: styles => ({...styles, ...this.props.styles.sortSelectSingleValue})
                            }}
                        />
                        <div>

                        </div>
                    </div>
                    {this.props.values && this.props.values.map((trip: Trip, index: number) =>
                        TKUIResultsViewConfig.instance.renderTrip({
                            value: trip,
                            className: classNames(classes.row, trip === this.props.value && classes.rowSelected),
                            onClick: this.props.onChange ?
                                () => {
                                    // Trigger details clicked when trip is clicked and it is already selected.
                                    if (this.props.onDetailsClicked && this.props.value === trip && !this.justFocused) {
                                        this.props.onDetailsClicked();
                                    }
                                    return this.props.onChange!(trip);
                                } :
                                undefined,
                            onFocus: this.props.onChange ?
                                () => {
                                    this.justFocused = true;
                                    this.props.onChange!(trip);
                                    setTimeout(() => this.justFocused = false, 100)
                                } : undefined,
                            onKeyDown: this.onKeyDown,
                            onDetailClick: this.props.onDetailsClicked,
                            onAlternativeChange: this.props.onAlternativeChange,
                            key: index + trip.getKey(),
                            reference: (el: any) => this.rowRefs[index] = el,
                            badge: this.state.tripToBadge.get(trip)
                        })
                    )}
                    {this.props.waiting ?
                        <IconSpin className={classes.iconLoading} focusable="false"/> : null}
                </div>
            </TKUICard>
        );
    }

    private refreshBadges() {
        this.setState({tripToBadge: TKMetricClassifier.getTripClassifications(this.props.values)});
    }

    private automaticSelectionTimeout: any;

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (!prevProps.value && this.props.value && this.rowRefs[this.props.values.indexOf(this.props.value)]) {
            this.rowRefs[this.props.values.indexOf(this.props.value)].focus();
        }

        // Clear automatic selection timeout when resetting trips
        if (!this.props.values || this.props.values.length === 0) {
            clearTimeout(this.automaticSelectionTimeout);
            this.automaticSelectionTimeout = undefined;
        }

        // Automatic trip selection a while after first group of trips arrived
        if (!prevProps.value && this.props.values && this.props.values.length > 0 && !this.automaticSelectionTimeout) {
            this.automaticSelectionTimeout = setTimeout(() => {
                if (this.props.values && this.props.values.length > 0 && this.props.onChange && !this.props.value) {
                    this.props.onChange(this.props.values[0]);
                }
            }, 2000);
        }

        if (this.props.values && prevProps.values !== this.props.values) {
            this.refreshBadges();
        }
    }

    public componentDidMount() {
        this.refreshBadges();
    }

    public componentWillUnmount() {
        // Clear automatic selection timeout
        if (this.automaticSelectionTimeout) {
            clearTimeout(this.automaticSelectionTimeout);
        }
    }
}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const consumerProps: IConsumedProps = {
                    values: routingContext.trips || [],
                    waiting: routingContext.waiting,
                    value: routingContext.selected,
                    onChange: (trip: Trip) => {
                        routingContext.onChange(trip);
                        routingContext.onReqRealtimeFor(trip);
                    },
                    onAlternativeChange: routingContext.onAlternativeChange,
                    query: routingContext.query,
                    sort: routingContext.sort,
                    onSortChange: routingContext.onSortChange
                };
                return props.children!(consumerProps);
            }}
        </RoutingResultsContext.Consumer>
    );
};

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUIResultsView");
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