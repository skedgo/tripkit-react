import * as React from "react";
import "./SegmentPinIcon.css";
import IconPinHead from "-!svg-react-loader!../images/ic-map-pin-head.svg";
import IconPinHeadPointer from "-!svg-react-loader!../images/ic-map-pin-head-pointer.svg";
import iconPinBase from "../images/ic-map-pin-base.png";
import {Segment} from "../index";
import Constants from "../util/Constants";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";

interface IProps {
    segment: Segment;
}

class SegmentPinIcon extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const modeInfo = segment.modeInfo!;
        const rotation = segment.travelDirection ? segment.travelDirection - 90 : undefined;
        const PinHead = rotation ? IconPinHeadPointer : IconPinHead;
        // On dark background if there is a suitable remote icon for dark background, or there is not
        // remote icon for light background, so will use a local icon for dark background.
        const onDark = segment.arrival || (modeInfo.remoteIcon === null && modeInfo.remoteDarkIcon !== null);
        const transIcon = segment.arrival ? Constants.absUrl("/images/map/ic-arrive-flag.svg") :
            TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, onDark);
        const timeS = DateTimeUtil.momentTZTime(segment.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        return (
            <div className="gl-flex gl-column gl-align-center">
                <div>
                    <PinHead className={"SegmentPinIcon-pin"}
                             style={rotation ?
                             {
                                 transform: "rotate(" + rotation + "deg)",
                                 WebkitTransform: "rotate(" + rotation + "deg)",
                                 MsTransform: "rotate(" + rotation + "deg)",
                                 MozTransform: "rotate(" + rotation + "deg)"
                             } : undefined}
                             focusable="false"
                    />
                    <img src={transIcon} className="SegmentPinIcon-transport"/>
                    <div className="SegmentPinIcon-timeLabel">
                        {timeS}
                    </div>
                </div>
                <img src={iconPinBase} className="SegmentPinIcon-base"/>
            </div>
        )
    }
}

export {IProps}
export default SegmentPinIcon;