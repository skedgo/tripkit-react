import * as React from "react";
import TransportUtil from "./TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import "./ACTTrackTransport.css";
import {TrackTransportProps} from "./TrackTransport";


class ACTTrackTransport extends React.Component<TrackTransportProps, {}> {

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
        const circleBg = modeInfo.remoteDarkIcon || modeInfo.remoteIcon === null;
        const transportColor = TransportUtil.getTransportColor(modeInfo);
        return (
            <div className="gl-flex gl-align-center">
                <img src={TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, true)}
                     alt={modeInfo.alt}
                     role="img" // Needed to be read by iOS VoiceOver
                     className={"ACTTrackTransport-icon " + (circleBg ? " ACTTrackTransport-onDark" : "")}
                     style={{
                         backgroundColor: circleBg ? (transportColor !== null ? transportColor : "black") : "none",
                         border: !circleBg ? "1px solid " + (transportColor !== null ? transportColor : "black") : "none",
                     }}
                     aria-label={modeInfo.alt + (infoTitle ? " " + infoTitle : "") + " " + infoSubtitle}
                />
                { this.props.brief ? null :
                    <div className={"ACTTrackTransport-info gl-flex gl-column gl-align-center text"
                    + (this.props.brief === false ? " ACTTrackTransport-info-space" : "")}
                         style={{color: transportColor !== null && !segment.isSchoolbus() ? transportColor : "black"}}
                         aria-hidden={true}
                    >
                        {infoTitle ? <div>{infoTitle}</div> : null}
                        <div>{infoSubtitle}</div>
                    </div> }
            </div>
        );
    }
}

export default ACTTrackTransport;