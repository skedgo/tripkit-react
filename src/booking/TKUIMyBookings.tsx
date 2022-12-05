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
import TKUIMyBooking from "./TKUIMyBooking";
import TKLoading from "../card/TKLoading";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import Trip from "../model/trip/Trip";
import { ERROR_LOADING_DEEP_LINK } from "../error/TKErrorHelper";
import { TKError } from "../error/TKError";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import Segment from "../model/trip/Segment";

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

let refreshActiveTripInterval: any;

const TKUIMyBookings: React.SFC<IProps> = (props: IProps) => {
    const [bookings, setBookings] = useState<ConfirmedBookingData[] | undefined>(undefined);    
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
    return (
        <TKUICard
            title={t("My.Bookings")}
            onRequestClose={onRequestClose}
            presentation={landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            slideUpOptions={slideUpOptions}
            focusTrap={true}
        >
            {!bookings ?
                <div className={classes.loadingPanel}>
                    <TKLoading />
                </div> :
                bookings.length === 0 ?
                    <div className={classes.noResults} role="status" aria-label={t("No.bookings.yet_n")}>
                        {t("No.bookings.yet_n")}
                    </div> :
                    bookings.map((booking, i) =>
                        <TKUIMyBooking booking={booking}
                            onShowTrip={url => {
                                onWaitingStateLoad(true);
                                onTripJsonUrl(url)
                                    .then((trips) => {
                                        onWaitingStateLoad(false);
                                        onTripDetailsView(true);
                                        if (trips && trips.length > 0) {
                                            const bookingId = booking?.id
                                            const selectedTrip = trips[0];
                                            const selectedSegment = selectedTrip.segments.find(segment =>
                                                segment.booking?.confirmation?.purchase?.id === bookingId);
                                            selectedSegment && setSelectedTripSegment(selectedSegment);
                                        }
                                        onRequestClose(true);
                                    })
                                    .catch((error: Error) => onWaitingStateLoad(false,
                                        new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
                            }}
                            requestRefresh={refreshBookings}
                            key={i}
                        />)
            }
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