import * as React from "react";
import Segment from "../model/trip/Segment";
import DateTimeUtil from "../util/DateTimeUtil";
import TransportUtil from "./TransportUtil";
import "./TripSegmentDetailDelete.css"
import ServiceStopLocation from "../model/ServiceStopLocation";
import {ClassNameMap} from "react-jss";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {isIconOnDark, tKUISegmentOverviewDefaultStyle} from "./TKUISegmentOverview.css";
import {ReactComponent as IconPinStart} from "../images/ic-pin-start.svg";
import TKUIWCSegmentInfo from "./TKUIWCSegmentInfo";

export interface ITKUISegmentOverviewProps extends TKUIWithStyle<ITKUISegmentOverviewStyle, ITKUISegmentOverviewProps> {
    value: Segment;
}

interface IProps extends ITKUISegmentOverviewProps {
    classes: ClassNameMap<keyof ITKUISegmentOverviewStyle>
}

export interface ITKUISegmentOverviewStyle {
    main: CSSProps<ITKUISegmentOverviewProps>;
    header: CSSProps<ITKUISegmentOverviewProps>;
    title: CSSProps<ITKUISegmentOverviewProps>;
    subtitle: CSSProps<ITKUISegmentOverviewProps>;
    time: CSSProps<ITKUISegmentOverviewProps>;
    track: CSSProps<ITKUISegmentOverviewProps>;
    body: CSSProps<ITKUISegmentOverviewProps>;
    preLine: CSSProps<ITKUISegmentOverviewProps>;
    posLine: CSSProps<ITKUISegmentOverviewProps>;
    line: CSSProps<ITKUISegmentOverviewProps>;
    noLine: CSSProps<ITKUISegmentOverviewProps>;
    circle: CSSProps<ITKUISegmentOverviewProps>;
    iconPin: CSSProps<ITKUISegmentOverviewProps>;
    icon: CSSProps<ITKUISegmentOverviewProps>;
    description: CSSProps<ITKUISegmentOverviewProps>;
    action: CSSProps<ITKUISegmentOverviewProps>;
    notes: CSSProps<ITKUISegmentOverviewProps>;
}

export class TKUISegmentOverviewConfig implements TKUIWithStyle<ITKUISegmentOverviewStyle, ITKUISegmentOverviewProps> {
    public styles = tKUISegmentOverviewDefaultStyle;
    public randomizeClassNames?: boolean = true; // Default should be undefined in general, meaning to inherit ancestor's
                                              // JssProvider, but in this case is true since multiple instances are
                                              // rendered, each with a different service color.

    public static instance = new TKUISegmentOverviewConfig();
}

class TKUISegmentOverview extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.value;
        const prevSegment = segment.prevSegment();
        const prevWaitingSegment = prevSegment && prevSegment.isStationay() ? prevSegment : undefined;
        const prevWaitingSegmentTime = prevWaitingSegment ?
            DateTimeUtil.momentTZTime(prevWaitingSegment.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) : undefined;
        const startTime = DateTimeUtil.momentTZTime(segment.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        const modeInfo = segment.modeInfo!;
        const transportColor = TransportUtil.getTransportColor(modeInfo);
        const from = (segment.isFirst() ? "Leave " : segment.arrival ? "Arrive " : "") + segment.from.address;
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
        const iconOnDark = isIconOnDark(segment);
        const wcSegmentInfo = segment.isBicycle() || segment.isWheelchair() ?
            <TKUIWCSegmentInfo value={segment}/> : undefined;
        const classes = this.props.classes;
        return (
            <div className={classes.main} tabIndex={0}>
                <div className={classes.header}>
                    <div className={classes.track} aria-label="at">
                        <div className={classes.preLine}/>
                        {((segment.isFirst() && !transportColor) || (segment.arrival && !transportColor)) ?
                            <IconPinStart className={classes.iconPin}/> : <div className={classes.circle}/>}
                        <div className={classes.posLine}/>
                    </div>
                    <div className={classes.title}>
                        {from}
                        {prevWaitingSegment &&
                        <span className={classes.subtitle}>{prevWaitingSegment.getAction()}</span>}
                    </div>
                    <div className={classes.time}>
                        <span>{prevWaitingSegmentTime}</span>
                        {startTime}
                    </div>
                </div>
                {!this.props.value.arrival ?
                    <div className={classes.body}>
                        <div className={classes.track}>
                            <div className={classes.line}/>
                            <img src={TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, iconOnDark)}
                                 className={classes.icon}
                                 aria-hidden={true}
                            />
                            <div className={classes.line}/>
                        </div>
                        <div className={classes.description}>
                            <div className={classes.action}>
                                {segment.getAction()}
                            </div>
                            {wcSegmentInfo}
                            <div className={classes.notes}>
                                {segment.getNotes().map((note: string, i: number) =>
                                    <div key={i}>{note}</div>
                                )}
                            </div>
                        </div>
                    </div>
                    :
                    null
                }
            </div>
        );
    }
}

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUISegmentOverview");
    return (props: ITKUISegmentOverviewProps) => {
        const stylesToPass = props.styles || TKUISegmentOverviewConfig.instance.styles;
        const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
            TKUISegmentOverviewConfig.instance.randomizeClassNames;
        return <RawComponentStyled {...props} styles={stylesToPass} randomizeClassNames={randomizeClassNamesToPass}/>;
    };
};

export default Connect(TKUISegmentOverview);