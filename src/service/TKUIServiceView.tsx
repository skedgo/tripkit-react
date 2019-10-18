import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import ITKUIServiceDepartureRowProps from "./ITKUIServiceDepartureRowProps";
import DateTimeUtil from "../util/DateTimeUtil";
import ServiceStopLocation from "../model/ServiceStopLocation";
import {TKUIStopSteps} from "../trip/TripSegmentSteps";
import ServiceShape from "../model/trip/ServiceShape";
import {EventEmitter} from "fbemitter";
import {IServiceResultsContext, ServiceResultsContext} from "./ServiceResultsProvider";
import TKUICard from "../card/TKUICard";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {tKUIServiceViewDefaultStyle} from "./TKUIServiceView.css";
import TKUIServiceDepartureRow from "./TKUIServiceDepartureRow";
import TransportUtil from "../trip/TransportUtil";

export interface ITKUIServiceViewProps extends TKUIWithStyle<ITKUIServiceViewStyle, ITKUIServiceViewProps> {
    onRequestClose?: () => void;
}

export interface ITKUIServiceViewStyle {
    main: CSSProps<ITKUIServiceViewProps>;
    serviceOverview: CSSProps<ITKUIServiceViewProps>;
    pastStop: CSSProps<ITKUIServiceViewProps>;
    currStop: CSSProps<ITKUIServiceViewProps>;
    currStopMarker: CSSProps<ITKUIServiceViewProps>;
}

export class TKUIServiceViewConfig implements TKUIWithStyle<ITKUIServiceViewStyle, ITKUIServiceViewProps>{
    public styles = tKUIServiceViewDefaultStyle;
    public randomizeClassNames?: boolean = true; // Default should be undefined in general, meaning to inherit ancestor's
                                              // JssProvider, but in this case is true since multiple instances are
                                              // rendered, each with a different service color.
    renderDeparture: <P extends ITKUIServiceDepartureRowProps>(departureProps: P) => JSX.Element
        = <P extends ITKUIServiceDepartureRowProps>(props: P) => <TKUIServiceDepartureRow {...props}/>;

    public static instance = new TKUIServiceViewConfig();
}

interface IConnectionProps {
    title: string,
    departure: ServiceDeparture;
    eventBus?: EventEmitter;
}

interface IProps extends ITKUIServiceViewProps, IConnectionProps {
    classes: ClassNameMap<keyof ITKUIServiceViewStyle>
}

export const STOP_CLICKED_EVENT = "stopClicked";

class TKUIServiceView extends React.Component<IProps, {}> {

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
        const classes = this.props.classes;
        return (
            <TKUICard
                title={this.props.title}
                onRequestClose={this.props.onRequestClose}
                renderSubHeader={() =>
                    <div className={this.props.classes.serviceOverview}>
                        {TKUIServiceViewConfig.instance.renderDeparture({
                            value: this.props.departure,
                        })}
                    </div>
                }
            >
                <div className={classes.main}>

                    <div className="gl-scrollable-y" ref={(scrollRef: any) => this.scrollRef = scrollRef}>
                        {stops &&
                        <TKUIStopSteps
                            steps={stops}
                            // toggleLabel={(open: boolean) => (open ? "Hide " : "Show ") + stops!.length + " stops"}
                            leftLabel = {(step: ServiceStopLocation) => step.departure ?
                                DateTimeUtil.momentTZTime(step.departure * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) :
                                step.arrival ? DateTimeUtil.momentTZTime(step.arrival * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) : ""
                            }
                            rightLabel={(step: ServiceStopLocation) => step.name}
                            stepMarker={(step: ServiceStopLocation) =>
                                step.departure === departure.startTime ?
                                    <img src={transIcon} className={classes.currStopMarker}/> : undefined
                            }
                            stepClassName={(step: ServiceStopLocation) =>
                                (step.departure && step.departure < departure.startTime ? classes.pastStop :
                                    step.departure === departure.startTime ? classes.currStop : undefined)}
                            borderColor={departure.serviceColor ? departure.serviceColor.toHex() : "black"}
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

const Connector: React.SFC<{children: (props: IConnectionProps) => React.ReactNode}> = (props: {children: (props: IConnectionProps) => React.ReactNode}) => {
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

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUIServiceView");
    return (props: ITKUIServiceViewProps) =>
        <Connector>
            {(cProps: IConnectionProps) => {
                const stylesToPass = props.styles || TKUIServiceViewConfig.instance.styles;
                const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
                    TKUIServiceViewConfig.instance.randomizeClassNames;
                return <RawComponentStyled {...props} {...cProps}
                                           styles={stylesToPass}
                                           randomizeClassNames={randomizeClassNamesToPass}/>;
            }}
        </Connector>;
};

export default Connect(TKUIServiceView);