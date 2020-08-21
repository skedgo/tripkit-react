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
import {connect, PropsMapper, replaceStyle} from "../config/TKConfigHelper";
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
import {TKUIButtonType, TKUITheme, TKUITooltip} from "../index";
import DeviceUtil, {BROWSER} from "../util/DeviceUtil";
import LocationsData from "../data/LocationsData";
import TKLocationInfo from "../model/location/TKLocationInfo";
import TKUIAlertsSummary from "../alerts/TKUIAlertsSummary";
import {TKUIConfigContext, default as TKUIConfigProvider} from "../config/TKUIConfigProvider";
import {alertSeverity} from "../model/trip/Segment";
import Color from "../model/trip/Color";
import {severityColor} from "./TKUITrackTransport.css";
import genStyles from "../css/GenStyle.css";
import {AlertSeverity} from "../model/service/RealTimeAlert";
import {TKError} from "../error/TKError";
import LocationUtil from "../util/LocationUtil";
import TKUIButton from "../buttons/TKUIButton";
import TKErrorHelper, {ERROR_ROUTING_NOT_SUPPORTED} from "../error/TKErrorHelper";
import TKUIErrorView from "../error/TKUIErrorView";
import {TranslationFunction} from "../i18n/TKI18nProvider";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onChange?: (value: Trip) => void;
    onDetailsClicked?: () => void;
    className?: string;
    onShowOptions?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
    cardPresentation?: CardPresentation;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    /**
     * @globaldefault
     */
    values: Trip[]; // SOT of trips is outside, so assume trips come sorted and picking sorting criteria is handled outside.
    /**
     * @globaldefault
     */
    value?: Trip;
    /**
     * @globaldefault
     */
    onChange?: (value: Trip) => void;
    /**
     * @globaldefault
     */
    waiting?: boolean; // TODO: allow values to be undefined so no need for waiting prop.
    /**
     * @globaldefault
     */
    routingError?: TKError;
    /**
     * @globaldefault
     */
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;
    /**
     * @globaldefault
     */
    query: RoutingQuery;
    /**
     * @globaldefault
     */
    sort: TripSort;
    /**
     * @globaldefault
     */
    onSortChange: (sort: TripSort) => void;
    /**
     * @globaldefault
     */
    onQueryUpdate: (update: Partial<RoutingQuery>) => void;
    /**
     * @globaldefault
     */
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
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
    errorActions: (error: TKError) => JSX.Element[];
}

export type TKUIResultsViewProps = IProps;
export type TKUIResultsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIResultsView {...props}/>,
    styles: tKUIResultsDefaultStyle,
    classNamePrefix: "TKUIResultsView",
    randomizeClassNames: false,
    props: (props: IProps) => ({
        errorActions: (error: TKError) => [
            <TKUIButton text={props.t("Plan.a.new.trip")}
                        type={TKUIButtonType.SECONDARY}
                        onClick={() => props.onQueryUpdate({from: null, to: null})}
                        key={"Plan.a.new.trip"}
            />
        ]
    })
};

interface IState {
    tripToBadge: Map<Trip, Badges>;
    expanded?: Trip;
    showTransportSwitches: boolean;
    toLocInfo?: TKLocationInfo;
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

    private getSortOptions(t: TranslationFunction): any[] {
        return Object.values(TripSort)
            .filter((value: TripSort) => value !== TripSort.CARBON)
            .map((value: TripSort) => {
                let label;
                switch (value) {
                    case TripSort.OVERALL:
                        label = t("sorted_by_preferred");
                        break;
                    case TripSort.TIME:
                        label = this.props.query.timePref === TimePreference.ARRIVE ?
                            t("sorted_by_departure") : t("sorted_by_arrival");
                        break;
                    case TripSort.PRICE:
                        label = t("sorted_by_price");
                        break;
                    case TripSort.DURATION:
                        label = t("sorted_by_duration");
                        break;
                }
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
        GATracker.event({
            category: "query input",
            action: "select time pref",
            label: timePref.toLowerCase()
        });
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
        const sortOptions = this.getSortOptions(this.props.t);
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
                            {t("Transport")}
                        </button>
                    </TKUITooltip>
                    }
                </div>
            )
        } : undefined;
        let error: JSX.Element | undefined = undefined;
        if (!this.props.waiting && this.props.routingError) {
            const errorMessage = TKErrorHelper.hasErrorCode(this.props.routingError, ERROR_ROUTING_NOT_SUPPORTED) ?
                t("Routing.from.X.to.X.is.not.yet.supported",
                    {0: LocationUtil.getMainText(this.props.query.from!, t), 1: LocationUtil.getMainText(this.props.query.to!, t)}) + "." :
                this.props.routingError.usererror ? this.props.routingError.message : t("Something.went.wrong.");
            error =
                <TKUIErrorView
                    error={this.props.routingError}
                    message={errorMessage}
                    actions={this.props.errorActions}
                />

        }

        return (
            <TKUICard
                title={this.props.landscape && !error ? t("Routes") : undefined}
                presentation={this.props.cardPresentation || CardPresentation.SLIDE_UP}
                renderSubHeader={!error ? renderSubHeader : undefined}
                slideUpOptions={this.props.slideUpOptions}
                // Flex grow on body seem not take effect on Safari.
                bodyStyle={DeviceUtil.browser === BROWSER.SAFARI ? {height: '100%'} : undefined}
            >
                <div className={classNames(this.props.className, classes.main)}>
                    {!this.props.routingError && this.props.values.length > 0 &&
                    // length > 0 also prevents showing alert before routingError happens, and then so to disappear.
                    this.state.toLocInfo && this.state.toLocInfo.alerts.length > 0 &&
                    // TODO: Define a TKUIStyleOverride that encapsulates all the following, i.e.,
                    // the consumer, the call to replaceStyle, and the provider.
                    <TKUIConfigContext.Consumer>
                        {(config: TKUIConfig) => {
                            const stylesOverride =
                                (theme: TKUITheme) => ({
                                    main: (defaultStyle) => ({
                                        ...defaultStyle,
                                        background: Color.createFromString(severityColor(alertSeverity(this.state.toLocInfo!.alerts), theme)).toRGB(),
                                        color: alertSeverity(this.state.toLocInfo!.alerts) === AlertSeverity.warning ? 'black' : 'white',
                                        ...genStyles.borderRadius(0)
                                    }),
                                    alertIcon: (defaultStyle) => ({
                                        ...defaultStyle,
                                        color: alertSeverity(this.state.toLocInfo!.alerts) === AlertSeverity.warning ? 'black' : 'white',
                                        '& path': {
                                            // stroke: tKUIColors.white,
                                            strokeWidth: '1px',
                                            fill: 'currentColor'
                                        }
                                    }),
                                    numOfAlerts: (defaultStyle) => ({
                                        ...defaultStyle,
                                        ...genStyles.fontM,
                                        fontWeight: 'normal'
                                    }),
                                    rightArrowIcon: (defaultStyle) => ({
                                        ...defaultStyle,
                                        visibility: 'hidden'
                                    })
                                });
                            const configOverride = replaceStyle(config, "TKUIAlertsSummary", stylesOverride);
                            // TODO delete next line
                            // this.state.toLocInfo!.alerts[0].severity = AlertSeverity.info;
                            return (<TKUIConfigProvider config={configOverride}>
                                <TKUIAlertsSummary
                                    alerts={this.state.toLocInfo!.alerts}
                                    slideUpOptions={{
                                        draggable: false,
                                        zIndex: 1006    // To be above query input. TODO: define constants for all these z-index(s).
                                    }}
                                />
                            </TKUIConfigProvider>);
                        }}
                    </TKUIConfigContext.Consumer>
                    }
                    {!error &&
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
                        <div/>
                    </div>}
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
                    {error}
                    {!this.props.waiting && !this.props.routingError && this.props.values.length === 0
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
                                routingError: routingContext.routingError,
                                value: routingContext.selectedTrip,
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
        return {...consumedProps, ...clientProps, onChange: onChangeToPass} as IProps;
    };

interface IClientConsumed extends IClientProps, Partial<IConsumedProps> {}

const Mapper: PropsMapper<IClientConsumed, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!(merger(inputProps, consumedProps))}
        </Consumer>;

/**
 * Show routing results to a specified location from the user's current location, or between specified locations
 * - High-level comparison of trips, showing durations, cost, carbon emissions, and calories burnt
 * - Real-time information, including departure times, traffic, service disruptions, pricing quotes, ETAs
 * - Let users select what modes should be included
 * - Let users set the time to depart or the time to arrive
 */

export default connect((config: TKUIConfig) => config.TKUIRoutingResultsView, config, Mapper);