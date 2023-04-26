import React, { ChangeEvent } from "react";
import {
    IServiceResultsContext,
    ServiceResultsContext
} from "../service/ServiceResultsProvider";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { ReactComponent as IconClock } from "../images/ic-clock.svg";
import DateTimeUtil from "../util/DateTimeUtil";
import DaySeparator from "./DaySeparator";
import { Moment } from "moment";
import TKUICard, { CardPresentation, TKUICardClientProps } from "../card/TKUICard";
import { CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUITimetableDefaultStyle } from "./TKUITimetableView.css";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import TKUIServiceDepartureRow from "./TKUIServiceDepartureRow";
import StopLocation from "../model/StopLocation";
import FavouriteStop from "../model/favourite/FavouriteStop";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import TKUIRouteToLocationAction from "../action/TKUIRouteToLocationAction";
import TKShareHelper from "../share/TKShareHelper";
import TKUIShareAction from "../action/TKUIShareAction";
import { TKUIButtonType } from "../buttons/TKUIButton";
import TransportUtil from "../trip/TransportUtil";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import RegionsData from "../data/RegionsData";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import TKUIErrorView from "../error/TKUIErrorView";
import { TKError } from "../error/TKError";
import { serviceTextColor } from "./TKUIServiceDepartureRow.css";
import DeviceUtil, { BROWSER } from "../util/DeviceUtil";
import HasCard, { HasCardKeys } from "../card/HasCard";
import TKUISlideUpOptions from "../card/TKUISlideUpOptions";

interface IClientProps extends IConsumedProps, TKUIWithStyle<IStyle, IProps>,
    Pick<HasCard, HasCardKeys.onRequestClose | HasCardKeys.cardPresentation | HasCardKeys.slideUpOptions> {

    /**
     * Allows to specify a list of action buttons (JSX.Elements) associated with the stop, to be rendered on card header.
     * It receives the stop and the default list of buttons.
     * @ctype (stop: StopLocation, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Direction_, _Add to favourites_, and _Share_ actions, which are instances of [](TKUIButton).
     */
    actions?: (stop: StopLocation, defaultActions: JSX.Element[]) => JSX.Element[];

    /**
     * @default true
     */
    showServicesOnHeader?: boolean;

    /**
     * @default true
     */
    initScrollToNow?: boolean;

    /** @ignore */
    errorActions?: (error: TKError) => JSX.Element[];

    /**
     * @ctype TKUICard props
     */
    cardProps?: TKUICardClientProps;

    /**
     * @ignore
     * @deprecated in favor of `cardProps`
     */
    [HasCardKeys.cardPresentation]?: CardPresentation;

    /**
     * @ignore
     * @deprecated in favor of `cardProps`
     */
    [HasCardKeys.slideUpOptions]?: TKUISlideUpOptions;
}

interface IConsumedProps extends
    Pick<IServiceResultsContext, "stop" | "onInitTimeChange" | "onRequestMore" | "departures" | "serviceError" | "selectedService">,
    Pick<Partial<IServiceResultsContext>, "title" | "timetableInitTime" | "timetableFilter" | "onFilterChange" | "waiting" | "onServiceSelection"> {

    /**
     * @ctype
     * @tkstateprop {@link TKState#stop}
     * @order 1
     */
    stop?: StopLocation;

    /**
     * @ctype
     * @tkstateprop {@link TKState#departures}
     * @order 2
     */
    departures: ServiceDeparture[];

    /**
     * @ctype
     * @tkstateprop {@link TKState#onRequestMore}
     * @order 3
     */
    onRequestMore?: () => void;

    /**
     * @ctype
     * @tkstateprop {@link TKState#selectedService}
     * @order 4
     */
    selectedService?: ServiceDeparture;

    /**
     * @ctype
     * @tkstateprop {@link TKState#onServiceSelection}
     * @order 5
     */
    onServiceSelection?: (departure?: ServiceDeparture) => void;

    /**
     * @ctype
     * @tkstateprop {@link TKState#timetableInitTime}. 
     * @default now
     * @order 6
     */
    timetableInitTime?: Moment;

    /**
     * @ctype
     * @tkstateprop {@link TKState#onInitTimeChange}
     * @order 7
     */
    onInitTimeChange?: (initTime: Moment) => void;

    /**
     * @ctype     
     * @tkstateprop {@link TKState#timetableFilter}
     * @order 8
     */
    timetableFilter?: string;

    /**
     * @ctype
     * @tkstateprop {@link TKState#onFilterChange}
     * @order 9
     * @divider
     */
    onFilterChange?: (filter: string) => void;

    /**
     * @ctype
     * @tkstateprop {@link TKState#title}
     */
    title?: string;

    /**
     * @ctype
     * @tkstateprop {@link TKState#waiting}
     * @default false
     */
    waiting?: boolean;

    /**
     * @ctype
     * @tkstateprop {@link TKState#serviceError}
     */
    serviceError?: TKError;

}

interface IStyle {
    main: CSSProps<IProps>;
    listPanel: CSSProps<IProps>;
    containerPanel: CSSProps<IProps>;
    subHeader: CSSProps<IProps>;
    serviceList: CSSProps<IProps>;
    serviceNumber: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
    secondaryBar: CSSProps<IProps>;
    filterInput: CSSProps<IProps>;
    faceButtonClass: CSSProps<IProps>;
    dapartureRow: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
    noResults: CSSProps<IProps>;
}

export interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUITimetableViewProps = IProps;
export type TKUITimetableViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITimetableView {...props} />,
    styles: tKUITimetableDefaultStyle,
    classNamePrefix: "TKUITimetableView"
};

type IDefaultProps = Required<Pick<IProps, "timetableInitTime" | "showServicesOnHeader" | "initScrollToNow" | "waiting">>;

class TKUITimetableView extends React.Component<IProps & IDefaultProps, {}> {

    private scrollRef: any;

    static defaultProps: IDefaultProps = {
        timetableInitTime: DateTimeUtil.getNow(),
        showServicesOnHeader: true,
        initScrollToNow: true,
        waiting: false
    }

    constructor(props: IProps & IDefaultProps) {
        super(props);
        this.getDefaultActions = this.getDefaultActions.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
    }

    private getDefaultActions(stop: StopLocation) {
        return [
            <TKUIRouteToLocationAction location={stop} buttonType={TKUIButtonType.PRIMARY_VERTICAL} key={"actionToLoc"} />,
            <TKUIFavouriteAction favourite={FavouriteStop.create(stop)} vertical={true} key={"actionFav"} />,
            <TKUIShareAction
                title={this.props.t("Share")}
                message={""}
                link={() => RegionsData.instance.requireRegions()
                    .then(() => TKShareHelper.getShareTimetable(stop))}
                vertical={true}
                key={"actionShare"}
            />
        ];
    }

    private onScroll(e: any) {
        const scrollPanel = e.target;
        if (this.props.onRequestMore && scrollPanel.scrollTop + scrollPanel.clientHeight > scrollPanel.scrollHeight - 30) {
            this.props.onRequestMore();
        }
    }

    private onFilterChange(e: ChangeEvent<HTMLInputElement>) {
        if (this.props.onFilterChange) {
            this.props.onFilterChange(e.target.value)
        }
    }

    public render(): React.ReactNode {
        const { stop, showServicesOnHeader } = this.props;
        const parentStopMode = stop && stop.class === "ParentStopLocation" && stop.modeInfo && stop.modeInfo.alt;
        const subtitle = parentStopMode ? parentStopMode.charAt(0).toUpperCase() + parentStopMode.slice(1) + " station"
            : undefined;
        const classes = this.props.classes;
        const t = this.props.t;
        let actionElems;
        if (stop) {
            const defaultActions = stop && this.getDefaultActions(stop);
            const actions = this.props.actions ? this.props.actions(stop, defaultActions) : defaultActions;
            actionElems = (actions && actions.length > 0) ?
                <TKUIActionsView
                    actions={actions}
                    className={classes.actionsPanel}
                /> : undefined;
        }
        const serviceListSamples = this.props.departures
            .reduce((elems: ServiceDeparture[], departure: ServiceDeparture, i: number) => {
                if (!elems.find((elem: ServiceDeparture) => departure.serviceNumber === elem.serviceNumber)) {
                    elems.push(departure)
                }
                return elems;
            }, []);
        const slideUpOptions = this.props.slideUpOptions ? this.props.slideUpOptions : {};
        const renderCustomInput = (value: any, onClick: any, onKeyDown: any, ref: any) => (
            // Pass onKeyDown to preserve keyboard navigation when using react-datepicker.
            <button className={classes.faceButtonClass} onClick={onClick} onKeyDown={onKeyDown} ref={ref}
                aria-label="Show datetime picker">
                <IconClock />
            </button>
        );
        let error: JSX.Element | undefined = undefined;
        if (!this.props.waiting && this.props.serviceError) {
            const errorMessage = this.props.serviceError.usererror ? this.props.serviceError.message : t("Something.went.wrong.");
            error =
                <TKUIErrorView
                    error={this.props.serviceError}
                    message={errorMessage}
                    actions={this.props.errorActions && this.props.errorActions(this.props.serviceError)}
                />
        }
        return (
            <TKUICard
                title={this.props.title}
                subtitle={subtitle}
                renderSubHeader={(!showServicesOnHeader && !actionElems) ? undefined :
                    () =>
                        <div className={classes.subHeader}>
                            {showServicesOnHeader &&
                                <div className={classes.serviceList}>
                                    {serviceListSamples.map((service: ServiceDeparture, i: number) => {
                                        return service.serviceNumber &&
                                            <div className={classes.serviceNumber}
                                                style={{
                                                    backgroundColor: TransportUtil.getServiceDepartureColor(service),
                                                    color: serviceTextColor(service)
                                                }}
                                                key={i}
                                            >
                                                {service.serviceNumber}
                                            </div>
                                    })}
                                </div>}
                            {actionElems}
                        </div>
                }
                presentation={this.props.cardPresentation !== undefined ? this.props.cardPresentation : CardPresentation.SLIDE_UP}
                onRequestClose={this.props.onRequestClose}
                slideUpOptions={slideUpOptions}
                // Timetable should not scroll at body, but at panel below filter, on body content. Next is just required
                // for Safari so div below filter can actually get a height and scroll happens there.
                styles={DeviceUtil.browser === BROWSER.SAFARI ? { body: overrideClass({ height: '100%' }) } : undefined}
                {...this.props.cardProps}
            >
                {error ? error :
                    <div className={classes.main}>
                        {(this.props.onFilterChange || this.props.onInitTimeChange) &&
                            <div className={classes.secondaryBar}>
                                {this.props.onFilterChange &&
                                    <input type="text"
                                        spellCheck={false}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        className={classes.filterInput}
                                        placeholder={t("Search")}
                                        value={this.props.timetableFilter}
                                        onChange={this.onFilterChange} />}
                                {this.props.onInitTimeChange &&
                                    <TKUIDateTimePicker
                                        value={this.props.timetableInitTime}
                                        timeZone={stop && stop.timezone}
                                        onChange={this.props.onInitTimeChange}
                                        renderCustomInput={renderCustomInput}
                                        popperPlacement="bottom-end"
                                        popperModifiers={{
                                            offset: {
                                                enabled: true,
                                                offset: "15px, 0px"
                                            }
                                        }}
                                    />}
                            </div>}
                        <div className={classes.listPanel}>
                            <div
                                className={classes.containerPanel}
                                onScroll={this.onScroll}
                                ref={(scrollRef: any) => this.scrollRef = scrollRef}
                            >
                                {this.props.departures.reduce((elems: JSX.Element[], departure: ServiceDeparture, i: number) => {
                                    const showDayLabel = i === 0 ||
                                        DateTimeUtil.momentFromTimeTZ(this.props.departures[i - 1].actualStartTime * 1000, stop && stop.timezone).format("ddd D") !==
                                        DateTimeUtil.momentFromTimeTZ(departure.actualStartTime * 1000, stop && stop.timezone).format("ddd D");
                                    if (showDayLabel) {
                                        elems.push(<DaySeparator date={DateTimeUtil.momentFromTimeTZ(departure.actualStartTime * 1000, stop && stop.timezone)}
                                            key={"day-" + i}
                                            scrollRef={this.scrollRef}
                                            isDark={this.props.theme.isDark}
                                        />)
                                    }
                                    elems.push(
                                        <div className={classes.dapartureRow} key={i}>
                                            <TKUIServiceDepartureRow
                                                value={departure}
                                                onClick={() => {
                                                    if (this.props.onServiceSelection) {
                                                        this.props.onServiceSelection(departure)
                                                    }
                                                }}
                                                selected={departure === this.props.selectedService}
                                            />
                                        </div>
                                    );
                                    return elems;
                                }, [])}
                                {this.props.waiting ?
                                    <IconSpin className={classes.iconLoading} focusable="false" /> : null}
                                {!this.props.waiting && !this.props.serviceError && this.props.departures.length === 0
                                    && <div className={classes.noResults}>{"No results"}</div>}
                            </div>
                        </div>
                    </div>}
            </TKUICard>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (prevProps.departures.length === 0 && this.props.departures.length > 0) {
            const now = DateTimeUtil.getNow().valueOf() / 60000; // In minutes, with decimals
            const nextDepartureIndex = this.props.departures.findIndex((departure: ServiceDeparture) => {
                const actualStartTime = departure.actualStartTime / 60; // In minutes, with decimals
                let timeToDepart = actualStartTime - now;   // In minutes
                // Round negative up, so less than a minute in the past from now is considered 'Now'.
                timeToDepart = timeToDepart < 0 ? Math.ceil(timeToDepart) : Math.floor(timeToDepart);
                return timeToDepart >= 0;   // To be consistent with timeToDepart calculation in TKUIServiceDepartureRow
            });
            if (this.props.initScrollToNow && nextDepartureIndex !== -1 && this.scrollRef) {
                Array.prototype.slice.call(this.scrollRef.children).filter((child: any) =>
                    child.className.includes // This is to filter svg IconSpin, which has className.includes undefined
                    && !child.className.includes("DaySeparator")
                )[nextDepartureIndex].scrollIntoView();
            }
        }
    }

}

const Consumer: React.FunctionComponent<{ children: (props: IServiceResultsContext) => React.ReactNode }> = (props: { children: (props: IServiceResultsContext) => React.ReactNode }) => {
    return (
        <ServiceResultsContext.Consumer>
            {(serviceContext: IServiceResultsContext) => (
                props.children!(serviceContext)
            )}
        </ServiceResultsContext.Consumer>
    );
};

/**
 * Displays service departures from a given stop or larger satation obtained from the TripGo api. 
 * - Real-time information where available, including real-time departure and arrival times, service disruptions and crowdedness of individual services.
 * - Optionally with wheelchair accessibility information. 
 * - Let users select a departure, set the time of the first departure time, enter a text filter
 * 
 * It has the following additional customisation points:
 * - Card options via [```cardProps```](#/Components%20API/TKUITimetableView?id=cardProps) property.
 * - Customisable list of action buttons via [```actions```](#/Components%20API/TKUITimetableView?id=actions) property.
 * 
 * You can connect the component to the SDK global state, {@link TKState}, by forwarding the props
 * provided by TKUITimetableViewHelpers.TKStateProps, in the following way:
 * 
 *  ```
 *   <TKUITimetableViewHelpers.TKStateProps>
 *      {stateProps => 
 *          <TKUITimetableView 
 *              {...stateProps}
 *              // Other props
 *          />}
 *   </TKUITimetableViewHelpers.TKStateProps>
 *  ```
 * 
 *
 * In this way, the component will display departures from the current stop in SDK state, {@link TKState#stop}, as well as reflect
 * real-time updates.
 */

export default connect((config: TKUIConfig) => config.TKUITimetableView, config, mapperFromFunction((clientProps: IClientProps) => clientProps));

export const TKUITimetableViewHelpers = {
    TKStateProps: Consumer
}