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
import OptionsData from "../data/OptionsData";
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

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
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
}

interface IConnectionProps {
    title: string,
    departure: ServiceDeparture;
    eventBus?: EventEmitter;
}

interface IProps extends IClientProps, IConnectionProps, TKUIWithClasses<IStyle, IProps> {
    actions?: (service: ServiceDeparture) => JSX.Element[];
}

export type TKUIServiceViewProps = IProps;
export type TKUIServiceViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIServiceView {...props}/>,
    styles: tKUIServiceViewDefaultStyle,
    classNamePrefix: "TKUIServiceView",
    randomizeClassNames: true,  // This needs to be true since multiple instances are rendered,
                                // each with a different service color.
    props: {
        actions: (service: ServiceDeparture) => [
            <TKUIShareAction
                title={"Share service"}
                message={""}
                link={TKShareHelper.getShareService(service)}
                vertical={true}
            />
        ]
    }
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
        }
    }

    private scrollRef: any;
    private scrolledIntoView = false;

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
        const transIcon = TransportUtil.getTransportIcon(departure.modeInfo);
        const hasWheelchair = OptionsData.instance.get().wheelchair && departure.wheelchairAccessible;
        const hasBusOccupancy = departure.realtimeVehicle && departure.realtimeVehicle.components &&
            departure.realtimeVehicle.components.length === 1 && departure.realtimeVehicle.components[0].length === 1 &&
            departure.realtimeVehicle.components[0][0].occupancy;
        const classes = this.props.classes;
        const actions = this.props.actions ?
            <TKUIActionsView
                actions={this.props.actions!(departure)}
                className={classes.actionsPanel}
            /> : undefined;
        const realtimePanel = hasWheelchair || hasBusOccupancy ?
            <div className={classes.realtimePanel}>
                <div className={this.state.realtimeOpen ? classes.realtimeInfoDetailed : classes.realtimeInfo}>
                    {hasWheelchair && <TKUIWheelchairInfo accessible= {departure.wheelchairAccessible} brief={!this.state.realtimeOpen}/>}
                    {hasBusOccupancy ?
                        <TKUIOccupancySign status={departure.realtimeVehicle!.components![0][0].occupancy!}
                                           brief={!this.state.realtimeOpen}/> : undefined}
                </div>
                <IconAngleDown
                    onClick={() => this.setState({realtimeOpen: !this.state.realtimeOpen})}
                    className={classes.iconAngleDown}
                    style={this.state.realtimeOpen ? {...genStyles.rotate180} : undefined}
                />
            </div> : undefined;
        const slideUpOptions = this.props.slideUpOptions ? this.props.slideUpOptions : {};
        return (
            <TKUICard
                title={this.props.title}
                onRequestClose={this.props.onRequestClose}
                renderSubHeader={() =>
                    <div className={this.props.classes.serviceOverview}>
                        <TKUIServiceDepartureRow
                            value={this.props.departure}
                            detailed={true}
                        />
                        {realtimePanel}
                        {actions}
                    </div>
                }
                presentation={CardPresentation.SLIDE_UP}
                slideUpOptions={slideUpOptions}
            >
                <div className={classes.main}>

                    <div className="gl-scrollable-y" ref={(scrollRef: any) => this.scrollRef = scrollRef}>
                        {stops &&
                        <TKUIStopSteps
                            steps={stops}
                            // toggleLabel={(open: boolean) => (open ? "Hide " : "Show ") + stops!.length + " stops"}
                            leftLabel = {(step: ServiceStopLocation) => step.departure ?
                                DateTimeUtil.momentFromTimeTZ(step.departure * 1000, departure.startStop!.timezone).format(DateTimeUtil.TIME_FORMAT_TRIP) :
                                step.arrival ? DateTimeUtil.momentFromTimeTZ(step.arrival * 1000, departure.startStop!.timezone).format(DateTimeUtil.TIME_FORMAT_TRIP) : ""
                            }
                            rightLabel={(step: ServiceStopLocation) => step.name}
                            stepMarker={(step: ServiceStopLocation) =>
                                step.departure === departure.startTime ?
                                    <img src={transIcon} className={classes.currStopMarker} alt=""/> : undefined
                            }
                            stepClassName={(step: ServiceStopLocation) =>
                                (step.departure && step.departure < departure.startTime ? classes.pastStop :
                                    step.departure === departure.startTime ? classes.currStop : undefined)}
                            borderColor={TransportUtil.getServiceDepartureColor(departure)}
                            onStepClicked={(step: ServiceStopLocation) =>
                                this.props.eventBus && this.props.eventBus.emit(STOP_CLICKED_EVENT, step)}
                        />
                        }
                    </div>
                </div>
            </TKUICard>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (!this.scrolledIntoView && this.props.departure.serviceDetail && this.scrollRef) {
            this.scrolledIntoView = true;
            const classes = this.props.classes;
            this.scrollRef.getElementsByClassName(classes.currStopMarker)[0].scrollIntoView();
        }
    }
}

const Consumer: React.SFC<{children: (props: IConnectionProps) => React.ReactNode}> = (props: {children: (props: IConnectionProps) => React.ReactNode}) => {
    return (
        <ServiceResultsContext.Consumer>
            {(serviceContext: IServiceResultsContext) => (
                serviceContext.selectedService &&
                props.children!({
                    title: serviceContext.title,
                    departure: serviceContext.selectedService,
                    eventBus: serviceContext.servicesEventBus
                })
            )}
        </ServiceResultsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConnectionProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect(
    (config: TKUIConfig) => config.TKUIServiceView, config, Mapper);