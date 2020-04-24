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
import { components } from 'react-select';
import {default as TKUITripRow} from "./TKUITripRow";
import TKMetricClassifier, {Badges} from "./TKMetricClassifier";
import {Subtract} from "utility-types";
import {TKUIConfig, TKComponentDefaultConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import {TKUIRoutingQueryInputClass} from "../query/TKUIRoutingQueryInput";
import TKUITransportSwitchesView from "../options/TKUITransportSwitchesView";
import GATracker from "../analytics/GATracker";
import {Moment} from "moment-timezone";
import Region from "../model/region/Region";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import TKUISelect from "../buttons/TKUISelect";
import {TKUITooltip} from "../index";
import DeviceUtil from "../util/DeviceUtil";
import LocationsData from "../data/LocationsData";
import TKLocationInfo from "../model/location/TKLocationInfo";
import TKUIAlertRow from "../alerts/TKUIAlertRow";
import TKUIAlertsView from "../alerts/TKUIAlertsView";

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
    iconLoading: CSSProps<IProps>;
    sortBar: CSSProps<IProps>;
    sortSelect: CSSProps<IProps>;
    sortSelectControl: CSSProps<IProps>;
    transportsBtn: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    timePrefSelect: CSSProps<IProps>;
    noResults: CSSProps<IProps>;
    alertContainer: CSSProps<IProps>;
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
    showTransportSwitches: boolean;
    toLocInfo?: TKLocationInfo;
    showAlertsView?: boolean;
}

class TKUIResultsView extends React.Component<IProps, IState> {

    private rowRefs: any[] = [];

    constructor(props: IProps) {
        super(props);
        this.state = {
            tripToBadge: new Map<Trip, Badges>(),
            showTransportSwitches: false
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
        const t = this.props.t;
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
                    {routingQuery.timePref !== TimePreference.NOW && this.props.region &&
                    <TKUIDateTimePicker     // Switch rotingQuery.time to region timezone.
                        value={routingQuery.time}
                        timeZone={this.props.region.timezone}
                        onChange={(date: Moment) => this.updateQuery({time: date})}
                        timeFormat={DateTimeUtil.TIME_FORMAT}
                        dateFormat={DateTimeUtil.DATE_TIME_FORMAT}
                        disabled={datePickerDisabled}
                    />
                    }
                    {this.props.onShowOptions &&
                    <TKUITooltip
                        placement="right"
                        overlay={
                            <TKUITransportSwitchesView
                                onMoreOptions={this.props.onShowOptions ?
                                    () => {
                                        this.setState({showTransportSwitches: false});
                                        this.props.onShowOptions!();
                                    } : undefined}
                            />
                        }
                        visible={this.state.showTransportSwitches}
                        onVisibleChange={(visible?: boolean) => !visible && this.setState({showTransportSwitches: false})}
                    >
                        <button className={classes.transportsBtn}
                                onClick={() => this.setState({showTransportSwitches: true})}>
                            Transport options
                        </button>
                    </TKUITooltip>
                    }
                </div>
            )
        } : undefined;
        return (
            <TKUICard
                title={this.props.landscape ? "Routing results" : undefined}
                presentation={CardPresentation.SLIDE_UP}
                renderSubHeader={renderSubHeader}
                slideUpOptions={this.props.slideUpOptions}
            >
                <div className={classNames(this.props.className, classes.main)}>
                    {this.state.toLocInfo && this.state.toLocInfo.alerts.length > 0 &&
                    <div className={classes.alertContainer}>
                        <TKUIAlertRow alert={this.state.toLocInfo.alerts[0]} asCard={true} brief={true}
                                      onClick={() => this.setState({showAlertsView: true})}
                        />
                        {this.state.showAlertsView &&
                        <TKUIAlertsView
                            alerts={this.state.toLocInfo.alerts}
                            onRequestClose={() => this.setState({showAlertsView: false})}
                            slideUpOptions={{
                                draggable: false,
                                zIndex: 1006    // To be above query input. TODO: define constants for all these z-index(s).
                            }}
                        />}
                    </div>}
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
                    {this.props.values.map((trip: Trip, index: number) =>
                        <TKUITripRow
                            value={trip}
                            selected={trip === this.props.value}
                            className={classNames(classes.row)}
                            onClick={() => {
                                this.props.onChange && this.props.onChange(trip);
                                DeviceUtil.isPhone && this.props.onDetailsClicked && this.props.onDetailsClicked();
                            }}
                            onFocus={() => this.props.onChange && this.props.onChange(trip)}
                            onAlternativeClick={this.props.onAlternativeChange}
                            onDetailClick={!DeviceUtil.isPhone ? this.props.onDetailsClicked : undefined}
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
                    {!this.props.waiting && this.props.values.length === 0
                    && <div className={classes.noResults}>{t("No.routes.found.")}</div>}
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

        if (this.props.query.to !== prevProps.query.to) {
            this.setState({toLocInfo: undefined});
            this.refreshAlert();
        }
    }

    public componentDidMount() {
        this.refreshBadges();
        this.refreshAlert();
    }

    private refreshAlert() {
        this.props.query.to && LocationsData.instance.getLocationInfo(this.props.query.to)
            .then((locInfo: TKLocationInfo) => this.setState({toLocInfo: locInfo}));
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