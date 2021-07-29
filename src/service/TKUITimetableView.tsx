import React, {ChangeEvent} from "react";
import {
    IServiceResultsContext,
    ServiceResultsContext
} from "../service/ServiceResultsProvider";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {ReactComponent as IconClock} from "../images/ic-clock.svg";
import DateTimeUtil from "../util/DateTimeUtil";
import DaySeparator from "./DaySeparator";
import {Moment} from "moment";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import {CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUITimetableDefaultStyle} from "./TKUITimetableView.css";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import TKUIServiceDepartureRow from "./TKUIServiceDepartureRow";
import StopLocation from "../model/StopLocation";
import FavouriteStop from "../model/favourite/FavouriteStop";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import TKUIRouteToLocationAction from "../action/TKUIRouteToLocationAction";
import TKShareHelper from "../share/TKShareHelper";
import TKUIShareAction from "../action/TKUIShareAction";
import {TKUIButtonType} from "../buttons/TKUIButton";
import TKUIScrollForCard from "../card/TKUIScrollForCard";
import TransportUtil from "../trip/TransportUtil";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import RegionsData from "../data/RegionsData";
import {TKI18nContextProps, TKI18nContext} from "../i18n/TKI18nProvider";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import TKUIErrorView from "../error/TKUIErrorView";
import {TKError} from "../error/TKError";
import {serviceTextColor} from "./TKUIServiceDepartureRow.css";
import DeviceUtil, {BROWSER} from "../util/DeviceUtil";
import HasCard, {HasCardKeys} from "../card/HasCard";
import Segment from "../model/trip/Segment";

interface IClientProps extends TKUIWithStyle<IStyle, IProps>,
    Pick<HasCard, HasCardKeys.onRequestClose | HasCardKeys.cardPresentation | HasCardKeys.slideUpOptions> {

    /**
     * Allows to specify a list of action buttons (JSX.Elements) associated with the stop, to be rendered on card header.
     * It receives the stop and the default list of buttons.
     * @ctype (stop: StopLocation, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Direction_, _Add to favourites_, and _Share_ actions, which are instances of [](TKUIButton).
     */
    actions?: (stop: StopLocation, defaultActions: JSX.Element[]) => JSX.Element[];

    /** @ignore */
    errorActions?: (error: TKError) => JSX.Element[];
}

interface IConsumedProps extends Pick<IServiceResultsContext, "stop" | "timetableForSegment" | "timetableInitTime" |
    "onInitTimeChange" | "timetableFilter" | "onFilterChange" | "onRequestMore" | "departures" | "waiting" |
    "serviceError" | "title" | "selectedService" | "onServiceSelection"> {

    /**
     * @ctype
     * @default {@link TKState#stop}
     */
    stop?: StopLocation;

    /**
     * @ctype
     * @default {@link TKState#timetableForSegment}
     */
    timetableForSegment?: Segment;

    /**
     * @ctype
     * @default {@link TKState#timetableInitTime}
     */
    timetableInitTime: Moment;

    /**
     * @ctype
     * @default {@link TKState#onInitTimeChange}
     */
    onInitTimeChange?: (initTime: Moment) => void;

    /**
     * @ctype
     * @default {@link TKState#timetableFilter}
     */
    timetableFilter: string;

    /**
     * @ctype
     * @default {@link TKState#onFilterChange}
     */
    onFilterChange: (filter: string) => void;

    /**
     * @ctype
     * @default {@link TKState#onRequestMore}
     */
    onRequestMore?: () => void;

    /**
     * @ctype
     * @default {@link TKState#departures}
     */
    departures: ServiceDeparture[];

    /**
     * @ctype
     * @default {@link TKState#waiting}
     */
    waiting: boolean;

    /**
     * @ctype
     * @default {@link TKState#serviceError}
     */
    serviceError?: TKError;

    /**
     * @ctype
     * @default {@link TKState#title}
     */
    title: string;

    /**
     * @ctype
     * @default {@link TKState#selectedService}
     */
    selectedService?: ServiceDeparture;

    /**
     * @ctype
     * @default {@link TKState#onServiceSelection}
     */
    onServiceSelection: (departure?: ServiceDeparture) => void;

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

export interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUITimetableViewProps = IProps;
export type TKUITimetableViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITimetableView {...props}/>,
    styles: tKUITimetableDefaultStyle,
    classNamePrefix: "TKUITimetableView"
};

class TKUITimetableView extends React.Component<IProps, {}> {

    private scrollRef: any;

    constructor(props: IProps) {
        super(props);
        this.getDefaultActions = this.getDefaultActions.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
    }

    private getDefaultActions(stop: StopLocation) {
        return [
            <TKUIRouteToLocationAction location={stop} buttonType={TKUIButtonType.PRIMARY_VERTICAL} key={"actionToLoc"}/>,
            <TKUIFavouriteAction favourite={FavouriteStop.create(stop)} vertical={true} key={"actionFav"}/>,
            <TKI18nContext.Consumer key={"actionShare"}>
                {(i18nProps: TKI18nContextProps) =>
                    <TKUIShareAction
                        title={this.props.t("Share")}
                        message={""}
                        link={() => RegionsData.instance.requireRegions()
                            .then(() => TKShareHelper.getShareTimetable(stop))}
                        vertical={true}
                    />
                }
            </TKI18nContext.Consumer>
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
        const stop = this.props.stop;
        if (!stop) {
            return null;
        }
        const parentStopMode = stop && stop.class === "ParentStopLocation" && stop.modeInfo && stop.modeInfo.alt;
        const subtitle = parentStopMode ? parentStopMode.charAt(0).toUpperCase() + parentStopMode.slice(1) + " station"
            : undefined;
        const classes = this.props.classes;
        const t = this.props.t;
        const defaultActions = this.getDefaultActions(stop);
        const actions = this.props.actions ? this.props.actions(stop, defaultActions) : defaultActions;
        const actionElems = actions ?
            <TKUIActionsView
                actions={actions}
                className={classes.actionsPanel}
            /> : undefined;
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
                <IconClock/>
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
                renderSubHeader={this.props.timetableForSegment ? undefined :
                    () => <div className={classes.subHeader}>
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
                        </div>
                        {actionElems}
                    </div>
                }
                presentation={this.props.cardPresentation !== undefined ? this.props.cardPresentation : CardPresentation.SLIDE_UP}
                onRequestClose={this.props.onRequestClose}
                slideUpOptions={slideUpOptions}
                // Timetable should not scroll at body, but at panel below filter, on body content. Next is just required
                // for Safari so div below filter can actually get a height and scroll happens there.
                styles={DeviceUtil.browser === BROWSER.SAFARI ? { body: overrideClass({height: '100%'}) } : undefined}
            >
                {error ? error :
                    <div className={classes.main}>
                        <div className={classes.secondaryBar}>
                            <input type="text"
                                   spellCheck={false}
                                   autoComplete="off"
                                   autoCorrect="off"
                                   autoCapitalize="off"
                                   className={classes.filterInput}
                                   placeholder={t("Search")}
                                   value={this.props.timetableFilter}
                                   onChange={this.onFilterChange}/>
                            <TKUIDateTimePicker
                                value={this.props.timetableInitTime}
                                timeZone={stop.timezone}
                                onChange={this.props.onInitTimeChange}
                                renderCustomInput={renderCustomInput}
                                popperPlacement="bottom-end"
                                popperModifiers={{
                                    offset: {
                                        enabled: true,
                                        offset: "15px, 0px"
                                    }
                                }}
                            />
                        </div>
                        <div className={classes.listPanel}>
                            <TKUIScrollForCard className={classes.containerPanel}
                                               onScroll={this.onScroll}
                                               scrollRef={(scrollRef: any) => this.scrollRef = scrollRef}
                            >
                                {this.props.departures.reduce((elems: JSX.Element[], departure: ServiceDeparture, i: number) => {
                                    const showDayLabel = i === 0 ||
                                        DateTimeUtil.momentFromTimeTZ(this.props.departures[i - 1].actualStartTime * 1000, stop.timezone).format("ddd D") !==
                                        DateTimeUtil.momentFromTimeTZ(departure.actualStartTime * 1000, stop.timezone).format("ddd D");
                                    if (showDayLabel) {
                                        elems.push(<DaySeparator date={DateTimeUtil.momentFromTimeTZ(departure.actualStartTime * 1000, stop.timezone)}
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
                                                    }}}
                                                selected={departure === this.props.selectedService}
                                            />
                                        </div>
                                    );
                                    return elems;
                                }, [])}
                                {this.props.waiting ?
                                    <IconSpin className={classes.iconLoading} focusable="false"/> : null}
                                {!this.props.waiting && !this.props.serviceError && this.props.departures.length === 0
                                && <div className={classes.noResults}>{"No results"}</div>}
                            </TKUIScrollForCard>
                        </div>
                    </div>}
            </TKUICard>
        );
    }

    public componentDidMount() {
        // If shared link then this is triggered from WithServicesResults.tsx constructor
        if (!TKShareHelper.isSharedStopLink() && !TKShareHelper.isSharedServiceLink()
            && !this.props.timetableForSegment && this.props.onRequestMore) {
            this.props.onRequestMore();
        }
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (prevProps.departures.length === 0 && this.props.departures.length > 0) {
            const now = DateTimeUtil.getNow().valueOf()/60000; // In minutes, with decimals
            const nextDepartureIndex = this.props.departures.findIndex((departure: ServiceDeparture) => {
                const actualStartTime = departure.actualStartTime/60; // In minutes, with decimals
                let timeToDepart = actualStartTime - now;   // In minutes
                // Round negative up, so less than a minute in the past from now is considered 'Now'.
                timeToDepart = timeToDepart < 0 ? Math.ceil(timeToDepart) : Math.floor(timeToDepart);
                return timeToDepart >= 0;   // To be consistent with timeToDepart calculation in TKUIServiceDepartureRow
            });
            if (nextDepartureIndex !== -1 && this.scrollRef) {
                Array.prototype.slice.call(this.scrollRef.children).filter((child: any) =>
                    child.className.includes // This is to filter svg IconSpin, which has className.includes undefined
                    && !child.className.includes("DaySeparator")
                )[nextDepartureIndex].scrollIntoView();
            }
        }
    }

}

const Consumer: React.SFC<{children: (props: IServiceResultsContext) => React.ReactNode}> = (props: {children: (props: IServiceResultsContext) => React.ReactNode}) => {
    return (
        <ServiceResultsContext.Consumer>
            {(serviceContext: IServiceResultsContext) => (
                props.children!(serviceContext)
            )}
        </ServiceResultsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps & Partial<IConsumedProps>, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IServiceResultsContext) =>
                children!({...consumedProps, ...inputProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUITimetableView, config, Mapper);