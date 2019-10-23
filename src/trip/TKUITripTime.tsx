import * as React from "react";
import Trip from "../model/trip/Trip";
import DateTimeUtil from "../util/DateTimeUtil";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
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
    main: CSSProps<ITKUITripTimeProps>;
    timePrimary: CSSProps<ITKUITripTimeProps>;
    timeSecondary: CSSProps<ITKUITripTimeProps>;
}

class TKUITripTime extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const trip = this.props.value;
        const {departureTime, arrivalTime, duration, hasPT} = TripUtil.getTripTimeData(trip, this.props.brief);
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                {(hasPT ?
                    [
                        <span className={classes.timePrimary} key={0}><span>{departureTime}</span> <span>-</span> <span>{arrivalTime}</span></span>,
                        <span className={classes.timeSecondary} key={1}>{duration}</span>
                    ]
                    :
                    [
                        <span className={classes.timePrimary} key={0}>{duration}</span>,
                        <span className={classes.timeSecondary} key={1}>
                                {trip.queryIsLeaveAfter ? "arrive " + arrivalTime : "depart " + departureTime}
                                    </span>
                    ])}
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