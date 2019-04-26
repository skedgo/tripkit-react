import * as React from "react";
import {IServiceDepartureRowProps as IProps} from "./IServiceDepartureRowProps";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import moment from "moment-timezone";
import "./ServiceDepartureRow.css";
import ServiceDeparture from "../model/service/ServiceDeparture";
import IconWCAccessible from "-!svg-react-loader!../images/service/ic_wheelchair_accessible.svg";
import IconWCInaccessible from "-!svg-react-loader!../images/service/ic_wheelchair_inaccessible.svg";
import IconWCUnknown from "-!svg-react-loader!../images/service/ic_wheelchair_unknown.svg";
import OptionsData from "../data/OptionsData";

class ServiceDepartureRow extends React.Component<IProps, {}> {

    private getRealtimeText(departure: ServiceDeparture): string | undefined {
        if (departure.realTimeStatus === "CANCELLED") {
            return "Cancelled";
        }
        if (departure.realTimeDeparture === undefined) {
            return undefined;
        }
        // Truncates to minutes before subtract to make diff consistent with displayed actual and original times
        const realtimeDiffInMinutes = Math.floor(departure.actualStartTime/60 - departure.startTime/60);
        if (realtimeDiffInMinutes === 0) {
            return "On time";
        }
        const diffS = DateTimeUtil.durationToBriefString(Math.abs(realtimeDiffInMinutes));
        const origStartS = DateTimeUtil.momentTZTime(departure.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        return realtimeDiffInMinutes < 0 ? diffS + " early (" + origStartS + " service)" :
            diffS + " late (" + origStartS + " service)"
    }

    public render(): React.ReactNode {
        const departure = this.props.value;
        const departureTime = DateTimeUtil.momentTZTime(departure.actualStartTime * 1000);
        const transIcon = TransportUtil.getTransportIcon(departure.modeInfo);
        let serviceAndTime;
        if (departure.actualEndTime) {
            const endTime = DateTimeUtil.momentTZTime(departure.actualEndTime * 1000);
            serviceAndTime = (departure.serviceNumber ? departure.serviceNumber + ": " : "")
                + departureTime.format(DateTimeUtil.TIME_FORMAT_TRIP) + " - " + endTime.format(DateTimeUtil.TIME_FORMAT_TRIP);
        } else {
            serviceAndTime = (departure.serviceNumber ? departure.serviceNumber + " at " : "At ")
                + departureTime.format(DateTimeUtil.TIME_FORMAT_TRIP);
        }
        const origin = departure.startStop && departure.startStop.shortName && departure.startStop.shortName.trim() ? departure.startStop.shortName : undefined;
        const directionOrName = departure.serviceDirection ? departure.serviceDirection : departure.serviceName;
        const serviceDescrText = origin ? origin + " · " + directionOrName : directionOrName;
        const cancelled = departure.realTimeStatus === "CANCELLED";
        const timeToDepart = moment.duration(departureTime.diff(DateTimeUtil.getNow())).asMinutes();
        const timeToDepartS = cancelled ? "Cancelled" : DateTimeUtil.minutesToDepartToString(timeToDepart);
        const realtimeText = this.getRealtimeText(departure);
        const WCIcon = departure.wheelchairAccessible === undefined ? IconWCUnknown :
            departure.wheelchairAccessible ? IconWCAccessible : IconWCInaccessible;
        const wCText = departure.wheelchairAccessible === undefined ? "Wheelchair accessibility unknown" :
            departure.wheelchairAccessible ? "Wheelchair accessible" : "Wheelchair inaccessible";
        return (
            <div className="ServiceDepartureRow-outerPanel">
                <div className={"ServiceDepartureRow gl-flex gl-column" + (this.props.onClick ? " ServiceDepartureRow-clickable" : "")}
                     onClick={this.props.onClick}>
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
                            {realtimeText &&
                            <div className="ServiceDepartureRow-realtimeInfo">{realtimeText}</div>}
                        </div>
                        {this.props.renderRight ? this.props.renderRight() :
                            <div
                                className={"gl-flex gl-align-center gl-center gl-no-shrink ServiceDepartureRow-timeToDepart" +
                                (cancelled ? " ServiceDepartureRow-timeToDepartCancelled" : "") +
                                (timeToDepart < 0 ? " ServiceDepartureRow-timeToDepartPast" : "")}>
                                {timeToDepartS}
                            </div>
                        }
                    </div>
                    { OptionsData.instance.get().wheelchair &&
                        <div className="gl-flex ServiceDepartureRow-wCInfoPanel">
                            <div className={"ServiceDepartureRow-wCFrame gl-flex gl-center gl-align-center" +
                            (departure.wheelchairAccessible ? " ServiceDepartureRow-wCAccessible" : " ServiceDepartureRow-wCInaccessible")}>
                                <WCIcon className="gl-svg-path-fill-currColor ServiceDepartureRow-wCIcon"/>
                            </div>
                            <div className="gl-flex gl-grow ServiceDepartureRow-wCText">
                                {wCText}
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default ServiceDepartureRow;