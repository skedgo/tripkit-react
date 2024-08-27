import React, { useEffect, useState } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIBookingCardDefaultStyle } from "./TKUIBookingCard.css";
import Segment from '../model/trip/Segment';
import Trip from '../model/trip/Trip';
import TKUICard, { CardPresentation } from '../card/TKUICard';
import TripGoApi from '../api/TripGoApi';
import BookingInfo from '../model/trip/BookingInfo';
import UIUtil from '../util/UIUtil';
import TKUIBookingForm from './TKUIBookingForm';
import BookingReview from '../model/trip/BookingReview';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    refreshSelectedTrip: () => Promise<boolean>;
    onSuccess?: (bookingTripUpdateURL: string) => void;
    trip?: Trip;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingCardDefaultStyle>

export type TKUIBookingCardProps = IProps;
export type TKUIBookingCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingCard {...props} />,
    styles: tKUIBookingCardDefaultStyle,
    classNamePrefix: "TKUIBookingCard"
};

const TKUIBookingCard: React.FunctionComponent<IProps> = (props: IProps) => {

    const { segment, refreshSelectedTrip, onSuccess, trip } = props;
    const booking = segment.booking!;
    const [waiting, setWaiting] = useState<boolean>(false);

    type Screens = "BOOKING" | "REVIEW" | "PAYMENT" | "DETAILS";
    const [screensStack, setScreensStack] = useState<Screens[]>([
        booking.confirmation ? "DETAILS" : "BOOKING"
    ]);

    // BOOKING screen
    const [bookingForm, setBookingForm] = useState<BookingInfo | undefined>(undefined);


    useEffect(() => {
        const bookingInfosUrl = booking.quickBookingsUrl!;
        TripGoApi.requestBookingOptions(bookingInfosUrl)
            .then(bookingInfos => {
                pushScreen("BOOKING");
                setBookingForm(bookingInfos[0]);
                setWaiting(false);
            })
            .catch(UIUtil.errorMsg)
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

    return (
        <TKUICard
            title={"Add booking details"}   // Define title based on screen
            presentation={CardPresentation.MODAL}
            focusTrap={false}
        >
            <div>
                {topScreen() === "BOOKING" && bookingForm &&
                    <TKUIBookingForm
                        value={bookingForm}
                        onChange={setBookingForm}
                        trip={trip!}
                        onSubmit={() => {
                            setWaiting(true);
                            TripGoApi.submitBookingOption(bookingForm!).then(bookingResult => {
                                setWaiting(false);
                                // setBookingResult(bookingResult);
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
                                } else {
                                    // bookingResult will be something like:
                                    // {"refreshURLForSourceObject":"https://galaxies.skedgo.com/lab/beta/satapp/booking/v1/b963c582-bcb1-416b-aaad-ea3d03a01a8d/update?bsb=1&psb=1","action":{"done":true}}                       
                                    // onRequestClose?.(true, { ...bookingResult, userId: user!.id });
                                }
                            })
                                .catch(UIUtil.errorMsg)
                                .finally(() => setWaiting(false));
                        }}
                        onRequestClose={() => {
                            popScreen();
                        }}
                    />}
            </div>
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));