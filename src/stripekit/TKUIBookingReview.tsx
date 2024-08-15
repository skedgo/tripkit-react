import React from 'react';
import TKUIFromTo from '../booking/TKUIFromTo';
import genStyles from '../css/GenStyle.css';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { black, TKUITheme } from '../jss/TKUITheme';
import BookingReview from '../model/trip/BookingReview';
import PaymentOption from '../model/trip/PaymentOption';
import TransportUtil from '../trip/TransportUtil';
import FormatUtil from '../util/FormatUtil';
import { ReactComponent as IconPassenger } from '../images/ic-booking-passenger.svg';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TKUIViewportUtilProps } from '../util/TKUIResponsiveUtil';

const tKUIBookingReviewStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    review: {
        ...genStyles.flex,
        ...genStyles.column,
        border: '1px solid ' + black(4, theme.isDark),
        marginBottom: '16px',
        ...genStyles.borderRadius(8),
        '&>*:not(:last-child)': {
            ...theme.divider
        }
    },
    reviewHeader: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '16px',
    },
    reviewBody: {
        ...genStyles.flex,
        '&>*': {
            padding: '16px',
            width: '50%'
        },
        '&>*:nth-child(2)': {
            borderLeft: '1px solid ' + black(4, theme.isDark)
        }
    },
    reviewBodyPortrait: {
        ...genStyles.flex,
        ...genStyles.column,
        '&>*': {
            padding: '16px'
        },
        '&>*:nth-child(2)': {
            borderTop: '1px solid ' + black(4, theme.isDark)
        }
    },
    modeIcon: {
        marginRight: '16px'
    },
    modeName: {
        ...genStyles.grow
    },
    tickets: {
        ...genStyles.flex,
        ...genStyles.column
    },
    ticket: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    iconPassenger: {
        marginRight: '16px',
        width: '18px',
        height: '18px',
        '& path': {
            fill: 'none',
            stroke: black(0, theme.isDark)
        }
    },
    ticketValueName: {
        ...genStyles.grow
    },
    ticketPrice: {
        ...theme.textColorGray
    },
    paymentOption: {
        border: '1px solid ' + black(4, theme.isDark),
        padding: '16px',
        ...genStyles.flex,
        ...genStyles.spaceBetween,
        marginBottom: '32px',
        ...genStyles.borderRadius(8)
    },
    totalPrice: {
        ...theme.textWeightSemibold
    },
    buttonsPanel: {
        marginTop: 'auto',
        display: 'flex',
        ...genStyles.justifyEnd,
        '&>*:not(:first-child)': {
            marginLeft: '20px'
        }
    }
})

type IStyle = ReturnType<typeof tKUIBookingReviewStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    reviews: BookingReview[];
    paymentOptions: PaymentOption[];
    onContinue: () => void;
    onClose: () => void;
    viewportProps?: TKUIViewportUtilProps;
    cancelText?: string;
}

const TKUIBookingReview: React.FunctionComponent<IProps> =
    ({ reviews, paymentOptions, cancelText, classes, theme, onContinue, onClose, t, viewportProps }) => {
        return (
            <div className={classes.main}>
                {reviews.map((review, i) => {
                    return (
                        <div className={classes.review} key={i}>
                            <div className={classes.reviewHeader}>
                                <img
                                    src={TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(review.mode), false, theme.isDark)}
                                    className={classes.modeIcon}
                                />
                                <div className={classes.modeName}>
                                    {review.provider?.title}
                                </div>
                                <div>{FormatUtil.toMoney(review.price, { currency: review.currency ? review.currency + " " : undefined, forceDecimals: true, nInCents: true })}</div>
                            </div>
                            <div className={viewportProps?.portrait ? classes.reviewBodyPortrait : classes.reviewBody}>
                                {review.origin && review.destination &&
                                    <TKUIFromTo from={review.origin} to={review.destination} startTime={review.depart} endTime={review.arrive} timezone={review.origin.timezone} />}
                                {review.tickets.length > 0 &&
                                    <div className={classes.tickets}>
                                        {review.tickets.map((ticket, i) => {
                                            return (
                                                <div className={classes.ticket} key={i}>
                                                    <IconPassenger className={classes.iconPassenger} />
                                                    <div className={classes.ticketValueName}>
                                                        {ticket.value + " x " + ticket.name}
                                                    </div>
                                                    <div className={classes.ticketPrice}>
                                                        {FormatUtil.toMoney(ticket.price * ticket.value, { currency: review.currency ? review.currency + " " : undefined, forceDecimals: true, nInCents: true })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>}
                            </div>
                        </div>
                    );
                })}
                <div className={classes.paymentOption}>
                    <div>
                        Total
                    </div>
                    <div className={classes.totalPrice}>
                        {FormatUtil.toMoney(paymentOptions[0]?.fullPrice, { currency: paymentOptions[0]?.currency + " ", forceDecimals: true, nInCents: true })}
                    </div>
                </div>
                <div className={classes.buttonsPanel}>
                    <TKUIButton
                        text={cancelText ?? t("Cancel")}
                        type={TKUIButtonType.SECONDARY}
                        onClick={() => onClose()}
                    />
                    <TKUIButton text={paymentOptions[0]?.paymentMode === "FREE" ? "Confirm Booking" : "Continue to Payment"} onClick={() => onContinue()} name={"confirm-review-btn"} />
                </div>
            </div>
        );
    };


export default withStyles(TKUIBookingReview, tKUIBookingReviewStyle);