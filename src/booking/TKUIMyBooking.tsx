import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIMyBookingDefaultStyle } from "./TKUIMyBooking.css";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUIFromTo from "./TKUIFromTo";
import TKUIBookingActions from "./TKUIBookingActions";
import TKUITicketSelect from '../stripekit/TKUITicketSelect';
import { ReactComponent as IconReturn } from "../images/ic-return-arrow.svg";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    booking: ConfirmedBookingData;
    type?: string;
    onShowTrip?: (tripUrl: string) => void;
    showTickets?: boolean;
    showActions?: boolean;
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
    const { booking, onShowTrip, classes, theme, showTickets = true, showActions = true, type } = props;
    const { confirmation, mode, timeZone, tripInfo, trip } = props.booking;
    if (!confirmation) {
        return null;
    }
    const startTime = tripInfo?.depart ? tripInfo.depart.split("[")[0] : undefined; // TODO: configure a custom resolver for doing this at model level.
    const endTime = tripInfo?.arrive ? tripInfo.arrive.split("[")[0] : undefined; // TODO: configure a custom resolver for doing this at model level.
    const dateText = startTime && DateTimeUtil.formatRelativeDay(timeZone ? DateTimeUtil.momentFromStringTZ(startTime, timeZone) : DateTimeUtil.moment(startTime),
        "MMM DD, YYYY", { justToday: true });
    const modeIcon = booking.modeInfo ? TransportUtil.getTransIcon(booking.modeInfo, { onDark: theme.isDark }) : TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(mode!), false, theme.isDark)
    const showTripHandler = () => trip && onShowTrip?.(trip);
    return (
        <div className={classes.main}>
            <div className={classes.form}>
                {/* {confirmation.purchase &&
                    <div>{FormatUtil.toMoney(confirmation.purchase.price, { currency: confirmation.purchase.currency, forceDecimals: true })}</div>} */}
                {/* <TKUIRow
                    title={confirmation.status!.title}
                    subtitle={confirmation.status?.subtitle}
                /> */}
                {/* <div className={classes.contentInfo} onClick={() => onShowTrip(trips?.[0]!)}> */}
                <div className={classes.header} onClick={showTripHandler}>
                    <div>
                        <div className={classes.mode}>
                            <img src={modeIcon} alt='' />
                            <div className={classes.modeAndDate}>
                                <div className={classes.modeTitle}>
                                    {confirmation?.provider?.title}
                                </div>
                                <div className={classes.date}>
                                    {dateText}
                                </div>
                            </div>
                        </div>
                        {type === "RETURN" &&
                            <div className={classes.type}>
                                <IconReturn className={classes.iconType} />
                                Return
                            </div>}
                    </div>
                    <div className={classes.status}>
                        {confirmation?.status?.title}
                    </div>
                </div>
                {tripInfo?.origin && tripInfo?.destination &&
                    <div className={classes.fromTo} onClick={showTripHandler}>
                        <TKUIFromTo
                            from={tripInfo.origin}
                            to={tripInfo.destination}
                            // This is since date string comes with timezone between square brackets, e.g. "2023-02-07T12:21:45-08:00[America/Los_Angeles]", 
                            // which AFAIK it's not part of the ISO spec, and momentjs doens't support it, so I remove it.
                            startTime={startTime}
                            endTime={endTime}
                            queryIsLeaveAfter={tripInfo.queryIsLeaveAfter}
                            status={confirmation?.status?.value}
                            timezone={timeZone}
                        />
                    </div>}
                {showTickets && confirmation.tickets && confirmation.tickets?.length > 0 &&
                    <TKUITicketSelect
                        tickets={confirmation.tickets}
                    />
                }
            </div>
            {showActions && confirmation.actions.length > 0 &&
                <TKUIBookingActions
                    actions={confirmation.actions}
                />}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIMyBooking, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));