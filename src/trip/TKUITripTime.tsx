import * as React from "react";
import Trip from "../model/trip/Trip";
import DateTimeUtil from "../util/DateTimeUtil";
import {CSSProps, TKUIWithClasses, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {tKUITripTimeDefaultStyle} from "./TKUITripTime.css";
import TripUtil from "./TripUtil";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Trip;
    brief?: boolean;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export interface IStyle {
    main: CSSProps<IProps>;
    timePrimary: CSSProps<IProps>;
    timeSecondary: CSSProps<IProps>;
}

export type TKUITripTimeProps = IProps;
export type TKUITripTimeStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripTime {...props}/>,
    styles: tKUITripTimeDefaultStyle,
    classNamePrefix: "TKUITripTime"
};

class TKUITripTime extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const trip = this.props.value;
        const {departureTime, arrivalTime, duration, hasPT} = TripUtil.getTripTimeData(trip, this.props.brief);
        const classes = this.props.classes;
        const t = this.props.t;
        return (
            <div className={classes.main}>
                    {(hasPT ?
                    [
                        <span className={classes.timePrimary} key={0}><span>{departureTime}</span> <span aria-label="to">-</span> <span>{arrivalTime}</span></span>,
                        <span className={classes.timeSecondary} key={1}>{duration}</span>
                    ]
                    :
                    [
                        <span className={classes.timePrimary} key={0}>{duration}</span>,
                        <span className={classes.timeSecondary} key={1}>
                                {trip.queryIsLeaveAfter ? t("arrives.X", {0: arrivalTime}) : t("departs.X", {0: departureTime})}
                       </span>
                    ])}
            </div>
        );
    }
}
export default connect((config: TKUIConfig) => config.TKUITripTime, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));