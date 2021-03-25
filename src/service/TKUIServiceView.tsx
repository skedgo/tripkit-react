import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import DateTimeUtil from "../util/DateTimeUtil";
import ServiceStopLocation from "../model/ServiceStopLocation";
import {TKUIStopSteps} from "../trip/TripSegmentSteps";
import ServiceShape from "../model/trip/ServiceShape";
import {EventEmitter} from "fbemitter";
import {IServiceResultsContext, ServiceResultsContext} from "./ServiceResultsProvider";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIServiceViewDefaultStyle} from "./TKUIServiceView.css";
import TKUIServiceDepartureRow from "./TKUIServiceDepartureRow";
import TransportUtil from "../trip/TransportUtil";
import genStyles from "../css/GenStyle.css";
import TKUIOccupancySign from "./occupancy/TKUIOccupancyInfo";
import {ReactComponent as IconAngleDown} from "../images/ic-angle-down.svg";
import TKUIWheelchairInfo from "./occupancy/TKUIWheelchairInfo";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import TKShareHelper from "../share/TKShareHelper";
import TKUIShareAction from "../action/TKUIShareAction";
import TKUIActionsView from "../action/TKUIActionsView";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";
import TKUITrainOccupancyInfo from "./occupancy/TKUITrainOccupancyInfo";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import TKUserProfile from "../model/options/TKUserProfile";
import TKUIAlertsSummary from "../alerts/TKUIAlertsSummary";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
    actions?: (service: ServiceDeparture, defaultActions: JSX.Element[]) => JSX.Element[];
}

interface IStyle {
    main: CSSProps<IProps>;
    serviceOverview: CSSProps<IProps>;
    pastStop: CSSProps<IProps>;
    currStop: CSSProps<IProps>;
    currStopMarker: CSSProps<IProps>;
    realtimePanel: CSSProps<IProps>;
    iconAngleDown: CSSProps<IProps>;
    realtimeInfo: CSSProps<IProps>;
    realtimeInfoDetailed: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
    alertsSummary: CSSProps<IProps>;
    alertsBrief: CSSProps<IProps>;
}

interface IConsumedProps {
    title: string,
    departure: ServiceDeparture;
    eventBus?: EventEmitter;
    options: TKUserProfile
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIServiceViewProps = IProps;
export type TKUIServiceViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIServiceView {...props}/>,
    styles: tKUIServiceViewDefaultStyle,
    classNamePrefix: "TKUIServiceView",
    randomizeClassNames: true,  // This needs to be true since multiple instances are rendered,
                                // each with a different service color.
};

interface IState {
    realtimeOpen: boolean;
}

export const STOP_CLICKED_EVENT = "stopClicked";

class TKUIServiceView extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            realtimeOpen: false
        };
        this.getDefaultActions = this.getDefaultActions.bind(this);
    }

    private scrollRef: any;
    private scrolledIntoView = false;

    private getDefaultActions(service: ServiceDeparture) {
        return [
            <TKUIShareAction
                title={this.props.t("Share")}
                message={""}
                link={TKShareHelper.getShareService(service)}
                vertical={true}
                key={"actionShareService"}
            />
        ]
    }

    public render(): React.ReactNode {
        const departure = this.props.departure;
        let stops: ServiceStopLocation[] | undefined;
        const stopToShapes: Map<ServiceStopLocation, ServiceShape> = new Map<ServiceStopLocation, ServiceShape>();
        if (departure.serviceDetail && departure.serviceDetail.shapes) {
            stops = [];
            for (const shape of departure.serviceDetail.shapes) {
                if (shape.stops) {
                    stops = stops.concat(shape.stops);
                    for (const stop of shape.stops) {
                        stopToShapes.set(stop, shape);
                    }
                }
            }
        }
        const classes = this.props.classes;
        const t = this.props.t;
        const showWheelchair = this.props.options.wheelchair || departure.isWheelchairAccessible() === false;
        const occupancy = departure.realtimeVehicle && departure.realtimeVehicle.getOccupancyStatus();
        const alerts = !departure.hasAlerts ? null :
            this.state.realtimeOpen ?
                <div className={classes.alertsSummary}>
                    <TKUIAlertsSummary
                        alerts={departure.alerts}
                        slideUpOptions={this.props.slideUpOptions ? {modalUp: this.props.slideUpOptions.modalUp} : undefined}
                    />
                </div> :
                <div className={classes.alertsBrief}>
                    {t("X.alerts", {0: departure.alerts.length})}
                </div>;
        const defaultActions = this.getDefaultActions(departure);
        const actions = this.props.actions ? this.props.actions(departure, defaultActions) : defaultActions;
        const actionElems = actions ?
            <TKUIActionsView
                actions={actions}
                className={classes.actionsPanel}
            /> : undefined;
        const realtimePanel = showWheelchair || occupancy || alerts ?
            <div className={classes.realtimePanel}>
                <div className={this.state.realtimeOpen ? classes.realtimeInfoDetailed : classes.realtimeInfo}>
                    {showWheelchair && <TKUIWheelchairInfo accessible= {departure.isWheelchairAccessible()} brief={!this.state.realtimeOpen}/>}
                    {occupancy ?
                        <TKUIOccupancySign status={occupancy}
                                           brief={!this.state.realtimeOpen} tabIndex={0}/> : undefined}
                    {occupancy && this.state.realtimeOpen && departure.modeInfo.alt.includes("train") &&
                    <TKUITrainOccupancyInfo components={departure.realtimeVehicle!.components!}/>}
                    {alerts}
                </div>
                <IconAngleDown
                    onClick={() => this.setState({realtimeOpen: !this.state.realtimeOpen})}
                    className={classes.iconAngleDown}
                    style={this.state.realtimeOpen ? {...genStyles.rotate180} : undefined}
                    role="button"
                    aria-expanded={this.state.realtimeOpen}
                    aria-label={"Show realtime info"}
                />
            </div> : undefined;
        const slideUpOptions = this.props.slideUpOptions ? this.props.slideUpOptions : {};
        const leftLabelFc = (step: ServiceStopLocation, timeFormat: string = DateTimeUtil.TIME_FORMAT_TRIP) => step.departure ?
            DateTimeUtil.momentFromTimeTZ(step.departure * 1000, departure.startStop!.timezone).format(timeFormat) :
            step.arrival ? DateTimeUtil.momentFromTimeTZ(step.arrival * 1000, departure.startStop!.timezone).format(timeFormat) : "";
        return (
            <TKUICard
                title={this.props.title}
                onRequestClose={this.props.onRequestClose}
                renderSubHeader={() =>
                    <div className={this.props.classes.serviceOverview} id="serviceViewHeader">
                        <TKUIServiceDepartureRow
                            value={this.props.departure}
                            detailed={true}
                        />
                        {realtimePanel}
                        {actionElems}
                    </div>
                }
                presentation={CardPresentation.SLIDE_UP}
                slideUpOptions={slideUpOptions}
                scrollRef={(scrollRef: any) => this.scrollRef = scrollRef}
                // mainFocusElemId={"serviceViewHeader"}
            >
                <div className={classes.main}>
                    {stops &&
                    <TKUIStopSteps
                        steps={stops}
                        // toggleLabel={(open: boolean) => (open ? "Hide " : "Show ") + stops!.length + " stops"}
                        leftLabel = {leftLabelFc}
                        rightLabel={(step: ServiceStopLocation) => step.name}
                        ariaLabel={(step: ServiceStopLocation) => step.name + ", " + t("At.X", {0: leftLabelFc(step, "h:mm A")}) + ". "}
                        // TODO: use to mark vehicle's current position
                        // stepMarker={(step: ServiceStopLocation) =>
                        //     step.departure === departure.startTime ?
                        //         <img src={transIcon} className={classes.currStopMarker} alt=""/>
                        //         :undefined
                        // }
                        stepClassName={(step: ServiceStopLocation) =>
                            (step.departure && step.departure < departure.startTime ? classes.pastStop :
                                step.departure === departure.startTime ? classes.currStop : undefined)}
                        borderColor={TransportUtil.getServiceDepartureColor(departure)}
                        onStepClicked={(step: ServiceStopLocation) =>
                            this.props.eventBus && this.props.eventBus.emit(STOP_CLICKED_EVENT, step)}
                    />
                    }
                </div>
            </TKUICard>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (!this.scrolledIntoView && this.props.departure.serviceDetail && this.scrollRef) {
            this.scrolledIntoView = true;
            const classes = this.props.classes;
            this.scrollRef.getElementsByClassName(classes.currStop)[0].scrollIntoView();
        }
    }
}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <ServiceResultsContext.Consumer>
                    {(serviceContext: IServiceResultsContext) => (
                        serviceContext.selectedService &&
                        props.children!({
                            title: serviceContext.title,
                            departure: serviceContext.selectedService,
                            eventBus: serviceContext.servicesEventBus,
                            options: optionsContext.userProfile
                        })
                    )}
                </ServiceResultsContext.Consumer>
            }
        </OptionsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect(
    (config: TKUIConfig) => config.TKUIServiceView, config, Mapper);