import React, { useState, useEffect, useContext } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { Subtract } from 'utility-types';
import { tKUIHomeCardDefaultStyle } from "./TKUIHomeCard.css";
import TKUICard from "../card/TKUICard";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import Trip from "../model/trip/Trip";
import { IAccountContext, SignInStatus, TKAccountContext } from "../account/TKAccountContext";
import TKUIActiveTrip from "./TKUIActiveTrip";
import Util from "../util/Util";
import { ERROR_LOADING_DEEP_LINK } from "../error/TKErrorHelper";
import { TKError } from "../error/TKError";
import Segment from "../model/trip/Segment";
import TKUISubscription from './TKUISubscription';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onMyBookings: () => void;
}

interface IConsumedProps extends TKUIViewportUtilProps, IAccountContext {
    onTripJsonUrl: (tripJsonUrl: string) => Promise<Trip[] | undefined>;
    onWaitingStateLoad: (waiting: boolean, error?: Error) => void;
    onTripDetailsView: (tripDetailsView: boolean) => void;
    setSelectedTripSegment: (segment?: Segment) => void;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIHomeCardDefaultStyle>

export type TKUIHomeCardProps = IProps;
export type TKUIHomeCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIHomeCard {...props} />,
    styles: tKUIHomeCardDefaultStyle,
    classNamePrefix: "TKUIHomeCard"
};

let refreshActiveTripInterval: any;

const TKUIHomeCard: React.FunctionComponent<IProps> = (props: IProps) => {
    const { onTripJsonUrl, onWaitingStateLoad, onTripDetailsView, setSelectedTripSegment, onMyBookings, userAccount, t, landscape, status, classes } = props;
    const [activeTrip, setActiveTrip] = useState<ConfirmedBookingData | undefined | null>(undefined);
    const [waitingForActiveTrip, setWaitingForActiveTrip] = useState<boolean>(false);

    const refreshActiveTrip = () => {
        // Split the refresh implementation into this function + the useEffect below to ensure the api all is done after the 
        // setWaitingForActiveTrip(true) took effect, avoiding race conditions that may cause multiple "simultaneous" api calls.
        if (waitingForActiveTrip) {
            return;
        }
        setWaitingForActiveTrip(true);
    };
    useEffect(() => {
        if (waitingForActiveTrip) {
            TripGoApi.apiCallT("booking/v2/active", NetworkUtil.MethodType.GET, ConfirmedBookingData)
                .then((result: ConfirmedBookingData) => {
                    setActiveTrip(Util.stringify(result) === Util.stringify(new ConfirmedBookingData()) ? null : result);
                })
                .catch(e => console.log(e))
                .finally(() => setWaitingForActiveTrip(false));
        }
    }, [waitingForActiveTrip]);
    useEffect(() => {
        if (status === SignInStatus.signedIn) {
            refreshActiveTrip();
            refreshActiveTripInterval = setInterval(() => refreshActiveTrip(), 60000);
        }
        return () => {
            if (refreshActiveTripInterval) {
                clearInterval(refreshActiveTripInterval);
            }
        }
    }, [status]);
    if (status !== SignInStatus.signedIn) {
        return null;
    }
    // Hide subscription component if waiting for user or no bundle
    const showSubscription = userAccount?.currentBundle || userAccount?.futureBundle;
    return (
        <TKUICard>
            <div className={classes.main}>
                <TKUIActiveTrip
                    activeTrip={activeTrip}
                    onShowTrip={url => {
                        onWaitingStateLoad(true);
                        onTripJsonUrl(url)
                            .then(trips => {
                                onWaitingStateLoad(false);
                                onTripDetailsView(true);
                                if (trips && trips.length > 0) {
                                    const bookingId = activeTrip?.id
                                    const selectedTrip = trips[0];
                                    const selectedSegment = selectedTrip.segments.find(segment =>
                                        segment.booking?.confirmation?.purchase?.id === bookingId);
                                    selectedSegment && setSelectedTripSegment(selectedSegment);
                                }
                            })
                            .catch((error: Error) => onWaitingStateLoad(false,
                                new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
                    }}
                    onMyBookings={onMyBookings}
                />
                {showSubscription &&
                    <TKUISubscription />}
            </div>
        </TKUICard>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) => {
        const { onTripJsonUrl, onWaitingStateLoad, onTripDetailsView, setSelectedTripSegment } = useContext(RoutingResultsContext);
        const accountContext = useContext(TKAccountContext);
        return <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                children!({
                    ...inputProps,
                    ...viewportProps,
                    ...accountContext,
                    onTripJsonUrl,
                    onWaitingStateLoad,
                    onTripDetailsView,
                    setSelectedTripSegment
                })}
        </TKUIViewportUtil>;
    };

export default connect((config: TKUIConfig) => config.TKUIHomeCard, config, Mapper);