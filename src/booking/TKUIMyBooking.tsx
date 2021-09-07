import React from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {Subtract} from 'utility-types';
import {tKUIMyBookingDefaultStyle} from "./TKUIMyBooking.css";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import TKUIRow from "../options/TKUIRow";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUIFromTo from "./TKUIFromTo";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    booking: ConfirmedBookingData;
    onShowTrip: (tripUrl: string) => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIMyBookingDefaultStyle>

export type TKUIMyBookingProps = IProps;
export type TKUIMyBookingStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMyBooking {...props}/>,
    styles: tKUIMyBookingDefaultStyle,
    classNamePrefix: "TKUIMyBooking"
};

const TKUIMyBooking: React.SFC<IProps> = (props: IProps) => {
    const {onShowTrip, classes, theme} = props;
    const {confirmation, mode, trips, time, timeZone, tripsInfo} = props.booking;
    if (!confirmation) {
        return null;
    }
    const tripUrl = trips?.[0];
    return (
        <div className={classes.main}>
            <div className={classes.timeStatus}>
                <div className={classes.time}>
                    {time ? DateTimeUtil.momentFromTimeTZ(time * 1000, timeZone)
                        .format(DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat()) : ""}
                </div>
                <div className={classes.mode}>
                    <div className={classes.modeName}>
                        {confirmation.provider?.title}
                    </div>
                    <img src={TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(mode!), false, theme.isDark)}/>
                </div>
            </div>
            <TKUIRow
                title={confirmation.status!.title}
                subtitle={confirmation.status?.subtitle}
            />
            <TKUIFromTo from={tripsInfo![0].origin!}
                        to={tripsInfo![0].destination!}
                        onClick={tripUrl ? () => onShowTrip(tripUrl) : undefined}
            />
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIMyBooking, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));