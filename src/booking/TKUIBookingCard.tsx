import React, { Key, useContext, useEffect, useState } from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIBookingCardDefaultStyle } from "./TKUIBookingCard.css";
import Trip from '../model/trip/Trip';
import TKUICard, { CardPresentation, TKUICardClientProps } from '../card/TKUICard';
import TripGoApi from '../api/TripGoApi';
import BookingInfo, { AvailableProviderOption, ProviderOptionsForm } from '../model/trip/BookingInfo';
import UIUtil from '../util/UIUtil';
import TKUIBookingForm from './TKUIBookingForm';
import BookingReview from '../model/trip/BookingReview';
import TKLoading from '../card/TKLoading';
import TKUIBookingReview from '../stripekit/TKUIBookingReview';
import { useResponsiveUtil } from '../util/TKUIResponsiveUtil';
import Features from '../env/Features';
import { TKUIConfigContext } from '../config/TKUIConfigProvider';
import TKUIBookingDetails from './TKUIBookingDetails';
import TKUICardHeader from '../card/TKUICardHeader';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { RoutingResultsContext } from '../trip-planner/RoutingResultsProvider';
import { BookingPaymentForm } from '../model/payment/BookingPaymentForm';
import TKUIBookingProviderOptions from './TKUIBookingProviderOptions';
import TicketOption from '../model/trip/TicketOption';
import TKUIProviderTicketsForm from '../stripekit/TKUIProviderTicketsForm';
import Util from '../util/Util';

interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<TKUICardClientProps, "onRequestClose"> {
    trip: Trip; // The component is controlled w.r.t. trip prop.
    onRequestTripRefresh: (refreshURLForSourceObject?: string) => Promise<Trip | undefined>;    // This prop is called when the booking was successful, to indicate the client that the trip needs to be refreshed
    onSuccess?: (bookingTripUpdateURL: string) => void; // ***TODO:*** Remove?
    onShowTrip?: (trip: Trip) => void;
}

export type TKUIBookingCardClientProps = IClientProps & { key?: Key };

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingCardDefaultStyle>

export type TKUIBookingCardProps = IProps;
export type TKUIBookingCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingCard {...props} />,
    styles: tKUIBookingCardDefaultStyle,
    classNamePrefix: "TKUIBookingCard"
};

type Screens = "BOOKING" | "PROVIDER_OPTIONS" | "TICKETS" | "REVIEW" | "PAYMENT" | "DETAILS";

function screenTitle(screen: Screens): string {
    switch (screen) {
        case "BOOKING":
            return "Add booking details";
        case "PROVIDER_OPTIONS":
            return "Select provider";
        case "TICKETS":
            return "Select Tickets";
        case "REVIEW":
            return "Review booking";
        case "PAYMENT":
            return "Checkout";
        case "DETAILS":
            return "Booking details";
    }
}

function screenCloseButton(screen: Screens): string {
    switch (screen) {
        case "BOOKING":
            return "Cancel";
        case "PROVIDER_OPTIONS":
        case "TICKETS":
        case "REVIEW":
        case "PAYMENT":
            return "Back";
        case "DETAILS":
            return "Done";
    }
}

// ***TODO:*** REMOVE
if (process.env.NODE_ENV === 'development') {
    Features.instance.realtimeEnabled = false;
}

const TKUIBookingCard: React.FunctionComponent<IProps> = (props: IProps) => {
    const { trip, onRequestTripRefresh, onSuccess, onRequestClose, classes, onShowTrip } = props;
    const booking = trip.segments.find(segment => segment.booking)!.booking!;
    console.assert(!!booking);
    const [waiting, setWaiting] = useState<boolean>(false);
    const viewportProps = useResponsiveUtil();
    const config = useContext(TKUIConfigContext);
    const [screensStack, setScreensStack] = useState<Screens[]>([
        booking.confirmation ? "DETAILS" : "BOOKING"
    ]);

    function screenRightButtonProps(screen: Screens): { text: string, onClick: () => void } | undefined {
        switch (screen) {
            case "DETAILS":
                return onShowTrip ? { text: "Show Trip", onClick: () => { onShowTrip(trip) } } : undefined;
            default:
                return undefined;
        }
    }

    useEffect(() => {
        if (booking.confirmation) {
            pushScreen("DETAILS");
            setWaiting(false);
        }
    }, [booking.confirmation]);

    // BOOKING screen data
    const [bookingForm, setBookingForm] = useState<BookingInfo | undefined>(undefined);

    // PROVIDER_OPTIONS screens data
    const [providerOptionsForm, setProviderOptionsForm] = useState<ProviderOptionsForm | undefined>(undefined);
    const [selectedProviderIndex, setSelectedProviderIndex] = useState<number | undefined>(undefined);
    const selectedProvider: AvailableProviderOption | undefined = selectedProviderIndex !== undefined ? providerOptionsForm?.availableList[selectedProviderIndex!] : undefined;

    // TICKETS screens data
    function isSingleFareAndSingleTicket(provider: AvailableProviderOption): boolean {
        return provider.fares?.length === 1 && provider.fares[0].max === 1;
    }
    async function onSubmitTickets(selectedProvider: AvailableProviderOption) {
        setWaiting(true);
        try {
            const bookingResult = await TripGoApi.submitProviderAndFares(selectedProvider!);
            setWaiting(false);
            setBookingResult(bookingResult);
            const { reviews } = bookingResult;
            if (reviews) {
                // Add timezone to review's origin and destination since it's needed to pass it to TKUIFromTo.
                reviews.forEach((review: BookingReview) => {
                    const timezone = trip!.segments[0].from.timezone;
                    if (review.origin) {
                        review.origin.timezone = timezone;
                    }
                    if (review.destination) {
                        review.destination.timezone = timezone;
                    }
                })
                pushScreen("REVIEW");
            }
        } catch (error) {
            UIUtil.errorMsg(error as Error);
        } finally {
            setWaiting?.(false);
        }
    }

    // REVIEW and PAYMENT screens data
    const [bookingResult, setBookingResult] = useState<BookingPaymentForm | undefined>(undefined);

    useEffect(() => {
        if (booking.confirmation) {
            return;
        }
        const bookingInfosUrl = booking.quickBookingsUrl!;
        setWaiting(true);
        if (process.env.NODE_ENV === 'development') {
            // setMockData();
            // setMockData2();
            // return;
        }
        TripGoApi.requestBookingOptions(bookingInfosUrl)
            .then(bookingInfos => {
                pushScreen("BOOKING");
                setBookingForm(bookingInfos[0]);
            })
            .catch(e => UIUtil.errorMsg(e, { onClose: onRequestClose }))
            .finally(() => setWaiting(false));
    }, []);

    function pushScreen(screen: Screens) {
        setScreensStack(screensStack => [screen].concat(screensStack));
    }

    function popScreen() {
        setScreensStack(screensStack => screensStack.slice(1));
    }

    function topScreen(): Screens {
        return screensStack[0];
    }

    // Important: this requires enabling mock of /pay request
    async function setMockData() {
        Features.instance.realtimeEnabled = false;
        setScreensStack([]);
        setBookingForm(require("../mock/data/booking/quick.json")
            .map(infoJson => TripGoApi.deserializeBookingInfo(infoJson))[0]);
        setWaiting(false);
        setScreensStack(["BOOKING"]);
        setBookingResult(TripGoApi.deserializeBookingResult(require("../mock/data/booking/quick_1.json")));
        setScreensStack(["REVIEW", "BOOKING"]);
        // setScreensStack(["PAYMENT", "REVIEW", "BOOKING", "TRIPS", "QUERY"]);            
    }

    async function setMockData2() {
        Features.instance.realtimeEnabled = false;
        setScreensStack([]);
        setBookingForm(require("../mock/data/provider_mobility_options/quick.json")
            .map(infoJson => TripGoApi.deserializeBookingInfo(infoJson))[0]);
        setWaiting(false);
        setScreensStack(["BOOKING"]);
        // const providerOptionsForm = TripGoApi.deserializeProviderOptions(require("../mock/data/provider_mobility_options/quick_1.json"));
        const providerOptionsForm = TripGoApi.deserializeProviderOptions(require("../mock/data/provider_mobility_options/quick_1_single_available.json"));
        setProviderOptionsForm(providerOptionsForm);
        setScreensStack(["PROVIDER_OPTIONS", "BOOKING"]);
        // setScreensStack(["PAYMENT", "REVIEW", "BOOKING", "TRIPS", "QUERY"]);            
    }

    function handleRequestClose() {
        if (topScreen() === "BOOKING" || topScreen() === "DETAILS") {
            onRequestClose?.();
        } else {
            popScreen();
        }
    }

    const screenRightBtnProps = screenRightButtonProps(topScreen());

    return (
        <TKUICard
            title={screenTitle(topScreen())}
            presentation={viewportProps.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            slideUpOptions={{ draggable: false }}
            focusTrap={true}
            renderHeader={props =>
                <TKUICardHeader {...props}
                    renderLeft={<TKUIButton text={screenCloseButton(topScreen())} type={TKUIButtonType.PRIMARY_LINK} onClick={handleRequestClose} />}
                    renderRight={screenRightBtnProps && <TKUIButton type={TKUIButtonType.PRIMARY_LINK} {...screenRightBtnProps} />}
                />}
            styles={{
                modalContent: overrideClass({
                    width: '700px'
                }),
                main: overrideClass({
                    position: 'relative'    // Needed to reander a floating footer (e.g. in TKUIBookingForm)
                })
            }}
        >
            <div className={classes.main}>
                {waiting &&
                    <div className={classes.loadingPanel}>
                        <TKLoading />
                    </div>}
                {topScreen() === "BOOKING" && bookingForm &&
                    <TKUIBookingForm
                        value={bookingForm}
                        onChange={setBookingForm}
                        trip={trip!}
                        onSubmit={async () => {
                            setWaiting(true);
                            if (bookingForm.bookingResponseType === "OPTIONS") {
                                try {
                                    const providerOptions = await TripGoApi.submitBookingOptionToGetProviderOptions(bookingForm!);
                                    setWaiting(false);
                                    setProviderOptionsForm(providerOptions);
                                    // Only a single available option and no unavailable ones => Straight to ticket selection
                                    if (providerOptions.availableList.length === 1 && providerOptions.unavailableList.length === 0 &&
                                        // Except that single provider option has single fare and single ticket, in which case we prefer
                                        // to show the provider option and skip ticket selection.
                                        !(isSingleFareAndSingleTicket(providerOptions.availableList[0]))) {
                                        setSelectedProviderIndex(0);
                                        pushScreen("TICKETS");
                                    } else {
                                        pushScreen("PROVIDER_OPTIONS");
                                    }
                                } catch (error) {
                                    UIUtil.errorMsg(error as Error);
                                } finally {
                                    setWaiting?.(false);
                                }
                            } else if (bookingForm.bookingResponseType === "REVIEW") {
                                try {
                                    const bookingResult = await TripGoApi.submitBookingOption(bookingForm!);
                                    setWaiting(false);
                                    setBookingResult(bookingResult);
                                    const { reviews } = bookingResult;
                                    if (reviews) {
                                        // Add timezone to review's origin and destination since it's needed to pass it to TKUIFromTo.
                                        reviews.forEach((review: BookingReview) => {
                                            const timezone = trip!.segments[0].from.timezone;
                                            if (review.origin) {
                                                review.origin.timezone = timezone;
                                            }
                                            if (review.destination) {
                                                review.destination.timezone = timezone;
                                            }
                                        })
                                        pushScreen("REVIEW");
                                    }
                                } catch (error) {
                                    UIUtil.errorMsg(error as Error);
                                } finally {
                                    setWaiting?.(false);
                                }
                            } else if (bookingForm.bookingResponseType === "DIRECT") {
                                try {
                                    const { updateURL } = await TripGoApi.submitBookingOptionAndFinish(bookingForm!)
                                    await onRequestTripRefresh(updateURL);   // After trip refresh, if booking.confirmation is defined, then DETAILS screen will be shown and setWaiting(false) will be called.
                                } catch (error) {
                                    UIUtil.errorMsg(error as Error);
                                    setWaiting?.(false);
                                }
                            }
                        }}
                    />}
                {topScreen() === "PROVIDER_OPTIONS" &&
                    <TKUIBookingProviderOptions
                        form={providerOptionsForm!}
                        onProviderSelected={(value: AvailableProviderOption) => {
                            setSelectedProviderIndex(providerOptionsForm!.availableList.indexOf(value));
                            if (isSingleFareAndSingleTicket(value)) {
                                onSubmitTickets(value);
                            } else {
                                pushScreen("TICKETS");
                            }
                        }}
                    />}
                {topScreen() === "TICKETS" &&
                    <TKUIProviderTicketsForm
                        provider={selectedProvider!}
                        onChange={(tickets: TicketOption[]) => {
                            const providerOptionsFormUpdate = Util.deepClone(providerOptionsForm!);
                            providerOptionsFormUpdate.availableList[providerOptionsForm!.availableList.indexOf(selectedProvider!)!].fares = tickets;
                            setProviderOptionsForm(providerOptionsFormUpdate);
                        }}
                        onSubmit={() => onSubmitTickets(selectedProvider!)}
                    />}
                {topScreen() === "REVIEW" &&
                    <TKUIBookingReview
                        reviews={bookingResult!.reviews!}
                        paymentOptions={bookingResult!.paymentOptions!}
                        onContinue={async () => {
                            if (bookingResult!.paymentOptions?.[0]?.paymentMode === "FREE") {
                                const payOption = bookingResult!.paymentOptions?.[0];
                                setWaiting(true);
                                try {
                                    const { updateURL } = await TripGoApi.apiCallUrl(payOption.url, payOption.method);
                                    await onRequestTripRefresh(updateURL);   // After trip refresh, if booking.confirmation is defined, then DETAILS screen will be shown and setWaiting(false) will be called.
                                } catch (error) {
                                    UIUtil.errorMsg(error as Error);
                                    setWaiting?.(false);
                                }
                                return;
                            }
                            pushScreen("PAYMENT");
                        }}
                        viewportProps={{ landscape: false, portrait: true }}    // Force portrait mode
                        styles={{
                            main: overrideClass({
                                padding: '16px'
                            })
                        }}
                    />}
                {topScreen() === "PAYMENT" &&
                    config.payment?.renderPaymentCard({
                        bookingPaymentForm: bookingResult!,
                        setWaiting,
                        // Rename to onPaymentDone?
                        onSubmit: async ({ updateURL }) => {
                            setWaiting?.(true);
                            try {
                                await onRequestTripRefresh(updateURL);   // After trip refresh, if booking.confirmation is defined, then DETAILS screen will be shown and setWaiting(false) will be called.
                            } catch (error) {
                                UIUtil.errorMsg(error as Error);
                                setWaiting?.(false);
                            }
                        },
                        styles: {
                            main: overrideClass({
                                padding: '16px'
                            })
                        }
                    })}
                {topScreen() === "DETAILS" &&
                    <TKUIBookingDetails
                        trip={trip}
                    />}
            </div>
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

const Consumer: React.FunctionComponent<{ children: (props: Pick<IClientProps, "trip" | "onRequestTripRefresh">) => React.ReactNode }> = ({ children }) => {
    const { selectedTrip, refreshSelectedTrip } = useContext(RoutingResultsContext);
    return (
        <>
            {children({
                trip: selectedTrip!,
                onRequestTripRefresh: async (refreshURLForSourceObject?: string) => {
                    // Workaround in case the last booking hit returns an updateURL, which may be different from the one in the trip.
                    if (refreshURLForSourceObject) {
                        selectedTrip!.updateURL = refreshURLForSourceObject;
                    }
                    return refreshSelectedTrip();
                }
            })}
        </>
    );
}

export const TKUIBookingCardHelpers = {
    TKStateProps: Consumer
}