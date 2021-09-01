import React, {useState, useEffect, Fragment, useContext} from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {Subtract} from 'utility-types';
import {tKUIMyBookingsDefaultStyle} from "./TKUIMyBookings.css";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import {ConfirmedBookingsResult} from "../model/trip/ConfirmedBookingData";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import TKUIMyBooking from "./TKUIMyBooking";
import TKLoading from "../card/TKLoading";
import {RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import Trip from "../model/trip/Trip";
import {ERROR_LOADING_DEEP_LINK} from "../error/TKErrorHelper";
import {TKError} from "../error/TKError";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose: (closeAll?: boolean) => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    onTripJsonUrl: (tripJsonUrl: string) => Promise<Trip[] | undefined>;
    onWaitingStateLoad: (waiting: boolean, error?: Error) => void;
    onTripDetailsView: (tripDetailsView: boolean) => void;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIMyBookingsDefaultStyle>

export type TKUIMyBookingsProps = IProps;
export type TKUIMyBookingsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMyBookings {...props}/>,
    styles: tKUIMyBookingsDefaultStyle,
    classNamePrefix: "TKUIMyBookings"
};

const TKUIMyBookings: React.SFC<IProps> = (props: IProps) => {
    const [bookings, setBookings] = useState<ConfirmedBookingData[] | undefined>(undefined);
    useEffect(() => {
        TripGoApi.apiCall("booking", NetworkUtil.MethodType.GET, ConfirmedBookingsResult)
            .then((result: ConfirmedBookingsResult) => {
                console.log(result);
                setBookings(result.bookings)
            })
    }, []);
    const {onRequestClose, onTripJsonUrl, onWaitingStateLoad, onTripDetailsView, slideUpOptions, t, landscape, classes} = props;
    return (
        <TKUICard
            title={t("My.Bookings")}
            onRequestClose={onRequestClose}
            presentation={landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            slideUpOptions={slideUpOptions}
        >
            {bookings ? bookings.map((booking, i) =>
                    <TKUIMyBooking booking={booking}
                                   onShowTrip={url => {
                                       onWaitingStateLoad(true);
                                       onTripJsonUrl(url)
                                           .then(() => {
                                               onWaitingStateLoad(false);
                                               onTripDetailsView(true);
                                               onRequestClose(true);
                                           })
                                           .catch((error: Error) => onWaitingStateLoad(false,
                                               new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
                                   }}
                                   key={i}
                    />) :
                <div className={classes.loadingPanel}>
                    <TKLoading/>
                </div>}
        </TKUICard>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) => {
        const {onTripJsonUrl, onWaitingStateLoad, onTripDetailsView} = useContext(RoutingResultsContext);
        return <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                children!({
                    ...inputProps,
                    ...viewportProps,
                    onTripJsonUrl,
                    onWaitingStateLoad,
                    onTripDetailsView
                })}
        </TKUIViewportUtil>;
    };

export default connect((config: TKUIConfig) => config.TKUIMyBookings, config, Mapper);