import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import IServiceDepartureRowProps from "./IServiceDepartureRowProps";
import DateTimeUtil from "../util/DateTimeUtil";
import ServiceStopLocation from "../model/ServiceStopLocation";
import TripSegmentSteps from "../trip/TripSegmentSteps";
import "./ServiceDetailView.css"
import ServiceShape from "../model/trip/ServiceShape";
import IconCross from "-!svg-react-loader!../images/ic-cross.svg";
import {EventEmitter} from "fbemitter";
import {IServiceResultsContext, ServiceResultsContext} from "./ServiceResultsProvider";

interface ITKUIServiceViewProps {
    renderDeparture: <P extends IServiceDepartureRowProps>(departureProps: P) => JSX.Element;
    onRequestClose?: () => void;
    eventBus?: EventEmitter;
}

interface IConnectionProps {
    departure: ServiceDeparture;
}

interface IProps extends ITKUIServiceViewProps, IConnectionProps {}

class ServiceDetailView extends React.Component<IProps, {}> {

    private scrollRef: any;
    private scrolledIntoView = false;

    public static readonly STOP_CLICKED_EVENT = "stopClicked";

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
        return (
            <div className="ServiceDetailView gl-flex gl-column">
                {this.props.renderDeparture({
                    value: this.props.departure,
                    renderRight: () => {
                        return (
                            <div className="ServiceDetailView-crossCircle gl-flex gl-align-center"
                                 onClick={this.props.onRequestClose}
                            >
                                <IconCross className="gl-svg-fill-currColor ServiceDetailView-cross"/>
                            </div>
                        )
                    }
                })}
                <div className="gl-scrollable-y" ref={(scrollRef: any) => this.scrollRef = scrollRef}>
                    {stops &&
                    <TripSegmentSteps
                        steps={stops}
                        // toggleLabel={(open: boolean) => (open ? "Hide " : "Show ") + stops!.length + " stops"}
                        leftLabel = {(step: ServiceStopLocation) => step.departure ?
                            DateTimeUtil.momentTZTime(step.departure * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) :
                            step.arrival ? DateTimeUtil.momentTZTime(step.arrival * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) : ""}
                        rightLabel={(step: ServiceStopLocation) => step.departure === departure.startTime ?
                            <div className="ServiceDetailView-currStopTitle">{step.name}</div> : step.name}
                        stepClassName={(step: ServiceStopLocation) => "ServiceDetailView-stop" +
                            (step.departure && step.departure < departure.startTime ? " ServiceDetailView-pastStop" :
                                step.departure === departure.startTime ? " ServiceDetailView-currStop" : "")}
                        borderColor={departure.serviceColor ? departure.serviceColor.toHex() : "black"}
                        onStepClicked={(step: ServiceStopLocation) =>
                            this.props.eventBus && this.props.eventBus.emit(ServiceDetailView.STOP_CLICKED_EVENT, step)}
                    />
                    }
                </div>
            </div>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (!this.scrolledIntoView && this.props.departure.serviceDetail && this.scrollRef) {
            this.scrolledIntoView = true;
            this.scrollRef.getElementsByClassName("ServiceDetailView-currStopTitle")[0].scrollIntoView();
        }
    }
}

const Connector: React.SFC<{children: (props: Partial<IProps>) => React.ReactNode}> = (props: {children: (props: Partial<IProps>) => React.ReactNode}) => {
    return (
        <ServiceResultsContext.Consumer>
            {(serviceContext: IServiceResultsContext) => (
                props.children!({
                    departure: serviceContext.selectedService
                })
            )}
        </ServiceResultsContext.Consumer>
    );
};

export const TKUIServiceView = (props: ITKUIServiceViewProps) =>
    <Connector>
        {(cProps: IConnectionProps) => <ServiceDetailView {...props} {...cProps}/>}
    </Connector>;


export default ServiceDetailView;