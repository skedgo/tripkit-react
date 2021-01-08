import * as React from "react";
import Segment, {TripAvailability} from "../model/trip/Segment";
import DateTimeUtil from "../util/DateTimeUtil";
import TransportUtil from "./TransportUtil";
import ServiceStopLocation from "../model/ServiceStopLocation";
import {ClassNameMap} from "react-jss";
import {CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {
    isIconOnDark,
    isUnconnected,
    prevWaitingSegment,
    tKUISegmentOverviewDefaultStyle
} from "./TKUISegmentOverview.css";
import {ReactComponent as IconPinStart} from "../images/ic-pin-start.svg";
import TKUIWCSegmentInfo from "./TKUIWCSegmentInfo";
import TKUIOccupancySign from "../service/occupancy/TKUIOccupancyInfo";
import TKUIWheelchairInfo from "../service/occupancy/TKUIWheelchairInfo";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import {Subtract} from "utility-types";
import TKUserProfile from "../model/options/TKUserProfile";
import TKUIAlertsSummary from "../alerts/TKUIAlertsSummary";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {cardSpacing} from "../jss/TKUITheme";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {SegmentType} from "../model/trip/SegmentTemplate";
import classNames from "classnames";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
    actions?: JSX.Element[];
    onRequestAlternativeRoutes?: (segment: Segment) => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    options: TKUserProfile;
    onTimetableForSegment: (segment?: Segment) => void,
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    title: CSSProps<IProps>;
    subtitle: CSSProps<IProps>;
    time: CSSProps<IProps>;
    timeBottom: CSSProps<IProps>;
    preTime: CSSProps<IProps>;
    track: CSSProps<IProps>;
    body: CSSProps<IProps>;
    preLine: CSSProps<IProps>;
    longLine: CSSProps<IProps>;
    nextLine: CSSProps<IProps>;
    line: CSSProps<IProps>;
    circle: CSSProps<IProps>;
    nextCircle: CSSProps<IProps>;
    prevCircle: CSSProps<IProps>;
    iconPin: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    description: CSSProps<IProps>;
    action: CSSProps<IProps>;
    notes: CSSProps<IProps>;
    occupancy: CSSProps<IProps>;
    alertsSummary: CSSProps<IProps>;
    cancelledBanner: CSSProps<IProps>;
    cancelledMsg: CSSProps<IProps>;
    separation: CSSProps<IProps>;
    circleSeparation: CSSProps<IProps>;
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
        const previousWaitingSegment = prevWaitingSegment(segment);
        const prevWaitingSegmentTime = previousWaitingSegment ?
            DateTimeUtil.momentFromTimeTZ(previousWaitingSegment.startTime * 1000, segment.from.timezone)
                .format(DateTimeUtil.TIME_FORMAT_TRIP) : undefined;
        const startTime = DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone)
            .format(DateTimeUtil.TIME_FORMAT_TRIP);
        const modeInfo = segment.modeInfo!;
        const from = (segment.isFirst() ? "Leave " : segment.arrival ? "Arrive " : "")
            + (segment.type === SegmentType.stationary ? segment.location.getDisplayString() : segment.from.getDisplayString());
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
        const t = this.props.t;
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
        const showPin = (segment.isFirst() || segment.arrival) && isUnconnected(segment);
        const prevSegment = segment.prevSegment();
        let header;
        if (segment.type === SegmentType.stationary) {
            const nextSegment = segment.nextSegment();
            const arrivePlatform = prevSegment && prevSegment.type === SegmentType.scheduled ? prevSegment.endPlatform : undefined;
            const transferAction = nextSegment && nextSegment.type === SegmentType.scheduled ? nextSegment.startPlatform : segment.getAction();
            const arriveTime = DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone)
                .format(DateTimeUtil.TIME_FORMAT_TRIP);
            const departTime = DateTimeUtil.momentFromTimeTZ(segment.endTime * 1000, segment.from.timezone)
                .format(DateTimeUtil.TIME_FORMAT_TRIP);
            if (prevSegment && prevSegment.type === SegmentType.scheduled && nextSegment && nextSegment.type === SegmentType.scheduled) {
                header = <div className={classes.header}>
                    <div className={classes.track}>
                        <div className={classNames(classes.preLine, classes.longLine)}/>
                        <div className={classNames(classes.prevCircle, classes.circleSeparation)}/>
                        <div className={classes.nextCircle}/>
                        <div className={classes.nextLine}/>
                    </div>
                    <div className={classes.title} aria-label={from}>
                        {from}
                        {arrivePlatform ?
                        <div className={classNames(classes.subtitle, classes.separation)}>
                            {arrivePlatform}
                        </div> : null}
                        <div className={classes.subtitle}>
                            {transferAction}
                        </div>
                        {this.props.actions}
                    </div>
                    <div className={classes.timeBottom} aria-label={"at " + departTime + "."}>
                        <span className={classes.separation}>{arriveTime}</span>
                        <span>{departTime}</span>
                    </div>
                </div>;
            } else {
                const transferAction = nextSegment && nextSegment.type === SegmentType.scheduled ? nextSegment.startPlatform : segment.getAction();
                header = <div className={classes.header}>
                    <div className={classes.track}>
                        <div className={classes.preLine}/>
                        {/*{prevSegment && prevSegment.type === SegmentType.scheduled ?*/}
                            {/*<div className={classes.prevCircle}/> : undefined}*/}
                        {showPin ? <IconPinStart className={classes.iconPin}/> : <div className={classes.nextCircle}/>}
                        <div className={classes.nextLine}/>
                    </div>
                    <div className={classes.title} aria-label={from}>
                        {from}
                        {/*{arrivePlatform &&*/}
                        {/*<div className={classes.subtitle}>*/}
                            {/*{arrivePlatform}*/}
                        {/*</div>}*/}
                        <div className={classes.subtitle}>
                            {transferAction}
                        </div>
                        {this.props.actions}
                    </div>
                    <div className={classes.time} aria-label={"at " + departTime + "."}>
                        {/*{prevWaitingSegmentTime &&*/}
                        {/*<span className={classes.preTime}>{prevWaitingSegmentTime}</span>}*/}
                        <span>{departTime}</span>
                    </div>
                </div>;
            }
        } else if (!prevSegment || prevSegment.type !== SegmentType.stationary) {
            const startPlatform = segment.type === SegmentType.scheduled ? segment.startPlatform : undefined;
            header = <div className={classes.header}>
                <div className={classes.track}>
                    <div className={classes.preLine}/>
                    {showPin ? <IconPinStart className={classes.iconPin}/> :
                        <div className={isUnconnected(segment) ? classes.prevCircle : classes.circle}/>}
                    <div className={classes.line}/>
                </div>
                <div className={classes.title} aria-label={from}>
                    {from}
                    {startPlatform &&
                    <div className={classes.subtitle}>
                        {startPlatform}
                    </div>}
                    {this.props.actions}
                </div>
                <div className={classes.time} aria-label={"at " + startTime + "."}>
                    <span>{startTime}</span>
                </div>
            </div>;
        }
        return (
            <div className={classes.main} tabIndex={0}>
                {header}
                {!segment.arrival && segment.type !== SegmentType.stationary ?
                    <div className={classes.body}>
                        <div className={classes.track}>
                            <div className={classes.line}/>
                            {!segment.isContinuation &&
                            <img
                                src={TransportUtil.getTransportIcon(modeInfo, segment.realTime === true, iconOnDark || this.props.theme.isDark)}
                                className={classes.icon}
                                aria-hidden={true}
                            />}
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
                            {segment.hasAlerts &&
                            <div className={classes.alertsSummary}>
                                <TKUIAlertsSummary
                                    alerts={segment.alerts}
                                    slideUpOptions={{
                                        modalUp: {top: cardSpacing(this.props.landscape), unit: 'px'},
                                    }}
                                />
                            </div>}
                            {segment.isPT() && !segment.isContinuation &&
                            <TKUIButton
                                type={TKUIButtonType.PRIMARY_LINK}
                                text={t("Show.timetable")}
                                onClick={() => this.props.onTimetableForSegment(segment)}
                                styles={{
                                    main: overrideClass({
                                        marginTop: '5px',
                                        paddingLeft: '0'
                                    })
                                }}
                            />
                            }
                        </div>
                    </div>
                    :
                    null
                }
                {segment.isPT() && segment.availability === TripAvailability.CANCELLED && !segment.hasContinuation() &&
                <div className={classes.cancelledBanner}>
                    <div className={classes.cancelledMsg}>
                        {t("Service.has.been.cancelled.")}
                    </div>
                    <TKUIButton
                        type={TKUIButtonType.SECONDARY}
                        text={t("Alternative.routes")}
                        onClick={() => this.props.onRequestAlternativeRoutes && this.props.onRequestAlternativeRoutes(segment)}
                    />
                </div>}
            </div>
        );
    }
}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) =>
                        <ServiceResultsContext.Consumer>
                            {(serviceContext: IServiceResultsContext) =>
                                children!({
                                    ...inputProps,
                                    options: optionsContext.userProfile,
                                    onTimetableForSegment: serviceContext.onTimetableForSegment,
                                    ...viewportProps
                                })
                            }
                        </ServiceResultsContext.Consumer>
                    }
                </OptionsContext.Consumer>
            }
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUISegmentOverview, config, Mapper);