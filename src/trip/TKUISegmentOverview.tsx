import * as React from "react";
import Segment from "../model/trip/Segment";
import DateTimeUtil from "../util/DateTimeUtil";
import TransportUtil from "./TransportUtil";
import ServiceStopLocation from "../model/ServiceStopLocation";
import {ClassNameMap} from "react-jss";
import {CSSProps, TKUIWithClasses, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {isIconOnDark, tKUISegmentOverviewDefaultStyle} from "./TKUISegmentOverview.css";
import {ReactComponent as IconPinStart} from "../images/ic-pin-start.svg";
import TKUIWCSegmentInfo from "./TKUIWCSegmentInfo";
import TKUIOccupancySign from "../service/occupancy/TKUIOccupancyInfo";
import TKUIWheelchairInfo from "../service/occupancy/TKUIWheelchairInfo";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import {Subtract} from "utility-types";
import TKUserProfile from "../model/options/TKUserProfile";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
    actions?: JSX.Element[];
}

interface IConsumedProps {
    options: TKUserProfile;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    title: CSSProps<IProps>;
    subtitle: CSSProps<IProps>;
    time: CSSProps<IProps>;
    track: CSSProps<IProps>;
    body: CSSProps<IProps>;
    preLine: CSSProps<IProps>;
    posLine: CSSProps<IProps>;
    line: CSSProps<IProps>;
    noLine: CSSProps<IProps>;
    circle: CSSProps<IProps>;
    iconPin: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    description: CSSProps<IProps>;
    action: CSSProps<IProps>;
    notes: CSSProps<IProps>;
    occupancy: CSSProps<IProps>;
}

export type TKUISegmentOverviewProps = IProps;
export type TKUISegmentOverviewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISegmentOverview {...props}/>,
    styles: tKUISegmentOverviewDefaultStyle,
    classNamePrefix: "TKUISegmentOverview",
    randomizeClassNames: true
};

class TKUISegmentOverview extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.value;
        const prevSegment = segment.prevSegment();
        const prevWaitingSegment = prevSegment && prevSegment.isStationay() ? prevSegment : undefined;
        const prevWaitingSegmentTime = prevWaitingSegment ?
            DateTimeUtil.momentFromTimeTZ(prevWaitingSegment.startTime * 1000, segment.from.timezone)
                .format(DateTimeUtil.TIME_FORMAT_TRIP) : undefined;
        const startTime = DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone)
            .format(DateTimeUtil.TIME_FORMAT_TRIP);
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
        const hasBusOccupancy = segment.isPT() && segment.realtimeVehicle && segment.realtimeVehicle.components &&
            segment.realtimeVehicle.components.length === 1 && segment.realtimeVehicle.components[0].length === 1 &&
            segment.realtimeVehicle.components[0][0].occupancy;
        const classes = this.props.classes;
        const showWheelchair = (this.props.options.wheelchair || segment.wheelchairAccessible === false) &&
            segment.isPT();
        const wheelchairInfo = showWheelchair &&
            <div className={classes.occupancy}>
                <TKUIWheelchairInfo accessible={segment.wheelchairAccessible}/>
            </div>;
        const occupancyInfo = hasBusOccupancy ?
            <div className={classes.occupancy}>
                <TKUIOccupancySign status={segment.realtimeVehicle!.components![0][0].occupancy!}/>
            </div> : undefined;
        const wcSegmentInfo = segment.isBicycle() || segment.isWheelchair() ?
            <TKUIWCSegmentInfo value={segment}/> : undefined;
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
                        {this.props.actions}
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
                            {wheelchairInfo}
                            {occupancyInfo}
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

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                children!({
                    ...inputProps,
                    options: optionsContext.value
                })
            }
        </OptionsContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUISegmentOverview, config, Mapper);