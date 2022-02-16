import React from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import TKUIRow from "../options/TKUIRow";
import {ReactComponent as IconTicket} from "../images/ic-ticket.svg";
import {ReactComponent as IconSunClock} from "../images/ic-clocksand.svg";
import {tKUIActiveTripDefaultStyle} from "./TKUIActiveTrip.css";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUIFromTo from "../booking/TKUIFromTo";
import TransportUtil from "../trip/TransportUtil";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    activeTrip: ConfirmedBookingData | undefined | null;
    onShowTrip: () => void;
    onMyBookings: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIActiveTripDefaultStyle>

export type TKUIActiveTripProps = IProps;
export type TKUIActiveTripStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIActiveTrip {...props}/>,
    styles: tKUIActiveTripDefaultStyle,
    classNamePrefix: "TKUIActiveTrip"
};

const TKUIActiveTrip: React.SFC<IProps> = (props: IProps) => {
    const {activeTrip, onShowTrip, onMyBookings, t, classes, theme} = props;
    let content;
    if (activeTrip) {
        content =
            <div className={classes.contentInfo} onClick={onShowTrip}>
                <div className={classes.timeStatus}>
                    <div className={classes.startTime}>
                        {DateTimeUtil.formatRelativeDay(DateTimeUtil.momentFromTimeTZ(activeTrip.time! * 1000, activeTrip.timeZone),
                            DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat(), DateTimeUtil.dateFormat())}
                    </div>
                    <div className={classes.status}>
                        {activeTrip.confirmation?.status?.title}
                    </div>
                </div>
                <div className={classes.mode}>
                    <img src={TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(activeTrip.mode!), false, theme.isDark)}/>
                    {activeTrip.confirmation?.provider?.title}
                </div>
                {activeTrip.tripsInfo?.[0].origin && activeTrip.tripsInfo?.[0].destination &&
                <TKUIFromTo
                    from={activeTrip.tripsInfo[0].origin}
                    to={activeTrip.tripsInfo[0].destination}
                />}
            </div>;
    } else {
        const icon = activeTrip === undefined ? <IconSunClock/> : <IconTicket/>;
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