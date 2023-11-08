import React, { useState, useEffect, Fragment, useContext } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { Subtract } from 'utility-types';
import { tKUIMyBookingsDefaultStyle } from "./TKUIMyBookings.css";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import { ConfirmedBookingsResult } from "../model/trip/ConfirmedBookingData";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import TKLoading from "../card/TKLoading";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import Trip from "../model/trip/Trip";
import { ERROR_LOADING_DEEP_LINK } from "../error/TKErrorHelper";
import { TKError } from "../error/TKError";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import Segment from "../model/trip/Segment";
import Tabs from '@material-ui/core/Tabs/Tabs';
import Tab from '@material-ui/core/Tab/Tab';
import DateTimeUtil from '../util/DateTimeUtil';
import TKUIMyBookingGroup from './TKUIMyBookingGroup';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose: (closeAll?: boolean) => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    onTripJsonUrl: (tripJsonUrl: string) => Promise<Trip[] | undefined>;
    onWaitingStateLoad: (waiting: boolean, error?: Error) => void;
    onTripDetailsView: (tripDetailsView: boolean) => void;
    setSelectedTripSegment: (segment?: Segment) => void;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIMyBookingsDefaultStyle>

export type TKUIMyBookingsProps = IProps;
export type TKUIMyBookingsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMyBookings {...props} />,
    styles: tKUIMyBookingsDefaultStyle,
    classNamePrefix: "TKUIMyBookings"
};

enum Sections {
    Valid = "Valid",
    Expired = "Expired"
}

const TKUIMyBookings: React.FunctionComponent<IProps> = (props: IProps) => {
    const [bookings, setBookings] = useState<ConfirmedBookingData[] | undefined>(undefined);
    const validBookings = bookings?.filter(booking => DateTimeUtil.isoCompare(booking.datetime, DateTimeUtil.getNow().format()) >= 0);
    const expiredBookings = bookings?.filter(booking => DateTimeUtil.isoCompare(booking.datetime, DateTimeUtil.getNow().format()) < 0);
    const refreshBookings = () =>
        TripGoApi.apiCallT("booking", NetworkUtil.MethodType.GET, ConfirmedBookingsResult)
            .then((result: ConfirmedBookingsResult) => setBookings(result.bookings))
            .catch(e => console.log(e));
    useEffect(() => {
        let refreshTimeout;
        refreshBookings()
            .finally(() => {
                refreshTimeout = setTimeout(refreshBookings, 30000);
            });
        return () => {
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }
        }
    }, []);
    const { onRequestClose, onTripJsonUrl, onWaitingStateLoad, onTripDetailsView, setSelectedTripSegment, slideUpOptions, t, landscape, classes } = props;
    const [section, setSection] = useState<Sections>(Sections.Valid);
    const tabs =
        <Tabs value={section} onChange={(_event, newSection) => setSection(newSection)} aria-label="text formatting">
            <Tab value={Sections.Valid} label={t(Sections.Valid)} disableFocusRipple disableTouchRipple />
            <Tab value={Sections.Expired} label={t(Sections.Expired)} disableFocusRipple disableTouchRipple />
        </Tabs>;
    const tabBookings = section === Sections.Valid ? validBookings : expiredBookings;
    return (
        <TKUICard
            title={t("My.Bookings")}
            onRequestClose={onRequestClose}
            presentation={landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            slideUpOptions={slideUpOptions}
            focusTrap={true}
        >
            <div className={classes.main}>
                <div className={classes.tabs}>
                    {tabs}
                </div>
                {!bookings ?
                    <div className={classes.loadingPanel}>
                        <TKLoading />
                    </div> :
                    tabBookings!.length === 0 ?
                        <div className={classes.noResults} role="status" aria-label={t("No.bookings.yet_n")}>
                            {t("No.bookings.yet_n")}
                        </div> :
                        <div className={classes.results}>
                            {tabBookings!.map((booking, i) =>
                                <TKUIMyBookingGroup
                                    booking={booking}
                                    requestRefresh={refreshBookings}
                                    key={booking.id}
                                />)}
                        </div>
                }
            </div>
        </TKUICard>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) => {
        const { onTripJsonUrl, onWaitingStateLoad, onTripDetailsView, setSelectedTripSegment } = useContext(RoutingResultsContext);
        return <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                children!({
                    ...inputProps,
                    ...viewportProps,
                    onTripJsonUrl,
                    onWaitingStateLoad,
                    onTripDetailsView,
                    setSelectedTripSegment
                })}
        </TKUIViewportUtil>;
    };

export default connect((config: TKUIConfig) => config.TKUIMyBookings, config, Mapper);