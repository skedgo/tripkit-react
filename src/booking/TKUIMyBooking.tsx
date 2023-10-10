import React, { useState } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIMyBookingDefaultStyle } from "./TKUIMyBooking.css";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUIFromTo from "./TKUIFromTo";
import TKUIBookingActions from "./TKUIBookingActions";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import TKUITicketSelect from '../stripekit/TKUITicketSelect';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    booking: ConfirmedBookingData;
    onShowTrip: () => void;
    requestRefresh: () => Promise<void>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIMyBookingDefaultStyle>

export type TKUIMyBookingProps = IProps;
export type TKUIMyBookingStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMyBooking {...props} />,
    styles: tKUIMyBookingDefaultStyle,
    classNamePrefix: "TKUIMyBooking"
};

const TKUIMyBooking: React.FunctionComponent<IProps> = (props: IProps) => {
    const { booking, onShowTrip, requestRefresh, classes, theme } = props;
    const { confirmation, mode, trips, time, timeZone, tripsInfo } = props.booking;
    const [waiting, setWaiting] = useState<boolean>(false);
    if (!confirmation) {
        return null;
    }
    const startTime = booking.datetime ? booking.datetime.split("[")[0] : undefined;
    const timezone = booking.timeZone;
    const dateText = startTime && DateTimeUtil.formatRelativeDay(timezone ? DateTimeUtil.momentFromStringTZ(startTime, timezone) : DateTimeUtil.moment(startTime),
        "MMM DD, YYYY", { justToday: true });
    const modeIcon = booking.modeInfo ? TransportUtil.getTransIcon(booking.modeInfo, { onDark: theme.isDark }) : TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(booking.mode!), false, theme.isDark)
    return (
        <div className={classes.main}>
            <div className={classes.form}>
                {/* {confirmation.purchase &&
                    <div>{FormatUtil.toMoney(confirmation.purchase.price, { currency: confirmation.purchase.currency, forceDecimals: true })}</div>} */}
                {/* <TKUIRow
                    title={confirmation.status!.title}
                    subtitle={confirmation.status?.subtitle}
                /> */}
                <div className={classes.contentInfo} onClick={onShowTrip}>
                    <div className={classes.header}>
                        <div className={classes.mode}>
                            <img src={modeIcon} />
                            <div className={classes.modeAndDate}>
                                <div className={classes.modeTitle}>
                                    {booking.confirmation?.provider?.title}
                                </div>
                                <div className={classes.date}>
                                    {dateText}
                                </div>
                            </div>
                        </div>
                        <div className={classes.status}>
                            {booking.confirmation?.status?.title}
                        </div>
                    </div>
                    {booking.tripsInfo?.[0].origin && booking.tripsInfo?.[0].destination &&
                        <TKUIFromTo
                            from={booking.tripsInfo[0].origin}
                            to={booking.tripsInfo[0].destination}
                            // This is since date string comes with timezone between square brackets, e.g. "2023-02-07T12:21:45-08:00[America/Los_Angeles]", 
                            // which AFAIK it's not part of the ISO spec, and momentjs doens't support it, so I remove it.
                            startTime={startTime}
                            status={booking.confirmation?.status?.value}
                            timezone={timezone}
                        />}
                </div>
                {confirmation.tickets && confirmation.tickets?.length > 0 &&
                    <TKUITicketSelect
                        tickets={confirmation.tickets}
                    />
                }
            </div>
            {confirmation.actions.length > 0 &&
                <TKUIBookingActions
                    actions={confirmation.actions}
                    setWaiting={setWaiting}
                    requestRefresh={requestRefresh}
                />}
            {waiting &&
                <div className={classes.loadingPanel}>
                    <IconSpin className={classes.iconLoading} focusable="false" role="status" aria-label="Waiting results" />
                </div>}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIMyBooking, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));