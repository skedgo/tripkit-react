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
import {ReactComponent as RealtimeIcon} from "../images/ic-realtime.svg";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    icon: string;
    iconForDark: boolean;
    label: string;
    rotation?: number;
    firstSegment?: boolean;
    arriveSegment?: boolean;
    isRealtime?: boolean;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    pin: CSSProps<IProps>;
    transport: CSSProps<IProps>;
    timeLabel: CSSProps<IProps>;
    realtimeIcon: CSSProps<IProps>;
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

    public static createForSegment(segment: Segment, isDarkMode: boolean) {
        const modeInfo = segment.modeInfo!;
        const rotation = segment.travelDirection ? segment.travelDirection - 90 : undefined;
        const wantIconForDark = isDarkMode;
        const transIcon = segment.arrival ? Constants.absUrl("/images/modeicons/ondark/ic-arrive-24px.svg") :
            TransportUtil.getTransportIcon(modeInfo, segment.realTime === true, wantIconForDark);
        const isInvertedWrtMode = transIcon !== TransportUtil.getTransportIcon(modeInfo, segment.realTime === true, wantIconForDark, false);
        const isTransIconForDark = segment.arrival || (isInvertedWrtMode ? !wantIconForDark : wantIconForDark);
        const timeS = DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone).format(DateTimeUtil.timeFormat(false));
        return <TKUITransportPinConnected
            icon={transIcon}
            label={timeS}
            isRealtime={segment.realTime ?? undefined}
            rotation={rotation}
            firstSegment={segment.isFirst(Visibility.IN_SUMMARY)}
            arriveSegment={segment.arrival}
            iconForDark={isTransIconForDark}
        />
    }

    public static createForService(serviceDeparture: ServiceDeparture, isDarkMode: boolean) {
        const service = serviceDeparture.serviceDetail!;
        const modeInfo = serviceDeparture.modeInfo;
        const firstTravelledShape = service.shapes && service.shapes.find((shape: ServiceShape) => shape.travelled);
        const startStop = firstTravelledShape && firstTravelledShape.stops && firstTravelledShape.stops[0];
        const rotation = startStop && startStop.bearing;
        const wantIconForDark = isDarkMode;
        const transIcon = TransportUtil.getTransportIcon(modeInfo, false, wantIconForDark);
        const isInvertedWrtMode = transIcon !== TransportUtil.getTransportIcon(modeInfo, false, wantIconForDark, false);
        const isTransIconForDark = isInvertedWrtMode ? !wantIconForDark : wantIconForDark;
        const timeS = DateTimeUtil.momentFromTimeTZ(serviceDeparture.actualStartTime * 1000, serviceDeparture.startStop!.timezone).format(DateTimeUtil.timeFormat(false));
        return <TKUITransportPinConnected icon={transIcon} iconForDark={isTransIconForDark} label={timeS} rotation={rotation}/>
    }

    public render(): React.ReactNode {
        const { rotation, classes, isRealtime, label } = this.props;
        const PinHead = rotation ? IconPinHeadPointer : IconPinHead;
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
                        {isRealtime && <RealtimeIcon className={classes.realtimeIcon}/>}
                        {label}
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