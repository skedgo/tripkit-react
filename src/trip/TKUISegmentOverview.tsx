import * as React from "react";
import Segment, {TripAvailability} from "../model/trip/Segment";
import DateTimeUtil from "../util/DateTimeUtil";
import TransportUtil from "./TransportUtil";
import ServiceStopLocation from "../model/ServiceStopLocation";
import {ClassNameMap} from "react-jss";
import {CSSProps, TKUIWithClasses, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
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

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
    actions?: JSX.Element[];
}

interface IConsumedProps {
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
    preTime: CSSProps<IProps>;
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
    alertsSummary: CSSProps<IProps>;
    cancelledBanner: CSSProps<IProps>;
    cancelledMsg: CSSProps<IProps>;
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
        return (
            <div className={classes.main} tabIndex={0}>
                <div className={classes.header}>
                    <div className={classes.track} aria-label="at">
                        <div className={classes.preLine}/>
                        {showPin ? <IconPinStart className={classes.iconPin}/> : <div className={classes.circle}/>}
                        <div className={classes.posLine}/>
                    </div>
                    <div className={classes.title}>
                        {from}
                        {previousWaitingSegment &&
                        <span className={classes.subtitle}>{previousWaitingSegment.getAction()}</span>}
                        {this.props.actions}
                    </div>
                    <div className={classes.time}>
                        {prevWaitingSegmentTime &&
                        <span className={classes.preTime}>{prevWaitingSegmentTime}</span>}
                        <span>{startTime}</span>
                    </div>
                </div>
                {!this.props.value.arrival ?
                    <div className={classes.body}>
                        <div className={classes.track}>
                            <div className={classes.line}/>
                            {!segment.isContinuation &&
                            <img src={TransportUtil.getTransportIcon(modeInfo, segment.realTime === true, iconOnDark)}
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
                                <TKUIAlertsSummary alerts={segment.alerts}/>
                            </div>}
                            {segment.isPT() && !segment.isContinuation &&
                            <TKUIButton
                                type={TKUIButtonType.PRIMARY_LINK}
                                text={t("Show.timetable")}
                                onClick={() => this.props.onTimetableForSegment(segment)}
                                style={{marginTop: '5px', paddingLeft: '0'}}
                            />
                            }
                        </div>
                    </div>
                    :
                    null
                }
                {/*Disable re-route banner. TODO: finish implementation and enable*/}
                {false && segment.isPT() && segment.availability === TripAvailability.CANCELLED && !segment.hasContinuation() &&
                <div className={classes.cancelledBanner}>
                    <div className={classes.cancelledMsg}>
                        {t("Service.has.been.cancelled.")}
                    </div>
                    <TKUIButton
                        type={TKUIButtonType.SECONDARY}
                        text={t("Alternative.routes")}
                    />
                </div>}
            </div>
        );
    }
}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <ServiceResultsContext.Consumer>
                    {(serviceContext: IServiceResultsContext) =>
                        children!({
                            ...inputProps,
                            options: optionsContext.value,
                            onTimetableForSegment: serviceContext.onTimetableForSegment
                        })
                    }
                </ServiceResultsContext.Consumer>
            }
        </OptionsContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUISegmentOverview, config, Mapper);