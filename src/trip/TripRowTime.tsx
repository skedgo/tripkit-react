import * as React from "react";
import Trip from "../model/trip/Trip";
import DateTimeUtil from "../util/DateTimeUtil";

export interface IProps {
    value: Trip;
}

class TripRowTime extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const trip = this.props.value;
        const depart = trip.depart;
        const arrive = trip.arrive;
        const departureTime = DateTimeUtil.momentTZTime(depart * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        const arrivalTime = DateTimeUtil.momentTZTime(arrive * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        // Truncates to minutes before subtract to display a duration in minutes that is consistent with
        // departure and arrival times, which are also truncated to minutes.
        const durationInMinutes = Math.floor(arrive/60) - Math.floor(depart/60);
        const duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
        const hasPT = trip.hasPublicTransport();

        return (
            <div>
                {(hasPT ?
                    <div>
                        <span className="h5-text"><span>{departureTime}</span> <span>-</span> <span>{arrivalTime}</span></span>
                        <span className="text gl-charSpaceLeft">({duration})</span>
                    </div>
                    :
                    <div>
                        <span className="h5-text">{duration}</span>
                        <span className="text gl-charSpaceLeft">
                                ({trip.queryIsLeaveAfter ? "arrive " + arrivalTime : "depart " + departureTime})
                                    </span>
                    </div>)}
            </div>
        );
    }
}

export default TripRowTime;