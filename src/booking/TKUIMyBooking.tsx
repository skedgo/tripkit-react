import React from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {Subtract} from 'utility-types';
import {tKUIMyBookingDefaultStyle} from "./TKUIMyBooking.css";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import TKUIRow from "../options/TKUIRow";
import TKUISettingLink from "../options/TKUISettingLink";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";

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
    const {confirmation, mode, trips, time, timeZone} = props.booking;
    if (!confirmation) {
        return null;
    }
    const tripUrl = trips?.[0];
    return (
        <div className={classes.main}>
            {time &&
            <div className={classes.startTime}>
                {DateTimeUtil.momentFromTimeTZ(time * 1000, timeZone)
                    .format(DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat())}
            </div>}
            <TKUIRow
                title={confirmation.status!.title}
                subtitle={confirmation.status?.subtitle}
            />
            <div>
                {confirmation.provider?.title}
            </div>
            {tripUrl &&
            <TKUISettingLink
                text={<img src={TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(mode!), false, theme.isDark)}/>}
                onClick={() => onShowTrip(tripUrl)}
            />}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIMyBooking, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));