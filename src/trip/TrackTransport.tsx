import * as React from "react";
import Segment from "../model/trip/Segment";
import TransportUtil from "./TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import "./TrackTransport.css";

interface IProps {
    segment: Segment;
    brief?: boolean;
}

class TrackTransport extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        let infoTitle: string | null = null;
        let infoSubtitle: string;
        if (segment.isPT()) {
            infoTitle = segment.serviceNumber !== null ? segment.serviceNumber : "";
            infoSubtitle = DateTimeUtil.momentTZTime(segment.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        } else if (segment.trip.isSingleSegment() && segment.metres !== null) {
            infoSubtitle = TransportUtil.distanceToBriefString(segment.metres);
        } else if (segment.realTime) {
            infoSubtitle = "Live traffic";
        } else if (segment.trip.isSingleSegment() && (segment.isWalking() || segment.isWheelchair())) {
            // TODO getDurationWithContinuation
            infoSubtitle = DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
        } else {
            // TODO more cases
            infoSubtitle = DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
        }
        const modeInfo = segment.modeInfo!;
        return (
            <div className="gl-flex gl-align-center">
                <img src={TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, false)}
                     alt={modeInfo.alt}
                     role="img" // Needed to be read by iOS VoiceOver
                     className="TrackTransport-icon"
                     aria-label={modeInfo.alt + (infoTitle ? " " + infoTitle : "") + " " + infoSubtitle}
                />
                { this.props.brief ? null :
                    <div className={"TrackTransport-info gl-flex gl-column gl-align-center"
                    + (this.props.brief === false ? " TrackTransport-info-space" : "")}
                         aria-hidden={true}
                    >
                        {infoTitle ? <div>{infoTitle}</div> : null}
                        <div>{infoSubtitle}</div>
                    </div> }
            </div>
        );
    }
}

export default TrackTransport;
export {IProps as TrackTransportProps}