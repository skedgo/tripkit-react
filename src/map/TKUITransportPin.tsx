import * as React from "react";
import {ReactComponent as IconPinHead} from "../images/ic-map-pin-head.svg";
import {ReactComponent as IconPinHeadPointer} from "../images/ic-map-pin-head-pointer.svg";
import iconPinBase from "../images/ic-map-pin-base.png";
import Segment from "../model/trip/Segment";
import DateTimeUtil from "../util/DateTimeUtil";
import Constants from "../util/Constants";
import TransportUtil from "../trip/TransportUtil";
import ServiceShape from "../model/trip/ServiceShape";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUITransportPinDefaultStyle} from "./TKUITransportPin.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {Visibility} from "../model/trip/SegmentTemplate";
import classNames from "classnames";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    icon: string;
    label: string;
    rotation?: number;
    firstSegment?: boolean;
    arriveSegment?: boolean;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    pin: CSSProps<IProps>;
    transport: CSSProps<IProps>;
    timeLabel: CSSProps<IProps>;
    base: CSSProps<IProps>;
    firstSegment: CSSProps<IProps>;
    arriveSegment: CSSProps<IProps>;
}

export type TKUITransportPinProps = IProps;
export type TKUITransportPinStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITransportPin {...props}/>,
    styles: tKUITransportPinDefaultStyle,
    classNamePrefix: "TKUITransportPin"
};

class TKUITransportPin extends React.Component<IProps, {}> {

    public static createForSegment(segment: Segment) {
        const modeInfo = segment.modeInfo!;
        const rotation = segment.travelDirection ? segment.travelDirection - 90 : undefined;
        // On dark background if there is a suitable remote icon for dark background, or there is not
        // remote icon for light background, so will use a local icon for dark background.
        const onDark = segment.arrival || (!modeInfo.remoteIcon && modeInfo.remoteDarkIcon !== undefined);
        const transIcon = segment.arrival ? Constants.absUrl("/images/modeicons/ondark/ic-arrive-24px.svg") :
            TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, onDark);
        const timeS = DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone).format(DateTimeUtil.TIME_FORMAT_TRIP);
        return <TKUITransportPinConnected
            icon={transIcon}
            label={timeS}
            rotation={rotation}
            firstSegment={segment.isFirst(Visibility.IN_SUMMARY)}
            arriveSegment={segment.arrival}
        />
    }

    public static createForService(serviceDeparture: ServiceDeparture) {
        const service = serviceDeparture.serviceDetail!;
        const modeInfo = serviceDeparture.modeInfo;
        const firstTravelledShape = service.shapes && service.shapes.find((shape: ServiceShape) => shape.travelled);
        const startStop = firstTravelledShape && firstTravelledShape.stops && firstTravelledShape.stops[0];
        const rotation = startStop && startStop.bearing;
        const onDark = !modeInfo.remoteIcon && modeInfo.remoteDarkIcon !== undefined;
        const transIcon = TransportUtil.getTransportIcon(modeInfo, false, onDark);
        const timeS = DateTimeUtil.momentFromTimeTZ(serviceDeparture.actualStartTime * 1000, serviceDeparture.startStop!.timezone).format(DateTimeUtil.TIME_FORMAT_TRIP);
        return <TKUITransportPinConnected icon={transIcon} label={timeS} rotation = {rotation}/>
    }

    public render(): React.ReactNode {
        const rotation = this.props.rotation;
        const PinHead = rotation ? IconPinHeadPointer : IconPinHead;
        const classes = this.props.classes;
        return (
            <div className={classNames(classes.main,
                this.props.firstSegment && classes.firstSegment,
                this.props.arriveSegment && classes.arriveSegment)}>
                <div>
                    <PinHead className={classes.pin}
                             style={rotation ?
                                 {
                                     transform: "rotate(" + rotation + "deg)",
                                     WebkitTransform: "rotate(" + rotation + "deg)",
                                     ['MsTransform' as any]: "rotate(" + rotation + "deg)",
                                     ['MozTransform' as any]: "rotate(" + rotation + "deg)"
                                 } : undefined}
                             focusable="false"
                    />
                    <img src={this.props.icon} className={classes.transport}/>
                    <div className={classes.timeLabel}>
                        {this.props.label}
                    </div>
                </div>
                <img src={iconPinBase} className={classes.base}/>
            </div>
        )
    }
}

const TKUITransportPinConnected = connect((config: TKUIConfig) => config.TKUITransportPin, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

export {TKUITransportPin}