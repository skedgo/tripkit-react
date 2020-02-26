import * as React from "react";
import Trip from "../model/trip/Trip";
import {tKUIResultsDefaultStyle} from "./TKUIResultsView.css";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TripGroup from "../model/trip/TripGroup";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import {ClassNameMap, CSSProperties, StyleCreator, Styles} from "react-jss";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import classNames from "classnames";
import {TripSort} from "../api/WithRoutingResults";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import Select, { components } from 'react-select';
import {default as TKUITripRow} from "./TKUITripRow";
import TKMetricClassifier, {Badges} from "./TKMetricClassifier";
import {Subtract} from "utility-types";
import {TKUIConfig, TKComponentDefaultConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import TKUIScrollForCard from "../card/TKUIScrollForCard";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import {TKUIRoutingQueryInputClass} from "../query/TKUIRoutingQueryInput";
import TKUITransportSwitchesView from "../options/TKUITransportSwitchesView";
import Tooltip from "rc-tooltip";
import GATracker from "../analytics/GATracker";
import {Moment} from "moment-timezone";
import Region from "../model/region/Region";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import TKUISelect from "../buttons/TKUISelect";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onChange?: (value: Trip) => void;
    onDetailsClicked?: () => void;
    className?: string;
    onShowOptions?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    values: Trip[]; // SOT of trips is outside, so assume trips come sorted and picking sorting criteria is handled outside.
    value?: Trip;
    onChange?: (value: Trip) => void;
    waiting?: boolean; // TODO: allow values to be undefined so no need for waiting prop.
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;
    query: RoutingQuery;
    sort: TripSort;
    onSortChange: (sort: TripSort) => void;
    onQueryUpdate: (update: Partial<RoutingQuery>) => void;
    region?: Region;
}

export interface IStyle {
    main: CSSProps<IProps>;
    row: CSSProps<IProps>;
    rowSelected: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
    sortBar: CSSProps<IProps>;
    sortSelect: CSSProps<IProps>;
    sortSelectControl: CSSProps<IProps>;
    transportsBtn: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    timePrefSelect: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIResultsViewProps = IProps;
export type TKUIResultsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIResultsView {...props}/>,
    styles: tKUIResultsDefaultStyle,
    classNamePrefix: "TKUIResultsView",
    randomizeClassNames: false
};

interface IState {
    tripToBadge: Map<Trip, Badges>;
    expanded?: Trip;
}

class TKUIResultsView extends React.Component<IProps, IState> {

    private rowRefs: any[] = [];

    constructor(props: IProps) {
        super(props);
        this.state = {
            tripToBadge: new Map<Trip, Badges>()
        };
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

    private onPrefChange(timePref: TimePreference) {
        GATracker.instance.send("query input", "time pref", timePref.toLowerCase());
        if (timePref === TimePreference.NOW) {
            this.updateQuery({
                timePref: timePref,
                time: DateTimeUtil.getNow()
            });
        } else {
            this.updateQuery({
                timePref: timePref
            })
        }
    }

    private updateQuery(update: Partial<RoutingQuery>) {
        this.props.onQueryUpdate(update);
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const sortOptions = this.getSortOptions();
        const injectedStyles = this.props.injectedStyles;
        const timePrefOptions = TKUIRoutingQueryInputClass.getTimePrefOptions(this.props.t);
        const routingQuery = this.props.query;
        const datePickerDisabled = routingQuery.timePref === TimePreference.NOW;
        const renderSubHeader = this.props.portrait ? () => {
            return (
                <div className={classes.footer}>
                    <TKUISelect
                        options={timePrefOptions}
                        value={timePrefOptions.find((option: any) => option.value === routingQuery.timePref)}
                        onChange={(option) => this.onPrefChange(option.value)}
                        className={classes.timePrefSelect}
                        menuStyle={{marginTop: '3px'}}
                    />
                    {routingQuery.timePref !== TimePreference.NOW &&
                    <TKUIDateTimePicker     // Switch rotingQuery.time to region timezone.
                        value={this.props.region ? routingQuery.time.tz(this.props.region.timezone) : routingQuery.time}
                        onChange={(date: Moment) => this.updateQuery({time: date})}
                        timeFormat={DateTimeUtil.TIME_FORMAT}
                        dateFormat={DateTimeUtil.DATE_TIME_FORMAT}
                        disabled={datePickerDisabled}
                    />
                    }
                    {this.props.onShowOptions &&
                    <Tooltip placement="right"
                             overlay={<TKUITransportSwitchesView onMoreOptions={this.props.onShowOptions}/>}
                             overlayClassName="app-style TripRow-altTooltip"
                             mouseEnterDelay={.5}
                             trigger={["click"]}
                    >
                        <button className={classes.transportsBtn}>
                            Transport options
                        </button>
                    </Tooltip>
                    }
                </div>
            )
        } : undefined;
        const slideUpOptions = this.props.slideUpOptions ? this.props.slideUpOptions : {};
        if (!slideUpOptions.modalUp) {
            Object.assign(slideUpOptions, {
                modalDown: {top: 78, unit: '%'},
            });
        }
        return (
            <TKUICard
                title={this.props.landscape ? "Routing results" : undefined}
                presentation={CardPresentation.SLIDE_UP}
                renderSubHeader={renderSubHeader}
                slideUpOptions={slideUpOptions}
            >
                <TKUIScrollForCard className={classNames(this.props.className, classes.main)}>
                    <div className={classes.sortBar}>
                        <TKUISelect
                            options={sortOptions}
                            value={sortOptions.find((option: any) => option.value === this.props.sort)}
                            onChange={(option) => this.props.onSortChange(option.value as TripSort)}
                            className={classes.sortSelect}
                            controlStyle={injectedStyles.sortSelectControl}
                            menuStyle={{marginTop: '3px'}}
                            components={{
                                IndicatorsContainer: (props: any) => null
                            }}
                        />
                        <div>

                        </div>
                    </div>
                    {this.props.values && this.props.values.map((trip: Trip, index: number) =>
                        <TKUITripRow
                            value={trip}
                            selected={trip === this.props.value}
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
                    )}
                    {this.props.waiting ?
                        <IconSpin className={classes.iconLoading} focusable="false"/> : null}
                </TKUIScrollForCard>
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

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> =
    (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
        return (
            <TKUIViewportUtil>
                {(viewportProps: TKUIViewportUtilProps) =>
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
                                onSortChange: routingContext.onSortChange,
                                onQueryUpdate: routingContext.onQueryUpdate,
                                region: routingContext.region,
                                ...viewportProps
                            };
                            return props.children!(consumerProps);
                        }}
                    </RoutingResultsContext.Consumer>
                }
            </TKUIViewportUtil>
        );
    };

const merger: (clientProps: IClientProps, consumedProps: IConsumedProps) =>
    Subtract<IProps, TKUIWithClasses<IStyle, IProps>> =
    (clientProps: IClientProps, consumedProps: IConsumedProps) => {
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

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!(merger(inputProps, consumedProps))}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUIRoutingResultsView, config, Mapper);