import React, {useState, useEffect, Fragment, useContext} from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {Subtract} from 'utility-types';
import {tKUIHomeCardDefaultStyle} from "./TKUIHomeCard.css";
import TKUICard from "../card/TKUICard";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import {RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import Trip from "../model/trip/Trip";
import {IAccountContext, SignInStatus, TKAccountContext} from "../account/TKAccountProvider";
import TKUIActiveTrip from "./TKUIActiveTrip";
import Util from "../util/Util";
import {ERROR_LOADING_DEEP_LINK} from "../error/TKErrorHelper";
import {TKError} from "../error/TKError";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onMyBookings: () => void;
}

interface IConsumedProps extends TKUIViewportUtilProps, IAccountContext {
    onTripJsonUrl: (tripJsonUrl: string) => Promise<Trip[] | undefined>;
    onWaitingStateLoad: (waiting: boolean, error?: Error) => void;
    onTripDetailsView: (tripDetailsView: boolean) => void;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIHomeCardDefaultStyle>

export type TKUIHomeCardProps = IProps;
export type TKUIHomeCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIHomeCard {...props}/>,
    styles: tKUIHomeCardDefaultStyle,
    classNamePrefix: "TKUIHomeCard"
};

const TKUIHomeCard: React.SFC<IProps> = (props: IProps) => {
    const {onTripJsonUrl, onWaitingStateLoad, onTripDetailsView, onMyBookings, t, landscape, status, classes} = props;
    const [activeTrip, setActiveTrip] = useState<ConfirmedBookingData | undefined | null>(undefined);
    useEffect(() => {
        if (status === SignInStatus.signedIn) {
            TripGoApi.apiCallT("booking/v2/active", NetworkUtil.MethodType.GET, ConfirmedBookingData)
                .then((result: ConfirmedBookingData) => {
                    setActiveTrip(Util.stringify(result) === Util.stringify(new ConfirmedBookingData()) ? null : result)
                })
        }
    }, [status]);
    if (status !== SignInStatus.signedIn) {
        return null;
    }
    return (
        <TKUICard>
            <div className={classes.main}>
                <TKUIActiveTrip
                    activeTrip={activeTrip}
                    onShowTrip={() => {
                        const url = activeTrip?.trips?.[0]!;
                        onWaitingStateLoad(true);
                        onTripJsonUrl(url)
                            .then(() => {
                                onWaitingStateLoad(false);
                                onTripDetailsView(true);
                            })
                            .catch((error: Error) => onWaitingStateLoad(false,
                                new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
                    }}
                    onMyBookings={onMyBookings}
                />
            </div>
        </TKUICard>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) => {
        const {onTripJsonUrl, onWaitingStateLoad, onTripDetailsView} = useContext(RoutingResultsContext);
        const accountContext = useContext(TKAccountContext);
        return <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                children!({
                    ...inputProps,
                    ...viewportProps,
                    ...accountContext,
                    onTripJsonUrl,
                    onWaitingStateLoad,
                    onTripDetailsView
                })}
        </TKUIViewportUtil>;
    };

export default connect((config: TKUIConfig) => config.TKUIHomeCard, config, Mapper);