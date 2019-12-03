import * as React from "react";
import {
    IServiceResultsContext,
    ServiceResultsContext
} from "../service/ServiceResultsProvider";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {ReactComponent as IconGlass} from "../images/ic-glass.svg";
import {ReactComponent as IconClock} from "../images/ic-clock.svg";
import {ChangeEvent} from "react";
import DateTimeUtil from "../util/DateTimeUtil";
import DaySeparator from "./DaySeparator";
import {Moment} from "moment";
import TKUICard, {CardPresentation, TKUICardClientProps} from "../card/TKUICard";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUITimetableDefaultStyle} from "./TKUITimetableView.css";
import {ClassNameMap} from "react-jss";
import DateTimePickerFace from "../time/DateTimePickerFace";
import {ITKUIComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import TKUIServiceDepartureRow from "./TKUIServiceDepartureRow";
import StopLocation from "../model/StopLocation";
import FavouriteStop from "../model/favourite/FavouriteStop";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import TKUIRouteToLocationAction from "../action/TKUIRouteToLocationAction";
import TKShareHelper from "../share/TKShareHelper";
import {default as TKUIButton, TKUIButtonType} from "../buttons/TKUIButton";
import TKUIControlsCard from "../card/TKUIControlsCard";
import TKUIShareView from "../share/TKUIShareView";
import {ReactComponent as IconShare} from "../images/ic-share.svg";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    onDirectionsClicked?: () => void;
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
}

export type TKUITimetableViewProps = IProps;
export type TKUITimetableViewStyle = IStyle;

const config: ITKUIComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITimetableView {...props}/>,
    styles: tKUITimetableDefaultStyle,
    classNamePrefix: "TKUITimetableView",
    configProps: {
        actions: (stop: StopLocation) => [
            <TKUIRouteToLocationAction location={stop} vertical={true}/>,
            <TKUIFavouriteAction favourite={FavouriteStop.create(stop)} vertical={true}/>,
            <TKUIControlsCard>
                {(setProps: (props: TKUICardClientProps) => void) => {
                    return <TKUIButton text={"Share timetable"} icon={<IconShare/>}
                                       type={TKUIButtonType.SECONDARY_VERTICAL}
                                       onClick={() => {
                                           setProps({
                                               title: "Share timetable",
                                               presentation: CardPresentation.MODAL,
                                               children:
                                                   <TKUIShareView
                                                       link={TKShareHelper.getShareTimetable(stop)}
                                                       customMsg={""}
                                                   />,
                                               open: true,
                                               onRequestClose: () => {
                                                   setProps({
                                                       open: false
                                                   })
                                               }
                                           });
                                       }}
                    />;
                }}
            </TKUIControlsCard>
        ]
    }
};

class TKUITimetableView extends React.Component<IProps, {}> {

    private scrollRef: any;

    constructor(props: IProps) {
        super(props);
        // If shared link then this is triggered from WithServicesResults.tsx constructor
        if (!TKShareHelper.isSharedStopLink() && !TKShareHelper.isSharedServiceLink()
            && props.onRequestMore) {
            props.onRequestMore();
        }
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
        const parentStopMode = stop && stop.class === "ParentStopLocation" && stop.modeInfo && stop.modeInfo.alt;
        const subtitle = parentStopMode ? parentStopMode.charAt(0).toUpperCase() + parentStopMode.slice(1) + " station"
            : undefined;
        const classes = this.props.classes;
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
        return (
            <TKUICard
                title={this.props.title}
                subtitle={subtitle}
                renderSubHeader={() =>
                    <div className={classes.subHeader}>
                        <div className={classes.serviceList}>
                            {serviceListSamples.map((service: ServiceDeparture) => {
                                return service.serviceNumber &&
                                    <div className={classes.serviceNumber}
                                         style={{backgroundColor: service.serviceColor ? service.serviceColor.toHex() : 'lightgray'}}>
                                        {service.serviceNumber}
                                    </div>
                            })}
                        </div>
                        {actions}
                    </div>
                }
                presentation={CardPresentation.SLIDE_UP}
                onRequestClose={this.props.onRequestClose}
            >
                <div className={classes.main}>
                    <div className={classes.secondaryBar}>
                        <div className={classes.filterPanel}>
                            <IconGlass className={classes.glassIcon}/>
                            <input className={classes.filterInput} placeholder="Filter"
                                   onChange={this.onFilterChange}/>
                        </div>
                        <DateTimePickerFace
                            value={this.props.initTime}
                            onChange={this.props.onInitTimeChange}
                            renderFaceButton={(value: Moment, onClick: (e: any) => void, onFocus: (e: any) => void) => {
                                return (
                                    <button
                                        onClick={onClick}
                                        onFocus={onFocus}
                                        className={classes.faceButtonClass}
                                    >
                                        <IconClock/>
                                    </button>
                                )
                            }}
                        />
                    </div>
                    <div className={classes.listPanel}>
                        <div className={classes.containerPanel}
                             onScroll={this.onScroll}
                             ref={(scrollRef: any) => this.scrollRef = scrollRef}
                        >
                            {this.props.departures.reduce((elems: JSX.Element[], departure: ServiceDeparture, i: number) => {
                                const showDayLabel = i === 0 ||
                                    DateTimeUtil.momentTZTime(this.props.departures[i - 1].actualStartTime * 1000).format("ddd D") !==
                                    DateTimeUtil.momentTZTime(departure.actualStartTime * 1000).format("ddd D");
                                if (showDayLabel) {
                                    elems.push(<DaySeparator date={DateTimeUtil.momentTZTime(departure.actualStartTime * 1000)}
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
                                        />
                                    </div>
                                );
                                return elems;
                            }, [])}
                        </div>
                    </div>
                </div>
            </TKUICard>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.departures.length === 0 && this.props.departures.length > 0) {
            const now = DateTimeUtil.getNow().valueOf()/1000;
            const nextDepartureIndex = this.props.departures.findIndex((departure: ServiceDeparture) => {
                return departure.actualStartTime >= now;
            });
            if (nextDepartureIndex !== -1 && this.scrollRef) {
                Array.prototype.slice.call(this.scrollRef.children).filter((child: any) =>
                    !child.className.includes("DaySeparator")
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