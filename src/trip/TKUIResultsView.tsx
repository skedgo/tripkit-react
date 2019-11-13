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
import {connect, default as TKUITripRow, MapperType} from "./TKUITripRow";
import TKMetricClassifier, {Badges} from "./TKMetricClassifier";
import {Subtract} from "utility-types";
import {default as ITKUIConfig, ITKUIComponentConfig} from "../config/TKUIConfig";

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
    // renderTrip: <P extends ITKUITripRowProps>(tripRowProps: P) => JSX.Element;
}

export interface IProps extends ITKUIResultsViewProps, IConsumedProps {
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

// class TKUIResultsViewConfig {
//     public styles: ITKUIResultsStyle = tKUIResultsDefaultStyle;
//
//     public static instance = new TKUIResultsViewConfig();
// }

export const tKUIResultsViewDefaultConfig: ITKUIComponentConfig<IProps, ITKUIResultsStyle> = {
    render: props => <TKUIResultsView {...props}/>,
    styles: tKUIResultsDefaultStyle
    // classNamePrefix: "TKUIResultsView"
};

interface IState {
    tripToBadge: Map<Trip, Badges>;
    expanded?: Trip;
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
                            <TKUITripRow
                                value={trip}
                                className={classNames(classes.row, trip === this.props.value && classes.rowSelected)}
                                onClick={() => this.props.onChange && this.props.onChange(trip)}
                                onFocus={() => this.props.onChange && this.props.onChange(trip)}
                                onAlternativeClick={this.props.onAlternativeChange}
                                onDetailClick={this.props.onDetailsClicked}
                                onKeyDown={this.onKeyDown}
                                key={index + trip.getKey()}
                                reference={(el: any) => this.rowRefs[index] = el}
                                badge={this.state.tripToBadge.get(trip)}
                                expanded={trip === this.state.expanded}
                                onExpand={(expand: boolean) =>
                                    this.setState({
                                        expanded: expand ? trip : undefined
                                    })}
                            />
                        // this.props.renderTrip({
                        //     value: trip,
                        //     className: classNames(classes.row, trip === this.props.value && classes.rowSelected),
                        //     onClick: () => {
                        //         this.props.onChange && this.props.onChange(trip);
                        //     },
                        //     onFocus: () => {
                        //         this.props.onChange && this.props.onChange(trip);
                        //     },
                        //     onAlternativeClick: this.props.onAlternativeChange,
                        //     onDetailClick: this.props.onDetailsClicked,
                        //     onKeyDown: this.onKeyDown,
                        //     key: index + trip.getKey(),
                        //     reference: (el: any) => this.rowRefs[index] = el,
                        //     badge: this.state.tripToBadge.get(trip),
                        //     expanded: trip === this.state.expanded,
                        //     onExpand: (expand: boolean) => {
                        //         this.setState({
                        //             expanded: expand ? trip : undefined
                        //         })
                        //     }
                        // })
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

// const Complete: React.SFC<{clientProps: ITKUIResultsViewProps, children: (props: Subtract<IProps, {classes: ClassNameMap<keyof ITKUIResultsStyle>}>) => React.ReactNode}> =
//     (props: {clientProps: ITKUIResultsViewProps, children: (props: Subtract<IProps, {classes: ClassNameMap<keyof ITKUIResultsStyle>}>) => React.ReactNode}) => {
//         return (
//             <RoutingResultsContext.Consumer>
//                 {(routingContext: IRoutingResultsContext) => {
//                     const consumerProps: IConsumedProps = {
//                         values: routingContext.trips || [],
//                         waiting: routingContext.waiting,
//                         value: routingContext.selected,
//                         onChange: (trip: Trip) => {
//                             routingContext.onChange(trip);
//                             routingContext.onReqRealtimeFor(trip);
//                         },
//                         onAlternativeChange: routingContext.onAlternativeChange,
//                         query: routingContext.query,
//                         sort: routingContext.sort,
//                         onSortChange: routingContext.onSortChange
//                     };
//                     return props.children!(consumerProps);
//                 }}
//             </RoutingResultsContext.Consumer>
//         );
//     };

// export const Connect = (RawComponent: React.ComponentType<IProps>) => {
//     const RawComponentStyled = withStyleProp(RawComponent, "TKUIResultsView");
//     return (addProps: ITKUIResultsViewProps) => {
//         return (
//             <Consumer>
//                 {(props: IConsumedProps) => {
//                     let onChangeToPass;
//                     if (addProps.onChange && props.onChange) {
//                         onChangeToPass = (trip: Trip) => {
//                             props.onChange!(trip);
//                             addProps.onChange!(trip);
//                         }
//                     } else {
//                         onChangeToPass = addProps.onChange ? addProps.onChange : props.onChange;
//                     }
//                     const tripsViewProps = {...addProps, ...props, onChange: onChangeToPass} as IProps;
//                     const stylesToPass = addProps.styles || TKUIResultsViewConfig.instance.styles;
//                     return <RawComponentStyled {...tripsViewProps} styles={stylesToPass}/>;
//                 }}
//             </Consumer>
//         )
//     };
// };

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> =
    (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
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

const merger: (clientProps: ITKUIResultsViewProps, consumedProps: IConsumedProps) =>
    Subtract<IProps, {classes: ClassNameMap<keyof ITKUIResultsStyle>}> =
    (clientProps: ITKUIResultsViewProps, consumedProps: IConsumedProps) => {
        let onChangeToPass;
        if (clientProps.onChange && consumedProps.onChange) {
            onChangeToPass = (trip: Trip) => {
                consumedProps.onChange!(trip);
                clientProps.onChange!(trip);
            }
        } else {
            onChangeToPass = clientProps.onChange ? clientProps.onChange : consumedProps.onChange;
        }
        return {...clientProps, ...consumedProps, onChange: onChangeToPass} as IProps;
    };

const Mapper: MapperType<ITKUIResultsViewProps, IProps, ITKUIResultsStyle> =
    // (props: { clientProps: ITKUIResultsViewProps, children: (props: Subtract<IProps, {classes: ClassNameMap<keyof ITKUIResultsStyle>}>) => React.ReactNode }) =>
    ({clientProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!(merger(clientProps, consumedProps))}
        </Consumer>;


export default connect((config: ITKUIConfig) => config.TKUIRoutingResultsView,
    tKUIResultsViewDefaultConfig, "TKUIResultsView", Mapper);