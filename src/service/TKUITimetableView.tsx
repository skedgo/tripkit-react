import React, {ChangeEvent} from "react";
import {
    IServiceResultsContext,
    ServiceResultsContext
} from "../service/ServiceResultsProvider";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {ReactComponent as IconGlass} from "../images/ic-glass.svg";
import {ReactComponent as IconClock} from "../images/ic-clock.svg";
import DateTimeUtil from "../util/DateTimeUtil";
import DaySeparator from "./DaySeparator";
import {Moment} from "moment";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
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
import {TKUISlideUpOptions} from "../card/TKUISlideUp";
import TransportUtil from "../trip/TransportUtil";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import RegionsData from "../data/RegionsData";
import {TKI18nContextProps, TKI18nContext} from "../i18n/TKI18nProvider";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    open?: boolean;
    onRequestClose?: () => void;
    onDirectionsClicked?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}

export interface IProps extends IClientProps, IServiceResultsContext, TKUIWithClasses<IStyle, IProps> {
    actions?: (stop: StopLocation) => JSX.Element[];
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
    filterPanel: CSSProps<IProps>;
    glassIcon: CSSProps<IProps>;
    filterInput: CSSProps<IProps>;
    faceButtonClass: CSSProps<IProps>;
    dapartureRow: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
}

export type TKUITimetableViewProps = IProps;
export type TKUITimetableViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITimetableView {...props}/>,
    styles: tKUITimetableDefaultStyle,
    classNamePrefix: "TKUITimetableView",
    props: {
        actions: (stop: StopLocation) => [
            <TKUIRouteToLocationAction location={stop} buttonType={TKUIButtonType.PRIMARY_VERTICAL} key={"actionToLoc"}/>,
            <TKUIFavouriteAction favourite={FavouriteStop.create(stop)} vertical={true} key={"actionFav"}/>,
            <TKI18nContext.Consumer key={"actionShare"}>
                {(i18nProps: TKI18nContextProps) =>
                    <TKUIShareAction
                        title={"Share timetable"}
                        message={""}
                        link={() => RegionsData.instance.requireRegions()
                            .then(() => TKShareHelper.getShareTimetable(stop))}
                        vertical={true}
                    />
                }
            </TKI18nContext.Consumer>
        ]
    }
};

class TKUITimetableView extends React.Component<IProps, {}> {

    private scrollRef: any;

    constructor(props: IProps) {
        super(props);
        this.onScroll = this.onScroll.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
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
        const actions = (stop && this.props.actions) ?
            <TKUIActionsView
                actions={this.props.actions!(stop)}
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
        const renderCustomInput = (value: any, onClick: any) => (
            <button className={classes.faceButtonClass} onClick={onClick}>
                <IconClock/>
            </button>
        );
        return (
            <TKUICard
                title={this.props.title}
                subtitle={subtitle}
                open={this.props.open}
                renderSubHeader={this.props.timetableForSegment ? undefined :
                    () => <div className={classes.subHeader}>
                        <div className={classes.serviceList}>
                            {serviceListSamples.map((service: ServiceDeparture, i: number) => {
                                return service.serviceNumber &&
                                    <div className={classes.serviceNumber}
                                         style={{backgroundColor: TransportUtil.getServiceDepartureColor(service)}}
                                         key={i}
                                    >
                                        {service.serviceNumber}
                                    </div>
                            })}
                        </div>
                        {actions}
                    </div>
                }
                presentation={CardPresentation.SLIDE_UP}
                onRequestClose={this.props.onRequestClose}
                slideUpOptions={slideUpOptions}
                // Timetable should not scroll at body, but at panel below filter, on body content. Next is just required
                // for Safari so div below filter can actually get a height and scroll happens there.
                bodyStyle={{height: '100%'}}
            >
                <div className={classes.main}>
                    <div className={classes.secondaryBar}>
                        <div className={classes.filterPanel}>
                            <IconGlass className={classes.glassIcon}/>
                            <input className={classes.filterInput} placeholder={t("Search")}
                                   onChange={this.onFilterChange}/>
                        </div>
                        <TKUIDateTimePicker
                            value={this.props.initTime}
                            timeZone={stop.timezone}
                            onChange={this.props.onInitTimeChange}
                            renderCustomInput={renderCustomInput}
                            popperPlacement="top-end"
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
                        </TKUIScrollForCard>
                    </div>
                </div>
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

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IServiceResultsContext) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUITimetableView, config, Mapper);