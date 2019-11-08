import * as React from "react";
import ITKUIServiceDepartureRowProps from "./ITKUIServiceDepartureRowProps";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import moment from "moment-timezone";
import "./TKUIServiceDepartureRowDelete.css";
import ServiceDeparture from "../model/service/ServiceDeparture";
import OptionsData from "../data/OptionsData";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap, createGenerateClassName, CSSProperties, JssProvider} from "react-jss";
import {tKUIServiceDepartureRowDefaultStyle} from "./TKUIServiceDepartureRow.css";
import classNames from "classnames";
import TKUIOccupancySign from "./occupancy/TKUIOccupancyInfo";
import TKUIWheelchairInfo from "./occupancy/TKUIWheelchairInfo";

interface IProps extends ITKUIServiceDepartureRowProps {
    classes: ClassNameMap<keyof ITKUIServiceDepartureRowStyle>
}

export interface ITKUIServiceDepartureRowStyle {
    main: CSSProps<ITKUIServiceDepartureRowProps>;
    clickable: CSSProps<ITKUIServiceDepartureRowProps>;
    leftPanel: CSSProps<ITKUIServiceDepartureRowProps>;
    header: CSSProps<ITKUIServiceDepartureRowProps>;
    timeAndOccupancy: CSSProps<ITKUIServiceDepartureRowProps>;
    serviceNumber: CSSProps<ITKUIServiceDepartureRowProps>;
    transIcon: CSSProps<ITKUIServiceDepartureRowProps>;
    time: CSSProps<ITKUIServiceDepartureRowProps>;
    delayed: CSSProps<ITKUIServiceDepartureRowProps>;
    onTime: CSSProps<ITKUIServiceDepartureRowProps>;
    separatorDot: CSSProps<ITKUIServiceDepartureRowProps>;
    timeToDepart: CSSProps<ITKUIServiceDepartureRowProps>;
    timeToDepartCancelled: CSSProps<ITKUIServiceDepartureRowProps>;
    timeToDepartPast: CSSProps<ITKUIServiceDepartureRowProps>;
    serviceDescription: CSSProps<ITKUIServiceDepartureRowProps>;
    occupancy: CSSProps<ITKUIServiceDepartureRowProps>;
}

export class TKUIServiceDepartureRowConfig implements TKUIWithStyle<ITKUIServiceDepartureRowStyle, ITKUIServiceDepartureRowProps> {
    public styles = tKUIServiceDepartureRowDefaultStyle;
    public randomizeClassNames?: boolean = true; // Default should be undefined in general, meaning to inherit ancestor's
                                              // JssProvider, but in this case is true since multiple instances are
                                              // rendered, each with a different service color.

    public static instance = new TKUIServiceDepartureRowConfig();
}

class TKUIServiceDepartureRow extends React.Component<IProps, {}> {

    private getTime(departure: ServiceDeparture): JSX.Element | undefined {
        let status: string | undefined;
        let modifier: string | undefined = undefined;
        let statusClassname: string | undefined;
        const classes = this.props.classes;
        if (departure.realTimeStatus === "CANCELLED") {
            status = "Cancelled";
            statusClassname = classes.delayed;
        } else if (departure.realTimeDeparture === undefined) {
            status = undefined;
        } else {
            // Truncates to minutes before subtract to make diff consistent with displayed actual and original times
            const realtimeDiffInMinutes = Math.floor(departure.actualStartTime / 60 - departure.startTime / 60);
            if (realtimeDiffInMinutes === 0) {
                status = "On time";
                statusClassname = classes.onTime;
            } else {
                const diffS = DateTimeUtil.durationToBriefString(Math.abs(realtimeDiffInMinutes));
                // const origStartS = DateTimeUtil.momentTZTime(departure.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
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
        let serviceTime;
        const departureTime = DateTimeUtil.momentTZTime(departure.actualStartTime * 1000);
        if (departure.actualEndTime) {
            const endTime = DateTimeUtil.momentTZTime(departure.actualEndTime * 1000);
            serviceTime = departureTime.format(DateTimeUtil.TIME_FORMAT_TRIP) + " - " + endTime.format(DateTimeUtil.TIME_FORMAT_TRIP);
        } else {
            serviceTime = departureTime.format(DateTimeUtil.TIME_FORMAT_TRIP);
        }
        return (
            <div className={classNames(classes.time, statusClassname)}>
                {status &&
                [<span>{status}</span>,
                <span className={classes.separatorDot}>⋅</span>]}
                {modifier &&
                [<span>{modifier}</span>,
                <span className={classes.separatorDot}>⋅</span>]}
                <span>
                    {serviceTime}
                </span>
            </div>
        );
    }

    public render(): React.ReactNode {
        const departure = this.props.value;
        const departureTime = DateTimeUtil.momentTZTime(departure.actualStartTime * 1000);
        const transIcon = TransportUtil.getTransportIcon(departure.modeInfo);
        const origin = departure.startStop && departure.startStop.shortName && departure.startStop.shortName.trim() ? departure.startStop.shortName : undefined;
        const directionOrName = departure.serviceDirection ? departure.serviceDirection : departure.serviceName;
        const serviceDescrText = origin ? origin + " · " + directionOrName : directionOrName;
        const cancelled = departure.realTimeStatus === "CANCELLED";
        const timeToDepart = moment.duration(departureTime.diff(DateTimeUtil.getNow())).asMinutes();
        const timeToDepartS = cancelled ? "Cancelled" : DateTimeUtil.minutesToDepartToString(timeToDepart);
        const time = this.getTime(departure);
        const hasBusOccupancy = departure.realtimeVehicle && departure.realtimeVehicle.components &&
            departure.realtimeVehicle.components.length === 1 && departure.realtimeVehicle.components[0].length === 1 &&
            departure.realtimeVehicle.components[0][0].occupancy;
        const classes = this.props.classes;
        const detailed = this.props.detailed;
        const briefOccupancy = !detailed && hasBusOccupancy ?
            <TKUIOccupancySign status={departure.realtimeVehicle!.components![0][0].occupancy!} brief={true}/> : undefined;
        const briefWheelchair = !detailed && OptionsData.instance.get().wheelchair && departure.wheelchairAccessible &&
            <TKUIWheelchairInfo accessible={departure.wheelchairAccessible} brief={true}/>;
        return (
            <div className={classNames(classes.main, this.props.onClick && classes.clickable)}
                 onClick={this.props.onClick}>
                <div className={classes.leftPanel}>
                    <div className={classes.header}>
                        {departure.serviceNumber &&
                        <div className={classes.serviceNumber}>
                            {departure.serviceNumber}
                        </div>}
                        <img src={transIcon} className={classes.transIcon}/>
                        {briefWheelchair}
                    </div>
                    <div className={classes.timeAndOccupancy}>
                        {time}
                        {briefOccupancy}
                    </div>
                    <div className={classNames(classes.serviceDescription, "ServiceDepartureRow-serviceDescription gl-overflow-ellipsis")}>{serviceDescrText}</div>
                </div>
                {this.props.renderRight ? this.props.renderRight() :
                    <div
                        className={classNames("gl-flex gl-align-center gl-center gl-no-shrink", classes.timeToDepart,
                            cancelled && classes.timeToDepartCancelled, timeToDepart < 0 &&  classes.timeToDepartPast)}>
                        {timeToDepartS}
                    </div>
                }
            </div>
        );
    }
}

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUIServiceDepartureRow");
    return (props: ITKUIServiceDepartureRowProps) => {
        const stylesToPass = props.styles || TKUIServiceDepartureRowConfig.instance.styles;
        const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
            TKUIServiceDepartureRowConfig.instance.randomizeClassNames;
        return <RawComponentStyled {...props} styles={stylesToPass} randomizeClassNames={randomizeClassNamesToPass}/>;
    };
};

export default Connect(TKUIServiceDepartureRow);