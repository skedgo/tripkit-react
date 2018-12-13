import * as React from "react";
import Segment from "../model/trip/Segment";
import DateTimeUtil from "../util/DateTimeUtil";
import TransportUtil from "./TransportUtil";
import "./TripSegmentDetail.css"
import ServiceStopLocation from "../model/ServiceStopLocation";
import Constants from "../util/Constants";
import TripSegmentSteps from "./TripSegmentSteps";
import Street from "../model/trip/Street";
import {default as SegmentDescription, SegmentDescriptionProps} from "./SegmentDescription";

interface IProps {
    value: Segment;
    end?: boolean;
    renderDescr?: <P extends SegmentDescriptionProps>(segmentDescrProps: P) => JSX.Element;
}

class TripSegmentDetail extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.value;
        const startTime = DateTimeUtil.momentTZTime((!this.props.end ? segment.startTime : segment.endTime) * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        const modeInfo = segment.modeInfo!;
        const circleBg = modeInfo.remoteDarkIcon || modeInfo.remoteIcon === null;
        let transportColor = TransportUtil.getTransportColor(modeInfo);
        transportColor = transportColor !== null ? transportColor : "black";
        const prevSegment = segment.isFirst() ? null : segment.trip.segments[segment.trip.segments.indexOf(segment) - 1];
        let prevTransportColor = prevSegment ? TransportUtil.getTransportColor(prevSegment.modeInfo!) : null;
        prevTransportColor = prevTransportColor !== null ? prevTransportColor : "black";
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
        const renderDescr = this.props.renderDescr ? this.props.renderDescr :
            <P extends SegmentDescriptionProps>(props: P) => <SegmentDescription {...props}/>;
        return (
            <div className="TripSegmentDetail gl-flex gl-column" tabIndex={0}>
                <div className="gl-flex gl-align-center gl-align-stretch">
                    <div className="TripSegmentDetail-timePanel gl-flex">
                        {startTime}
                    </div>
                    <div className="TripSegmentDetail-circlePanel gl-flex gl-center gl-align-center gl-column gl-no-shrink"
                         aria-label="at">
                        <div className="TripSegmentDetail-line TripSegmentDetail-preStopLine gl-grow"
                             style={{
                                 borderColor: prevTransportColor,
                                 // borderLeftStyle: prevSegment.isWalking() ? "dashed" : undefined
                             }}/>
                        <div className={"TripSegmentDetail-circle"}
                             style={{borderColor: transportColor}}/>
                        <div className="TripSegmentDetail-line TripSegmentDetail-postStopLine gl-grow"
                             style={{
                                 borderColor: transportColor,
                                 // borderLeftStyle: segment.isWalking() ? "dashed" : undefined
                             }}/>
                    </div>
                    <div className="TripSegmentDetail-title gl-flex gl-align-center gl-grow">{fromAddress}</div>
                    {
                        segment.bicycleAccessible === true ?
                            <img src={Constants.absUrl("/images/modeicons/ic-bikeRack.svg")}
                                 alt="Bicycle accessible trip"
                                 role="img"
                                 className="TripRow-bikeRackIcon gl-align-self-center"
                            /> : null
                    }
                    {
                        segment.wheelchairAccessible === true ?
                            <img src={Constants.absUrl("/images/modeicons/ic-wheelchair.svg")}
                                 alt="Wheelchair accessible"
                                 role="img"
                                 className="gl-align-self-center"
                            /> : null
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
                            {renderDescr({value: this.props.value})}
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
}

export default TripSegmentDetail;
export {IProps as SegmentDetailProps};