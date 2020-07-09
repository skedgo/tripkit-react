import * as React from "react";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import moment from "moment-timezone";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ClassNameMap, createGenerateClassName, CSSProperties, JssProvider} from "react-jss";
import {tKUIServiceDepartureRowDefaultStyle} from "./TKUIServiceDepartureRow.css";
import classNames from "classnames";
import TKUIOccupancySign from "./occupancy/TKUIOccupancyInfo";
import TKUIWheelchairInfo from "./occupancy/TKUIWheelchairInfo";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import {Subtract} from "utility-types";
import TKUserProfile from "../model/options/TKUserProfile";
import {ReactComponent as AlertIcon} from "../images/ic-alert.svg";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: ServiceDeparture;
    detailed?: boolean;
    onClick?: () => void;
    selected?: boolean;
    renderRight?: () => JSX.Element;
}

interface IConsumedProps {
    options: TKUserProfile;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    row: CSSProps<IProps>;
    rowSelected: CSSProps<IProps>;
    clickable: CSSProps<IProps>;
    leftPanel: CSSProps<IProps>;
    header: CSSProps<IProps>;
    timeAndOccupancy: CSSProps<IProps>;
    serviceNumber: CSSProps<IProps>;
    transIcon: CSSProps<IProps>;
    time: CSSProps<IProps>;
    cancelled: CSSProps<IProps>;
    delayed: CSSProps<IProps>;
    onTime: CSSProps<IProps>;
    separatorDot: CSSProps<IProps>;
    timeToDepart: CSSProps<IProps>;
    timeToDepartCancelled: CSSProps<IProps>;
    timeToDepartPast: CSSProps<IProps>;
    serviceDescription: CSSProps<IProps>;
    occupancy: CSSProps<IProps>;
    trainOccupancy: CSSProps<IProps>;
    alertIcon: CSSProps<IProps>;
}

export type TKUIServiceDepartureRowProps = IProps;
export type TKUIServiceDepartureRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIServiceDepartureRow {...props}/>,
    styles: tKUIServiceDepartureRowDefaultStyle,
    classNamePrefix: "TKUIServiceDepartureRow",
    randomizeClassNames: true // This needs to be true since multiple instances are rendered,
                              // each with a different service color.
};

export function getRealtimeDiffInMinutes(departure: ServiceDeparture) {
    return Math.floor(departure.actualStartTime / 60 - departure.startTime / 60);
}

class TKUIServiceDepartureRow extends React.Component<IProps, {}> {

    private getTime(departure: ServiceDeparture): JSX.Element | undefined {
        const t = this.props.t;
        let status: string | undefined;
        let modifier: string | undefined = undefined;
        let statusClassname: string | undefined;
        const classes = this.props.classes;
        if (departure.realTimeStatus === "CANCELLED") {
            status = "Cancelled";
            statusClassname = classes.cancelled;
        } else if (departure.realTimeDeparture === undefined) { // Means realtimeStatus !== "IS_REAL_TIME"
            status = t("No.real-time.available");
        } else {
            // Truncates to minutes before subtract to make diff consistent with displayed actual and original times
            const realtimeDiffInMinutes = getRealtimeDiffInMinutes(departure);
            if (realtimeDiffInMinutes === 0) {
                status = "On time";
                statusClassname = classes.onTime;
            } else {
                const diffS = DateTimeUtil.durationToBriefString(Math.abs(realtimeDiffInMinutes));
                // const origStartS = DateTimeUtil.momentFromTimeTZ(departure.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
                if (realtimeDiffInMinutes < 0) {
                    status = "Early";
                    modifier = diffS + " early";
                } else {
                    status = "Delayed";
                    modifier = diffS + " late";
                    statusClassname = classes.delayed;
                }
            }
        }
        const timezone = departure.startTimezone;
        let serviceTime;
        const departureTime = DateTimeUtil.momentFromTimeTZ(departure.actualStartTime * 1000, timezone);
        if (departure.actualEndTime) {
            const endTime = DateTimeUtil.momentFromTimeTZ(departure.actualEndTime * 1000, timezone);
            serviceTime = departureTime.format(DateTimeUtil.TIME_FORMAT_TRIP) + " - " + endTime.format(DateTimeUtil.TIME_FORMAT_TRIP);
        } else {
            serviceTime = departureTime.format(DateTimeUtil.TIME_FORMAT_TRIP);
        }
        return (
            <div className={classNames(classes.time, statusClassname)}>
                {status &&
                [<span key={"status"}>{status}</span>,
                <span className={classes.separatorDot} key={"statusSeparator"}>⋅</span>]}
                {modifier &&
                [<span key={"modifier"}>{modifier}</span>,
                <span className={classes.separatorDot} key={"modifierSeparator"}>⋅</span>]}
                <span>
                    {serviceTime}
                </span>
            </div>
        );
    }

    public render(): React.ReactNode {
        const departure = this.props.value;
        const timezone = departure.startTimezone;
        const departureTime = DateTimeUtil.momentFromTimeTZ(departure.actualStartTime * 1000, timezone);
        const transIcon = TransportUtil.getTransportIcon(departure.modeInfo, false, this.props.theme.isDark);
        const origin = departure.startStop && departure.startStop.shortName && departure.startStop.shortName.trim() ? departure.startStop.shortName : undefined;
        const directionOrName = departure.serviceDirection ? departure.serviceDirection : departure.serviceName;
        const serviceDescrText = origin ? origin + " · " + directionOrName : directionOrName;
        const cancelled = departure.realTimeStatus === "CANCELLED";
        let timeToDepart = moment.duration(departureTime.diff(DateTimeUtil.getNow())).asMinutes();
        // Round negative up, so less than a minute in the past from now is considered 'Now'.
        timeToDepart = timeToDepart < 0 ? Math.ceil(timeToDepart) : Math.floor(timeToDepart);
        // const timeToDepart = Math.floor(departureTime.valueOf() / 60000) - Math.ceil(DateTimeUtil.getNow().valueOf() / 60000);
        const timeToDepartS = cancelled ? "Cancelled" : DateTimeUtil.minutesToDepartToString(timeToDepart);
        const time = this.getTime(departure);
        const classes = this.props.classes;
        const detailed = this.props.detailed;
        const occupancy = departure.realtimeVehicle && departure.realtimeVehicle.getOccupancyStatus();
        const briefOccupancy = !detailed && occupancy ?
            <TKUIOccupancySign status={occupancy} brief={true}/> : undefined;
        const briefWheelchair = !detailed &&
            (this.props.options.wheelchair || departure.isWheelchairAccessible() === false) &&
            <TKUIWheelchairInfo accessible={departure.isWheelchairAccessible()} brief={true}/>;
        return (
            <div className={classNames(classes.main, this.props.onClick && classes.clickable,
                !detailed && classes.row, this.props.selected && classes.rowSelected)}
                 onClick={this.props.onClick}>
                <div className={classes.leftPanel}>
                    <div className={classes.header}>
                        {departure.serviceNumber &&
                        <div className={classes.serviceNumber}>
                            {departure.serviceNumber}
                        </div>}
                        <img src={transIcon} className={classes.transIcon}/>
                        {briefWheelchair}
                        {briefOccupancy}
                        {departure.hasAlerts && <AlertIcon className={classes.alertIcon}/>}
                    </div>
                    <div className={classes.timeAndOccupancy}>
                        {time}
                    </div>
                    <div className={classes.serviceDescription}>{serviceDescrText}</div>
                </div>
                {this.props.renderRight ? this.props.renderRight() :
                    <div
                        className={classNames(classes.timeToDepart,
                            cancelled && classes.timeToDepartCancelled, timeToDepart < 0 &&  classes.timeToDepartPast)}>
                        {timeToDepartS}
                    </div>
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
                    options: optionsContext.userProfile
                })
            }
        </OptionsContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUIServiceDepartureRow, config, Mapper);