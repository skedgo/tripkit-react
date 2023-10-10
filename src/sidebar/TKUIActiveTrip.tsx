import React from 'react';
import { TKUIWithClasses, TKUIWithStyle, overrideClass } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import TKUIRow from "../options/TKUIRow";
import { ReactComponent as IconTicket } from "../images/ic-ticket.svg";
import { ReactComponent as IconSunClock } from "../images/ic-clocksand.svg";
import { tKUIActiveTripDefaultStyle } from "./TKUIActiveTrip.css";
import TKUIFromTo from "../booking/TKUIFromTo";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from '../util/DateTimeUtil';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    activeTrip: ConfirmedBookingData | undefined | null;
    onShowTrip: () => void;
    onMyBookings: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIActiveTripDefaultStyle>

export type TKUIActiveTripProps = IProps;
export type TKUIActiveTripStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIActiveTrip {...props} />,
    styles: tKUIActiveTripDefaultStyle,
    classNamePrefix: "TKUIActiveTrip"
};

const TKUIActiveTrip: React.FunctionComponent<IProps> = (props: IProps) => {
    const { activeTrip, onShowTrip, onMyBookings, t, classes, theme } = props;
    let content;
    if (activeTrip) {
        const startTime = activeTrip.datetime ? activeTrip.datetime.split("[")[0] : undefined;
        const timezone = activeTrip.timeZone;
        const dateText = startTime && DateTimeUtil.formatRelativeDay(timezone ? DateTimeUtil.momentFromStringTZ(startTime, timezone) : DateTimeUtil.moment(startTime),
            "MMM DD, YYYY", { justToday: true });
        const modeIcon = activeTrip.modeInfo ? TransportUtil.getTransIcon(activeTrip.modeInfo, { onDark: theme.isDark }) : TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(activeTrip.mode!), false, theme.isDark)
        content =
            <div className={classes.contentInfo} onClick={onShowTrip}>
                <div className={classes.header}>
                    <div className={classes.mode}>
                        <img src={modeIcon} />
                        <div className={classes.modeAndDate}>
                            <div className={classes.modeTitle}>
                                {activeTrip.confirmation?.provider?.title}
                            </div>
                            <div className={classes.date}>
                                {dateText}
                            </div>
                        </div>
                    </div>
                    <div className={classes.status}>
                        {activeTrip.confirmation?.status?.title}
                    </div>
                </div>
                {activeTrip.tripsInfo?.[0].origin && activeTrip.tripsInfo?.[0].destination &&
                    <TKUIFromTo
                        from={activeTrip.tripsInfo[0].origin}
                        to={activeTrip.tripsInfo[0].destination}
                        // This is since date string comes with timezone between square brackets, e.g. "2023-02-07T12:21:45-08:00[America/Los_Angeles]", 
                        // which AFAIK it's not part of the ISO spec, and momentjs doens't support it, so I remove it.
                        startTime={startTime}
                        status={activeTrip.confirmation?.status?.value}
                        timezone={timezone}
                    />}
            </div>;
    } else {
        const icon = activeTrip === undefined ? <IconSunClock /> : <IconTicket />;
        const title = activeTrip === undefined ? t("Getting.your.active.trip…") : t("Your.active.trip.will.be.shown.here.");
        const subtitle = activeTrip === undefined ? t("Please.wait.while.we.look.for.your.active.trip.") : t("You.currently.have.no.active.trip.");
        content =
            <div className={classes.info}>
                <div className={classes.icon}>
                    {icon}
                </div>
                <TKUIRow
                    title={title}
                    subtitle={subtitle}
                    styles={{
                        main: overrideClass({
                            padding: '0 0 0 16px'
                        })
                    }}
                />
            </div>;
    }
    return (
        <div className={classes.main}>
            <div className={classes.activeTripHeader}>
                <div className={classes.activeTripTitle}>{t("Active.trip")}</div>
                <TKUIButton text={t("My.Bookings")}
                    type={TKUIButtonType.PRIMARY_LINK}
                    onClick={() => onMyBookings()}
                />
            </div>
            {content}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIActiveTrip, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));