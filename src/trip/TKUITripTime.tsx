import * as React from "react";
import Trip from "../model/trip/Trip";
import DateTimeUtil from "../util/DateTimeUtil";
import {TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {tKUITripTimeDefaultStyle} from "./TKUITripTime.css";
import TripUtil from "./TripUtil";

export interface ITKUITripTimeProps extends TKUIWithStyle<ITKUITripTimeStyle, ITKUITripTimeProps> {
    value: Trip;
    brief?: boolean;
}

interface IProps extends ITKUITripTimeProps {
    classes: ClassNameMap<keyof ITKUITripTimeStyle>;
}

export interface ITKUITripTimeStyle {

}

class TKUITripTime extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const trip = this.props.value;
        const {departureTime, arrivalTime, duration, hasPT} = TripUtil.getTripTimeData(trip, this.props.brief);
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

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUITripTime");
    return (props: ITKUITripTimeProps) => {
        const stylesToPass = props.styles || tKUITripTimeDefaultStyle;
        return <RawComponentStyled {...props} styles={stylesToPass}/>
    };
};

export default Connect(TKUITripTime);