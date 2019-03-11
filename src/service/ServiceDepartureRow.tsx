import * as React from "react";
import {IServiceDepartureRowProps as IProps} from "./IServiceDepartureRowProps";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import moment from "moment-timezone";
import "./ServiceDepartureRow.css";

class ServiceDepartureRow extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const departure = this.props.value;
        const departureTime = DateTimeUtil.momentTZTime(departure.startTime * 1000);
        const transIcon = TransportUtil.getTransportIcon(departure.modeInfo);
        let serviceAndTime;
        if (departure.endTime) {
            const endTime = DateTimeUtil.momentTZTime(departure.endTime * 1000);
            serviceAndTime = (departure.serviceNumber ? departure.serviceNumber + ": " : "")
                + departureTime.format(DateTimeUtil.TIME_FORMAT_TRIP) + " - " + endTime.format(DateTimeUtil.TIME_FORMAT_TRIP);
        } else {
            serviceAndTime = (departure.serviceNumber ? departure.serviceNumber + " at " : "At ")
                + departureTime.format(DateTimeUtil.TIME_FORMAT_TRIP);
        }
        const origin = departure.startStop && departure.startStop.shortName && departure.startStop.shortName.trim() ? departure.startStop.shortName : undefined;
        const directionOrName = departure.serviceDirection ? departure.serviceDirection : departure.serviceName;
        const serviceDescrText = origin ? origin + " · " + directionOrName : directionOrName;
        const timeToDepart = moment.duration(departureTime.diff(DateTimeUtil.getNow())).asMinutes();
        const timeToDepartS = DateTimeUtil.minutesToDepartToString(timeToDepart);
        return (
            <div className="gl-flex gl-align-center">
                <div className="gl-flex gl-center gl-align-center gl-no-shrink ServiceDepartureRow-transIconPanel">
                    <img src={transIcon} className="ServiceDepartureRow-transIcon"
                         style={{
                             borderColor: departure.serviceColor ? departure.serviceColor.toHex() : undefined
                         }}
                    />
                </div>
                <div className="gl-grow ServiceDepartureRow-middlePanel">
                    <div className="ServiceDepartureRow-serviceAndTime">{serviceAndTime}</div>
                    <div className="ServiceDepartureRow-serviceDescription gl-overflow-ellipsis">{serviceDescrText}</div>
                </div>
                <div className={"gl-flex gl-align-center gl-center gl-no-shrink ServiceDepartureRow-timeToDepart" +
                (timeToDepart < 0 ? " ServiceDepartureRow-timeToDepartPast" : "")}>
                    {timeToDepartS}
                </div>
            </div>
        );
    }
}

export default ServiceDepartureRow;