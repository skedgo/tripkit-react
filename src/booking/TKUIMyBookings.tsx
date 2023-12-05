import React, { useState, useEffect, useContext, useRef } from 'react';
import { TKUIWithClasses, TKUIWithStyle, overrideClass } from "../jss/StyleHelper";
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
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import Segment from "../model/trip/Segment";
import Tabs from '@material-ui/core/Tabs/Tabs';
import Tab from '@material-ui/core/Tab/Tab';
import TKUIMyBookingGroup from './TKUIMyBookingGroup';
import { ReactComponent as IconRefresh } from '../images/ic-refresh.svg';
import genStyles from '../css/GenStyle.css';
import TKUICardHeader from '../card/TKUICardHeader';

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
    const [countValid, setCountValid] = useState<number | undefined>();
    const [waitingValid, setWaitingValid] = useState<boolean>(false);
    const [bookingsValid, setBookingsValid] = useState<ConfirmedBookingData[] | undefined>(undefined);
    const [countExpired, setCountExpired] = useState<number | undefined>();
    const [waitingExpired, setWaitingExpired] = useState<boolean>(false);
    const [bookingsExpired, setBookingsExpired] = useState<ConfirmedBookingData[] | undefined>(undefined);
    function requestBookings({ valid = true, start = 1, max = 5 }: { valid?: boolean, start?: number, max?: number } = {}): Promise<ConfirmedBookingsResult> {
        return TripGoApi.apiCallT(`booking?valid=${valid}&start=${start}&max=${max}`, NetworkUtil.MethodType.GET, ConfirmedBookingsResult);
    }
    async function requestMoreBookings({ valid = true }: { valid?: boolean } = {}) {
        if (valid) {
            if (waitingValid || (bookingsValid && countValid && bookingsValid.length >= countValid)) {
                return;
            }
            setWaitingValid(true);
            const { bookings, count } = await requestBookings({ start: (bookingsValid ?? []).length + 1 });
            if (countValid === undefined) {
                setCountValid(count);
            }
            setBookingsValid(bookingsValid => (bookingsValid ?? []).concat(bookings ?? []));
            setWaitingValid(false);
        } else {
            if (waitingExpired || (bookingsExpired && countExpired && bookingsExpired.length >= countExpired)) {
                return;
            }
            setWaitingExpired(true);
            const { bookings, count } = await requestBookings({ start: (bookingsExpired ?? []).length + 1, valid: false });
            if (countExpired === undefined) {
                setCountExpired(count);
            }
            setBookingsExpired(bookingsExpired => (bookingsExpired ?? []).concat(bookings ?? []));
            setWaitingExpired(false);
        }
    }

    useEffect(() => {
        requestMoreBookings();
        requestMoreBookings({ valid: false });
    }, []);

    function refreshBookings({ valid = true, silent = true }: { valid?: boolean, silent?: boolean } = {}): Promise<boolean> {
        const bookings = valid ? bookingsValid : bookingsExpired;
        const setBookings = valid ? setBookingsValid : setBookingsExpired;
        const waitingBookings = valid ? waitingValid : waitingExpired;
        if (waitingBookings || bookings === undefined) {
            return Promise.resolve(false);
        }
        const setWaiting = valid ? setWaitingValid : setWaitingExpired;
        if (!silent) {
            setBookings(undefined);
            setCountValid(undefined);
            setWaiting(true);
        }
        return requestBookings({ valid, max: silent ? (bookings ?? []).length + 1 : undefined })
            .then((result: ConfirmedBookingsResult) => {
                setBookings(result.bookings);
                setCountValid(result.count);
                return true;
            })
            .catch(e => {
                console.log(e);
                return false;
            })
            .finally(() => {
                !silent && setWaiting(false);
            })
    }

    useEffect(() => {
        const refreshInterval = setInterval(refreshBookings, 60000);
        return () => {
            if (refreshInterval) {
                clearTimeout(refreshInterval);
            }
        }
    }, [bookingsValid, bookingsExpired, setBookingsValid, setBookingsExpired, waitingValid, waitingExpired]);

    const resultsRef = useRef<HTMLDivElement>(null);
    function onScroll(e) {
        const scrollPanel = e.target;
        if (scrollPanel.scrollTop + scrollPanel.clientHeight > scrollPanel.scrollHeight - 30) {
            requestMoreBookings({ valid: section === Sections.Valid });
        }
    }
    const { onRequestClose, onTripJsonUrl, onWaitingStateLoad, onTripDetailsView, setSelectedTripSegment, slideUpOptions, t, landscape, classes } = props;
    const [section, setSection] = useState<Sections>(Sections.Valid);
    const tabs =
        <Tabs value={section} onChange={(_event, newSection) => setSection(newSection)} aria-label="text formatting">
            <Tab value={Sections.Valid} label={t(Sections.Valid)} disableFocusRipple disableTouchRipple />
            <Tab value={Sections.Expired} label={t(Sections.Expired)} disableFocusRipple disableTouchRipple />
        </Tabs>;
    const tabBookings = section === Sections.Valid ? bookingsValid : bookingsExpired;
    const waiting = section === Sections.Valid ? waitingValid : waitingExpired;
    return (
        <TKUICard
            title={
                <div className={classes.title}>
                    {t("My.Bookings")}
                    <button className={classes.refresh}
                        onClick={() => {
                            if (resultsRef.current) {
                                resultsRef.current.scrollTop = 0;
                            };
                            refreshBookings({ silent: false });
                            refreshBookings({ valid: false, silent: false });
                        }}>
                        <IconRefresh />
                    </button>
                </div>}
            onRequestClose={onRequestClose}
            presentation={landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            slideUpOptions={slideUpOptions}
            focusTrap={true}
            renderHeader={props =>
                <TKUICardHeader {...props}
                    styles={{
                        title: overrideClass({
                            ...genStyles.grow
                        })
                    }}
                />
            }
        >
            <div className={classes.main}>
                <div className={classes.tabs}>
                    {tabs}
                </div>
                {!tabBookings ?
                    <div className={classes.loadingPanel}>
                        <TKLoading />
                    </div> :
                    tabBookings!.length === 0 ?
                        <div className={classes.noResults} role="status" aria-label={t("No.bookings.yet_n")}>
                            {t("No.bookings.yet_n")}
                        </div> :
                        <div className={classes.results} onScroll={onScroll} ref={resultsRef}>
                            {tabBookings!.map((booking, i) =>
                                <div className={classes.bookingWrapper} key={booking.id}>
                                    <TKUIMyBookingGroup
                                        booking={booking}
                                    />
                                </div>)}
                            {waiting ?
                                <div className={classes.loadingMore}>
                                    <TKLoading />
                                </div> : null}
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