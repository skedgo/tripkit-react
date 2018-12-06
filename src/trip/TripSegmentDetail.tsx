import * as React from "react";
import Segment from "../model/trip/Segment";
import DateTimeUtil from "../util/DateTimeUtil";
import TransportUtil from "./TransportUtil";
import "./TripSegmentDetail.css"
import ServiceStopLocation from "../model/ServiceStopLocation";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import Constants from "../util/Constants";
import NetworkUtil from "../util/NetworkUtil";
import TripSegmentSteps from "./TripSegmentSteps";
import Street from "../model/trip/Street";

interface IProps {
    value: Segment;
    end?: boolean;
}

interface IState {
    startStop: StopLocation | null;
}

class TripSegmentDetail extends React.Component<IProps, IState> {

    private stopCancellablePromise: any;

    constructor(props: Readonly<IProps>) {
        super(props);
        this.state = {
            startStop: null
        };
        if (this.props.value.stopCode) {
            this.stopCancellablePromise = NetworkUtil.makeCancelable(StopsData.instance.getStopFromCode("AU_ACT_Canberra", this.props.value.stopCode));
            this.stopCancellablePromise.promise.then((stopLocation: StopLocation) => this.setState({startStop: stopLocation}))
                .catch((error: any) => {
                    // avoid console error.
                });
        }
    }

    public render(): React.ReactNode {
        const segment = this.props.value;
        const startTime = DateTimeUtil.momentTZTime((!this.props.end ? segment.startTime : segment.endTime) * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        const modeInfo = segment.modeInfo!;
        const circleBg = modeInfo.remoteDarkIcon || modeInfo.remoteIcon === null;
        let transportColor = TransportUtil.getTransportColor(modeInfo);
        transportColor = transportColor !== null ? transportColor : "black";
        const fromAddress = !this.props.end ? segment.from.address : segment.to.address;
        let stops: ServiceStopLocation[] | null = null;
        if (segment.shapes) {
            stops = [];
            for (const shape of segment.shapes) {
                if (shape.travelled && shape.stops) {
                    stops = stops.concat(shape.stops);
                }
            }
        }
        if (stops) {
            stops = stops.slice(1, stops.length - 1); // remove the first and last stop.
        }
        const nonTCService = segment.isNonTCService();
        return (
            <div className="TripSegmentDetail gl-flex gl-column" tabIndex={0}>
                <div className="gl-flex gl-align-center">
                    <div className="TripSegmentDetail-timePanel">
                        {startTime}
                    </div>
                    <div className="TripSegmentDetail-circlePanel gl-flex gl-center"
                         aria-label="at"
                    >
                        <div className={"TripSegmentDetail-circle"}
                             style={{borderColor: transportColor}}/>
                    </div>
                    <div className="TripSegmentDetail-title gl-grow">{fromAddress}</div>
                    {
                        segment.bicycleAccessible === true ?
                            <img src={Constants.absUrl("/images/modeicons/ic-bikeRack.svg")}
                                 alt="Bicycle accessible trip"
                                 role="img"
                                 className="TripRow-bikeRackIcon"
                            /> : null
                    }
                    {
                        segment.wheelchairAccessible === true ?
                            <img src={Constants.absUrl("/images/modeicons/ic-wheelchair.svg")}
                                 alt="Wheelchair accessible"
                                 role="img"/> : null
                    }
                </div>
                {!this.props.end ?
                    <div>
                        <div className="gl-flex">
                            <div className="TripSegmentDetail-iconPanel gl-flex gl-center gl-align-center">
                                <img src={TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, true)}
                                     className={"TripSegmentDetail-icon " + (circleBg ? " TrackTransport-onDark" : "")}
                                     aria-hidden={true}
                                     style={{
                                         backgroundColor: circleBg ? transportColor : "none",
                                         border: !circleBg ? "1px solid " + transportColor : "none",
                                     }}
                                />
                            </div>
                            <div className="TripSegmentDetail-linePanel gl-flex gl-center">
                                <div className="TripSegmentDetail-line"
                                     style={{
                                         borderColor: transportColor,
                                         // borderLeftStyle: segment.isWalking() ? "dashed" : undefined
                                     }}/>
                            </div>
                            <div className="TripSegmentDetail-descrPanel">
                                {segment.stopCode ?
                                    <div className="TripSegmentDetail-stopId">Stop ID: {segment.stopCode}</div> : null}
                                { this.state.startStop && this.state.startStop.url ?
                                    <a href={this.state.startStop.url}
                                       target={"_blank"}
                                       className="TripSegmentDetail-stopMapLink gl-link">
                                        View Stop Map
                                    </a> : null }
                                <div className="TripSegmentDetail-subTitle">
                                    {segment.getAction()}
                                </div>
                                <div className="TripSegmentDetail-notes text">
                                    {segment.getNotes().map((note: string, i: number) =>
                                        <div key={i}>{note}</div>
                                    )}
                                </div>
                                { segment.isMyWay() ?
                                    <div className="TripSegmentDetail-banner gl-flex gl-align-center text">
                                        <img src={Constants.absUrl("/images/modeicons/ic-myway.svg")}
                                             alt="My way ticketing"
                                             role="img"
                                             className="TripSegmentDetail-myWayIcon"
                                        />
                                        This is a MyWay service
                                    </div> : null }
                                { segment.isSchoolbus() ?
                                    <div className="TripSegmentDetail-banner gl-flex gl-align-center text">
                                        This is a school service
                                    </div> : null }
                                { nonTCService ?
                                    <div className="TripSegmentDetail-banner gl-flex gl-align-center text">
                                        This is a non TC service
                                    </div> : null }
                            </div>
                        </div>
                        { stops !== null && stops.length > 0 ?
                            <TripSegmentSteps
                                steps={stops}
                                toggleLabel={(open: boolean) => (open ? "Hide " : "Show ") + stops!.length + " stops"}
                                leftLabel = {(step: ServiceStopLocation) => step.departure ? DateTimeUtil.momentTZTime(step.departure * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) : ""}
                                rightLabel={(step: ServiceStopLocation) => step.name}
                                borderColor={transportColor}
                            /> : null }
                        { segment.streets !== null ?
                            <TripSegmentSteps
                                steps={segment.streets}
                                toggleLabel={(open: boolean) => (open ? "Hide " : "Show ") + "directions"}
                                leftLabel = {(step: Street) => step.metres !== null ? TransportUtil.distanceToBriefString(step.metres) : ""}
                                rightLabel={(step: Street) => step.cyclingNetwork ? step.cyclingNetwork :
                                    (step.name ? step.name :
                                        (segment.isWalking() ? "Walk" :
                                            (segment.isBicycle() ? "Ride" : segment.isWheelchair() ? "Wheel" : "")))}
                                borderColor={transportColor}
                                // dashed={segment.isWalking()}
                            /> : null }
                    </div>
                    :
                    null
                }
                {!this.props.end ?
                    <div className="gl-flex">
                        <div className="TripSegmentDetail-iconPanel"/>
                        <div className="TripSegmentDetail-linePanel gl-flex gl-center">
                            <div className="TripSegmentDetail-line"
                                 style={{borderColor: transportColor}}/>
                        </div>
                        <div className="TripSegmentDetail-descrPanel"/>
                    </div> : null }
            </div>
        );
    }

    public componentWillUnmount(): void {
        if (this.stopCancellablePromise) {
            this.stopCancellablePromise.cancel();
        }
    }
}

export default TripSegmentDetail;