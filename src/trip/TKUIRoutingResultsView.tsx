import React, { useContext, RefObject } from "react";
import Trip from "../model/trip/Trip";
import { tKUIResultsDefaultStyle } from "./TKUIRoutingResultsView.css";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import TripGroup from "../model/trip/TripGroup";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import RoutingQuery, { TimePreference } from "../model/RoutingQuery";
import { default as TKUITripRow, TKTripCostType } from "./TKUITripRow";
import TKMetricClassifier, { Badges } from "./TKMetricClassifier";
import { Subtract } from "utility-types";
import { TKUIConfig, TKComponentDefaultConfig } from "../config/TKUIConfig";
import { connect, PropsMapper, replaceStyle } from "../config/TKConfigHelper";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import { TKUIRoutingQueryInputClass } from "../query/TKUIRoutingQueryInput";
import TKUITransportSwitchesView from "../options/TKUITransportSwitchesView";
import GATracker from "../analytics/GATracker";
import { Moment } from "moment-timezone";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import TKUISelect, { SelectOption } from "../buttons/TKUISelect";
import DeviceUtil, { BROWSER } from "../util/DeviceUtil";
import LocationsData from "../data/LocationsData";
import TKLocationInfo from "../model/location/TKLocationInfo";
import TKUIAlertsSummary from "../alerts/TKUIAlertsSummary";
import { TKUIConfigContext, default as TKUIConfigProvider } from "../config/TKUIConfigProvider";
import { alertSeverity } from "../model/trip/Segment";
import Color from "../model/trip/Color";
import { severityColor } from "./TKUITrackTransport.css";
import genStyles, { genClassNames } from "../css/GenStyle.css";
import { AlertSeverity } from "../model/service/RealTimeAlert";
import { TKError } from "../error/TKError";
import LocationUtil from "../util/LocationUtil";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import TKErrorHelper, { ERROR_ROUTING_NOT_SUPPORTED } from "../error/TKErrorHelper";
import TKUIErrorView from "../error/TKUIErrorView";
import { TranslationFunction } from "../i18n/TKI18nProvider";
import { cardSpacing, TKUITheme } from "../jss/TKUITheme";
import Environment from "../env/Environment";
import HasCard, { HasCardKeys } from "../card/HasCard";
import { ReactComponent as IconTriangleDown } from '../images/ic-triangle-down.svg';
import Segment from "../model/trip/Segment";
import { TripSort } from "../model/trip/TripSort";
import { IAccessibilityContext, TKAccessibilityContext } from "../config/TKAccessibilityProvider";

interface IClientProps extends TKUIWithStyle<IStyle, IProps>,
    Pick<HasCard, HasCardKeys.cardPresentation | HasCardKeys.slideUpOptions> {

    /**
     * Stating if time select component should be displayed or not.
     * @default true
     */
    showTimeSelect?: boolean;

    /**
     * Stating if the _transports_ button should be displayed or not.
     * @default true
     */
    showTransportsBtn?: boolean;

    /**
     * Function that will be run when user requests details view of a trip (click details button of a trip on desktop,
     * or tap trip on mobile).
     * @ctype
     */
    onDetailsClicked?: () => void;

    /**
     * Function that will be run when the user clicks on button to show transport options.
     * @ctype
     */
    onTransportButtonClick?: () => void;

    /**
     * Function that will be run when the user clicks on button to show full transport options.
     * @ctype
     */
    onShowOptions?: () => void;

    /**
     * Allows to specify a list of action buttons (JSX.Elements) associated with an error related to trip computation,
     * to be rendered below error message. It receives the error and the default list of buttons.
     * @ctype (error: TKError, defaultAtions: JSX.Element[]) => JSX.Element[]
     * @default _Plan a new trip_ action, which clears current query, that led to the error.
     */
    errorActions?: (error: TKError, defaultAtions: JSX.Element[]) => JSX.Element[];

    /**
     * Set this to select which trip metrics to show for each trip group in the routing results card.
     * It is important to note that, while you may specify a trip metric to be shown, if
     * such metric is unavailable in the response of the routing request, it will not be
     * shown. In addition, the order specified here is the order in which the metrics will be displayed.
     * The default metrics to show are `price`, `calories` and `carbon`.
     */
    tripMetricsToShow?: TKTripCostType[];

    /**
     * Set this to the allowed badges to show on a trip group
     * Badges will only be shown if the related scores for that metric are sufficiently different for the trips.
     * Badges order matters: a trip matching two or more badges will get the first matching badge according to the specified order.
     * This setting is independent of `tripMetricsToShow`.
     * By default all badges are shown.
     */
    tripBadgesToShow?: Badges[];

    /**
     * Set this to the specify the trip sortings to show. The order of the elements in this array determine the order of the
     * options in the sort select.
     */
    tripSortingsToShow?: TripSort[];
}

interface IConsumedProps extends TKUIViewportUtilProps, IAccessibilityContext {
    /**
     * Array of routing results to be displayed. It's assumed that trips come already sorted according to selected sort
     * criterion (which is handled through ```sort``` and ```onSortChange``` properties in a controlled way).
     * @ctype
     * @default {@link TKState#trips}
     */
    values: Trip[];

    /**
     * Stating the trip in ```values``` that is currently selected.
     * @ctype
     * @default {@link TKState#selectedTrip}
     */
    value?: Trip;

    /**
     * Trip selection change callback
     * @ctype
     * @default {@link TKState#onChange}
     */
    onChange?: (value: Trip) => void;

    /**
     * Function that will run when user picks an alternative trip from a trip group.
     * @ctype
     * @default {@link TKState#onAlternativeChange}
     */
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;

    /**
     * Stating if we are waiting for routing results to arrive from TripGo api request.
     * @default {@link TKState#waiting}
     */
    waiting: boolean;

    /**
     * Criterion by which routing results passed through ```values``` prop are sorted. <br/>
     * Values: TripSort.OVERALL, TripSort.TIME, TripSort.DURATION, TripSort.PRICE, TripSort.CARBON.
     * @ctype
     * @default {@link TKState#sort}
     */
    sort: TripSort;

    /**
     * Sort criterion change callback.
     * @ctype
     * @default {@link TKState#onSortChange}
     */
    onSortChange: (sort: TripSort) => void;

    /**
     * Specifying an error object describing a routing error, if such an error happened.
     * @default {@link TKState#routingError}
     */
    routingError?: TKError;

    /**
     * Routing query to which ```values``` trips correspond.
     * @ctype
     * @default {@link TKState#query}
     */
    query: RoutingQuery;

    /**
     * Routing query change callback, since this component allows the user to set the time to depart or the time to
     * arrive (part of the routing query).
     * @ctype
     * @default {@link TKState#onQueryChange}
     */
    onQueryChange: (query: RoutingQuery) => void;

    /**
     * @default {@link TKState#onQueryUpdate}
     * @ignore
     */
    onQueryUpdate: (update: Partial<RoutingQuery>) => void;

    /**
     * Id of timezone to consider for time display / input.
     * @default Timezone of the current region: {@link TKState#region}.timezone
     */
    timezone?: string;

    setSelectedTripSegment: (segment?: Segment) => void;

    transportBtnText?: string;

    config: TKUIConfig;
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

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIRoutingResultsViewProps = IProps;
export type TKUIRoutingResultsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIRoutingResultsView {...props} />,
    styles: tKUIResultsDefaultStyle,
    classNamePrefix: "TKUIRoutingResultsView"
};

interface IState {
    tripToBadge: Map<Trip, Badges>;
    expanded?: Trip;
    showTransportSwitches: boolean;
    toLocInfo?: TKLocationInfo;
}

class TKUIRoutingResultsView extends React.Component<IProps, IState> {

    private rowRefs: RefObject<HTMLElement>[] = [];
    private timePrefOptions: SelectOption[];
    private sortOptions: SelectOption[];

    static defaultProps: Partial<IProps> = {
        tripSortingsToShow: Object.values(TripSort).filter((value: TripSort) => value !== TripSort.CARBON)
    };

    constructor(props: IProps) {
        super(props);
        this.state = {
            tripToBadge: new Map<Trip, Badges>(),
            showTransportSwitches: false
        };
        // Create options on constructor so it happens just once, doing it on render causes issues.
        this.timePrefOptions = TKUIRoutingQueryInputClass.getTimePrefOptions(this.props.t);
        this.sortOptions = this.getSortOptions(this.props.t);
        this.getDefaultErrorActions = this.getDefaultErrorActions.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        // This is necessary since default trip sort is selected in WithRoutingResults, based on 
        // TKUserProfile.defaultTripSort, with fallback to TripSort.OVERALL, and so the default trip
        // sort may not be among the tripSortingsToShow. Improve the sync of this.
        if (props.tripSortingsToShow!.length > 0 && !props.tripSortingsToShow!.includes(props.sort)) {
            props.onSortChange(props.tripSortingsToShow![0]);
        }
    }

    private getDefaultErrorActions(error: TKError) {
        return [
            <TKUIButton text={this.props.t("Plan.a.new.trip")}
                type={TKUIButtonType.SECONDARY}
                onClick={() => this.props.onQueryUpdate({ from: null, to: null })}
                key={"Plan.a.new.trip"}
            />
        ]
    }

    private getSortOptions(t: TranslationFunction): SelectOption[] {
        return this.props.tripSortingsToShow!.map((value: TripSort) => {
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
                case TripSort.CALORIES:
                    label = t("sorted_by_healthiest");
                    break;
            }
            return { value: value, label: label };
        });
    }

    private onKeyDown(e: any) {
        if (e.keyCode === 38 || e.keyCode === 40) { // up / down arrows
            const selectedI = this.props.value ? this.props.values.indexOf(this.props.value) : 0;
            if (this.props.onChange) {
                const nextIndex = this.nextIndex(selectedI, e.keyCode === 38);
                this.props.onChange(this.props.values[nextIndex]);
                this.rowRefs[nextIndex]?.current?.focus();
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
        const injectedStyles = this.props.injectedStyles;
        const routingQuery = this.props.query;
        const datePickerDisabled = routingQuery.timePref === TimePreference.NOW;
        const showTimeSelect = this.props.showTimeSelect !== undefined ? this.props.showTimeSelect : true;
        const showTransportsBtn = this.props.showTransportsBtn !== undefined ? this.props.showTransportsBtn : true;

        let error: JSX.Element | undefined = undefined;
        const routingError = this.props.routingError;
        if (!this.props.waiting && routingError) {
            const errorMessage = TKErrorHelper.hasErrorCode(routingError, ERROR_ROUTING_NOT_SUPPORTED) ?
                t("Routing.from.X.to.X.is.not.yet.supported",
                    { 0: LocationUtil.getMainText(this.props.query.from!, t), 1: LocationUtil.getMainText(this.props.query.to!, t) }) + "." :
                routingError.usererror || Environment.isDev() || Environment.isBeta() ? routingError.message : t("Something.went.wrong.");
            const defaultErrorActions = this.getDefaultErrorActions(routingError);
            const errorActions = this.props.errorActions ? this.props.errorActions(routingError, defaultErrorActions) :
                defaultErrorActions;
            error =
                <TKUIErrorView
                    error={routingError}
                    message={errorMessage}
                    actions={errorActions}
                />

        }

        const renderSubHeader = (!error || this.props.values.length > 0) && (showTimeSelect || showTransportsBtn) ? () => {
            const SelectDownArrow = (props: any) => <IconTriangleDown style={{ width: '9px', height: '9px' }} {...props} />;
            return (
                <div>
                    <div className={classes.footer}
                        style={!showTimeSelect && showTransportsBtn ? {
                            justifyContent: 'flex-end' // When making JSS styles updates dynamic this can be moved to .css.ts
                        } : undefined}
                    >
                        {showTimeSelect &&
                            <TKUISelect
                                options={this.timePrefOptions}
                                value={this.timePrefOptions.find((option: any) => option.value === routingQuery.timePref)}
                                onChange={(option) => this.onPrefChange(option.value)}
                                styles={() => ({
                                    main: overrideClass(this.props.injectedStyles.timePrefSelect),
                                    menu: overrideClass({ marginTop: '3px' })
                                })}
                            />}
                        {showTimeSelect && routingQuery.timePref !== TimePreference.NOW && this.props.timezone &&
                            <TKUIDateTimePicker     // Switch rotingQuery.time to region timezone.
                                value={routingQuery.time}
                                timeZone={this.props.timezone}
                                onChange={(date: Moment) => this.updateQuery({ time: date })}
                                timeFormat={DateTimeUtil.timeFormat()}
                                dateFormat={DateTimeUtil.dateTimeFormat()}
                                disabled={datePickerDisabled}
                            />
                        }
                        {showTransportsBtn &&
                            <button className={classes.transportsBtn}
                                onClick={this.props.onTransportButtonClick ?? (() => this.setState({ showTransportSwitches: !this.state.showTransportSwitches }))}
                                aria-expanded={this.state.showTransportSwitches}
                            >
                                {this.props.transportBtnText ?? t("Transport")}
                                {!this.props.onTransportButtonClick &&
                                    <SelectDownArrow className={this.state.showTransportSwitches ? genClassNames.rotate180 : undefined} />}
                            </button>}
                    </div>
                    {showTransportsBtn && this.state.showTransportSwitches && <TKUITransportSwitchesView inline={true} />}
                </div>
            )
        } : undefined;

        return (
            <TKUICard
                title={this.props.landscape && (!error || this.props.values.length > 0) ? t("Routes") : undefined}
                presentation={this.props.cardPresentation || CardPresentation.SLIDE_UP}
                renderSubHeader={renderSubHeader}
                slideUpOptions={this.props.slideUpOptions}
                // Flex grow on body seem not take effect on Safari.
                styles={DeviceUtil.browser === BROWSER.SAFARI ? { body: overrideClass({ height: '100%' }) } : undefined}
            >
                <div className={classes.main}>
                    {!routingError && this.props.values.length > 0 &&
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
                                return (<TKUIConfigProvider config={configOverride}>
                                    <TKUIAlertsSummary
                                        alerts={this.state.toLocInfo!.alerts}
                                        slideUpOptions={{
                                            draggable: false,
                                            modalUp: this.props.landscape ? { top: 176 + 2 * cardSpacing(), unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                                        }}
                                    />
                                </TKUIConfigProvider>);
                            }}
                        </TKUIConfigContext.Consumer>
                    }
                    {this.props.tripSortingsToShow!.length > 1 && (!error || this.props.values.length > 0) &&
                        <div className={classes.sortBar}>
                            <TKUISelect
                                options={this.sortOptions}
                                value={this.sortOptions.find((option: any) => option.value === this.props.sort)}
                                onChange={(option) => this.props.onSortChange(option.value as TripSort)}
                                styles={{
                                    main: overrideClass(injectedStyles.sortSelect),
                                    control: overrideClass(injectedStyles.sortSelectControl),
                                    menu: overrideClass({ marginTop: '3px' })
                                }}
                                components={{
                                    IndicatorsContainer: (props: any) => null
                                }}
                            />
                            <div />
                        </div>}
                    {this.props.values.map((trip: Trip, index: number) =>
                        <TKUITripRow
                            value={trip}
                            selected={trip === this.props.value}
                            styles={{ main: overrideClass(injectedStyles.row) }}
                            onClick={() => {
                                this.props.onChange && this.props.onChange(trip);
                                DeviceUtil.isPhone && this.props.onDetailsClicked && this.props.onDetailsClicked();
                            }}
                            onFocus={() => this.props.onChange && this.props.onChange(trip)}
                            onAlternativeClick={this.props.onAlternativeChange}
                            onDetailClick={!DeviceUtil.isPhone ? this.props.onDetailsClicked : undefined}
                            onKeyDown={this.onKeyDown}
                            // Use unique id for trip, when available, or index + weighting score if not.
                            // Using just index as key causes problems with focus: if i-th trip is focused, and then
                            // if more trips arrive and the i-th trip is now other trip, then react interpreats that the
                            // node with key = i has changed the value (trip) property, so it shows in that node the new
                            // i-th trip, but focus remains on the i-th node (which is other trip), instead of remaining
                            // attached to the trip. Using the index + weighting score as fallback cause sometimes that
                            // the focus is lost, but at least avoids it to be re-assigned to the wrong trip.
                            key={trip.getKey(String(index))}
                            reference={(el: any) => this.rowRefs[index] = el}
                            badge={this.state.tripToBadge.get(trip)}
                            expanded={trip === this.state.expanded}
                            onExpand={(expand: boolean) =>
                                this.setState({
                                    expanded: expand ? trip : undefined
                                })}
                            onSegmentSelected={this.props.setSelectedTripSegment}
                            isUserTabbing={this.props.isUserTabbing}
                            tripMetricsToShow={this.props.tripMetricsToShow}
                        />
                    )}
                    {error}
                    {!this.props.waiting && !routingError && this.props.values.length === 0
                        && <div className={classes.noResults} role="status" aria-label={t("No.routes.found.")}>{t("No.routes.found.")}</div>}
                    {this.props.waiting ?
                        <IconSpin className={classes.iconLoading} focusable="false" role="status" aria-label="Waiting results" /> : null}
                </div>
            </TKUICard>
        );
    }

    private refreshBadges() {
        this.setState({
            tripToBadge: TKMetricClassifier.getTripClassifications(this.props.values,
                {
                    badges: this.props.tripBadgesToShow,
                    preferredTripCompareFc: this.props.config.tripCompareFc
                })
        });
    }

    private automaticSelectionTimeout: any;

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        // Focus first selected trip row.
        if (this.props.isUserTabbing && !prevProps.value && this.props.value) {
            this.rowRefs[this.props.values.indexOf(this.props.value)]?.current?.focus();
        }

        // Clear automatic selection timeout when resetting trips
        if (!this.props.values || this.props.values.length === 0) {
            clearTimeout(this.automaticSelectionTimeout);
            this.automaticSelectionTimeout = undefined;
        }

        // Automatic trip selection a while after first group of trips arrived
        if (!prevProps.value && this.props.values && this.props.values.length > 0 && !this.automaticSelectionTimeout) {
            this.automaticSelectionTimeout = setTimeout(() => {
                if (this.props.values && this.props.values.length > 0 && this.props.onChange && !this.props.value
                    && !this.state.showTransportSwitches) { // Avoid automatic trip selection if showTransportSwitches is showing.
                    this.props.onChange(this.props.values[0]);
                }
            }, 2000);
        }

        if (this.props.values && prevProps.values !== this.props.values) {
            this.refreshBadges();
        }

        if (this.props.query.to !== prevProps.query.to) {
            this.setState({ toLocInfo: undefined });
            this.refreshAlert();
        }

        // To refresh translations of time pref strings after i18n promise resolves (i18nOverridden turn true),
        // which are computed on component constructor, and so do not automatically update on re-render.
        if (this.props.i18nOverridden !== prevProps.i18nOverridden) {
            this.timePrefOptions = TKUIRoutingQueryInputClass.getTimePrefOptions(this.props.t);
            this.sortOptions = this.getSortOptions(this.props.t);
        }

        // To refresh time sort label according to time pref.
        if (this.props.query.timePref !== prevProps.query.timePref) {            
            this.sortOptions = this.getSortOptions(this.props.t);
        }
    }

    public componentDidMount() {
        this.refreshBadges();
        this.refreshAlert();
    }

    private refreshAlert() {
        this.props.query.to && LocationsData.instance.getLocationInfo(this.props.query.to)
            .then((locInfo: TKLocationInfo) => this.setState({ toLocInfo: locInfo }))
            .catch((e) => console.log(e));
    }

    public componentWillUnmount() {
        // Clear automatic selection timeout
        if (this.automaticSelectionTimeout) {
            clearTimeout(this.automaticSelectionTimeout);
        }
    }
}

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> =
    (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
        const config = useContext(TKUIConfigContext);
        return (
            <TKAccessibilityContext.Consumer>
                {accessibilityContext =>
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
                                        onQueryChange: routingContext.onQueryChange,
                                        onQueryUpdate: routingContext.onQueryUpdate,
                                        timezone: routingContext.region ? routingContext.region.timezone : undefined,
                                        setSelectedTripSegment: routingContext.setSelectedTripSegment,
                                        ...viewportProps,
                                        ...accessibilityContext,
                                        config
                                    };
                                    return props.children!(consumerProps);
                                }}
                            </RoutingResultsContext.Consumer>
                        }
                    </TKUIViewportUtil>
                }
            </TKAccessibilityContext.Consumer>
        );
    };

interface IClientConsumed extends IClientProps, Partial<IConsumedProps> { }

const Mapper: PropsMapper<IClientConsumed, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({ ...consumedProps, ...inputProps })}
        </Consumer>;

/**
 * Displays routing results obtained from TripGo api for a routing query (_start_ and _end_ locations, and _time to depar_
 * or _arrive_).
 * - High-level comparison of trips, showing durations, cost, carbon emissions, and calories burnt.
 * - Real-time information, including departure times, traffic, service disruptions, pricing quotes, ETAs.
 * - Let users select what modes should be included.
 * - Let users set the time to depart or the time to arrive.
 *
 * The component does not compute trips by itself, but just displays the list of trips ([](Trip) instances) passed
 * through the ```values``` property, so trips computation via TripGo api from the routing query happens outside.
 * However, as explained in [this section](#/Main%20SDK%20component%3A%20TKRoot), this component gets automatically
 * connected to the (global) _state of the SDK_, via it's properties (and using React Contexts), when we don't pass
 * values for the (so called) _connection props_, which get their defaults values from the global state.
 * For instance, ```values``` is a connection property, so if not specified it will get it's value from the global SDK
 * state: the current list of trips for the current query.
 *
 * It also receives a ```value``` prop specifying the trip in ```values``` that is currently selected (if any),
 * as well as an ```onChange``` callback function prop to notify on trip selection change (e.g. user clicking on a
 * different trip), which are both also connection props.
 *
 * Since it allows the user to set the time to depart or the time to arrive (part of a routing query) then it receives
 * ```query``` ([](RoutingQuery) instance) and ```onQueryChange``` props, both connection props, so automatically
 * connected to the SDK global state if not provided.
 *
 * In a typical usage, connection props will be left unspecified (i.e. connected to SDK state), and so the component will
 * display trips for the currently specified query. If query changes (e.g. user changed time in this component, or
 * interacted with [query input component](TKUIRoutingQueryInput), then the SDK environment will recompute trips, and
 * ```values``` props will be updated accordingly.
 *
 * In a similar way, the SDK environment automatically performs real-time updates of trips.
 */

export default connect((config: TKUIConfig) => config.TKUIRoutingResultsView, config, Mapper);