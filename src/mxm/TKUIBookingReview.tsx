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
        padding: '16px',
        marginBottom: '16px',
        '&>*:not(:last-child)': {
            ...theme.divider,
            paddingBottom: '10px',
            marginBottom: '10px'
        }
    },
    modeAndPrice: {
        ...genStyles.flex,
        ...genStyles.alignCenter
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
        marginBottom: '32px'
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
    onPayOption: (option: PaymentOption) => void;
    onClose: () => void;
}

const TKUIBookingReview: React.FunctionComponent<IProps> =
    ({ reviews, paymentOptions, classes, theme, onPayOption, onClose, t }) => {
        return (
            <div className={classes.main}>
                {reviews.map(review => {
                    return (
                        <div className={classes.review}>
                            <div className={classes.modeAndPrice}>
                                <img
                                    src={TransportUtil.getTransportIconLocal(TransportUtil.modeIdToIconS(review.mode), false, theme.isDark)}
                                    className={classes.modeIcon}
                                />
                                <div className={classes.modeName}>
                                    {review.provider?.title}
                                </div>
                                <div>{FormatUtil.toMoney(review.price, { currency: review.currency + " ", forceDecimals: true })}</div>
                            </div>
                            <div className={classes.tickets}>
                                {review.tickets.map(ticket => {
                                    return (
                                        <div className={classes.ticket}>
                                            <IconPassenger className={classes.iconPassenger} />
                                            <div className={classes.ticketValueName}>
                                                {ticket.value + " x " + ticket.name}
                                            </div>
                                            <div className={classes.ticketPrice}>
                                                {FormatUtil.toMoney(ticket.price, { currency: review.currency + " ", forceDecimals: true, nInCents: true })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {review.origin && review.destination &&
                                <TKUIFromTo from={review.origin} to={review.destination} />}
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
                        text={t("Cancel")}
                        type={TKUIButtonType.SECONDARY}
                        onClick={() => onClose()}
                    />
                    <TKUIButton text={"Continue to Payment"} onClick={() => onPayOption(paymentOptions[0])} />
                </div>
            </div>
        );
    };


export default withStyles(TKUIBookingReview, tKUIBookingReviewStyle);