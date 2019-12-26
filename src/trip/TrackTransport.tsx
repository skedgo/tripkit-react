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
            infoSubtitle = DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone).format(DateTimeUtil.TIME_FORMAT_TRIP);
        } else if (segment.trip.isSingleSegment() && (segment.isBicycle() || segment.isWheelchair())) {
            // TODO getDurationWithContinuation
            const duration = DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
            const friendlinessPct = (segment.metresSafe !== undefined && segment.metres !== undefined) ? Math.floor(segment.metresSafe * 100 / segment.metres) : undefined;
            if (friendlinessPct) {
                infoTitle = duration;
                infoSubtitle = friendlinessPct + (segment.isBicycle() ? " % cycle friendly" : " % wheelchair friendly");
            } else {
                infoSubtitle = duration;
            }
        } else if (segment.trip.isSingleSegment() && segment.metres !== undefined) {
            infoSubtitle = TransportUtil.distanceToBriefString(segment.metres);
        } else if (segment.realTime) {
            infoSubtitle = "Live traffic";
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
                    <div className={"TrackTransport-info gl-flex gl-column gl-align-start"
                    + (this.props.brief === false ? " TrackTransport-info-space" : "")}
                         aria-hidden={true}
                    >
                        {infoTitle ? <div>{infoTitle}</div> : null}
                        <div className={"TrackTransport-subtitle"}>{infoSubtitle}</div>
                    </div> }
            </div>
        );
    }
}

export interface TrackTransportProps extends IProps {}

export default TrackTransport;