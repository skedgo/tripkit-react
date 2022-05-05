import React, { Fragment, useEffect, useState } from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { tKUIStripePaymentCardDefaultStyle } from "./TKUIStripePaymentCard.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import TripGoApi from '../api/TripGoApi';
import NetworkUtil from '../util/NetworkUtil';
import PaymentOption from '../model/trip/PaymentOption';
import TKLoading from '../card/TKLoading';
import UIUtil from '../util/UIUtil';
import { TKError } from '../error/TKError';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TranslationFunction } from '../i18n/TKI18nProvider';
import FormatUtil from '../util/FormatUtil';
import { BookingConfirmation } from '../model/trip/BookingInfo';
import TKUIRow from '../options/TKUIRow';


type IStyle = ReturnType<typeof tKUIStripePaymentCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title: string;
    initPaymentUrl: string;
    onRequestClose: (success: boolean) => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIStripePaymentCardProps = IProps;
export type TKUIStripePaymentCardStyle = IStyle;
export type TKUIStripePaymentCardClientProps = IClientProps;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIStripePaymentCard {...props} />,
    styles: tKUIStripePaymentCardDefaultStyle,
    classNamePrefix: "TKUIStripePaymentCard"
};

const stripePromise = loadStripe('pk_test_pcFz1IPSJed68tco8okyFcaw');

const CheckoutForm: React.FunctionComponent<{ onSuccess: () => void, setWaiting: (waiting: boolean) => void, t: TranslationFunction }> =
    ({ onSuccess, setWaiting, t }) => {
        const stripe = useStripe();
        const elements = useElements();

        const handleSubmit = async (event) => {
            // We don't want to let default form submission happen here,
            // which would refresh the page.
            event.preventDefault();
            if (!stripe || !elements) {
                // Stripe.js has not yet loaded.
                // Make sure to disable form submission until Stripe.js has loaded.
                return;
            }
            setWaiting(true);   // The setWaiting(false) is called by the parent component, after taking additional actions on success.
            const result = await stripe.confirmPayment({
                //`Elements` instance that was used to create the Payment Element
                elements,
                confirmParams: {
                    return_url: "https://example.com/order/123/complete",
                },
                redirect: 'if_required'
            });
            if (result.error) {
                // Show error to your customer (for example, payment details incomplete)
                console.log(result.error.message);
                setWaiting(false);
            } else {
                onSuccess();
            }
        };

        return (
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <TKUIButton
                        text={t("Confirm")}
                        type={TKUIButtonType.PRIMARY}
                        disabled={!stripe}
                    />
                </div>
            </form>
        )
    }

const TKUIStripePaymentCard: React.FunctionComponent<IProps> = ({ onRequestClose, title, initPaymentUrl, classes, injectedStyles, t }) => {
    const [paymentOption, setPaymentOption] = useState<PaymentOption | undefined>(undefined);
    const [confirmation, setConfirmation] = useState<BookingConfirmation | undefined>(undefined);
    const [paymentIntentSecret, setPaymentIntentSecret] = useState<string | undefined>(undefined);    
    const [paymentIntent, setPaymentIntent] = useState<string | undefined>(undefined);
    const [waiting, setWaiting] = useState<boolean>(false);
    // const [stripePromise, setStripePromise] = useState<any>(false);
    useEffect(() => {
        setWaiting(true);
        TripGoApi.apiCallUrl(initPaymentUrl, NetworkUtil.MethodType.GET)
            .then(bookingForm => {
                const firstPaymentOption = bookingForm.paymentOptions?.[0];
                if (firstPaymentOption) {
                    const initPaymentUrl = firstPaymentOption.url;
                    return TripGoApi.apiCallUrl(initPaymentUrl, NetworkUtil.MethodType.GET)
                        .then(({ clientSecret, paymentIntentID }) => {
                            if (!clientSecret || !paymentIntentID) {
                                throw new TKError("Unexpected error. Contact SkedGo support");
                            }
                            setPaymentOption(firstPaymentOption);
                            setConfirmation(bookingForm.booking.confirmation);
                            setPaymentIntent(paymentIntentID);
                            setPaymentIntentSecret(clientSecret);
                            setWaiting(false);
                        });
                }
            })
            .catch((e) => {
                UIUtil.errorMsg(e, {
                    onClose: () => onRequestClose(false)
                });
            });
    }, []);
    // useEffect(() => {
    //     setStripePromise(loadStripe(stripeKey));
    // }, []);
    const options = {
        clientSecret: paymentIntentSecret
    };
    // const form = stripePromise && paymentIntentSecret &&
    const form = paymentIntentSecret &&
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
                onSuccess={() => {
                    setWaiting(true);
                    TripGoApi.apiCall(`payment/booking/paid/${paymentIntent}?psb=false`, NetworkUtil.MethodType.GET)
                        .then(() => onRequestClose(true))
                        .catch(UIUtil.errorMsg)
                        .finally(() => setWaiting(false));
                }}
                setWaiting={setWaiting}
                t={t}
            />
        </Elements>
    return (
        <TKUICard
            title={title}
            onRequestClose={() => onRequestClose(false)}
            presentation={CardPresentation.MODAL}
            focusTrap={false}   // Since this causes confirmAlert buttons to be un-clickable.
        >
            <div className={classes.main}>
                {confirmation?.purchase &&
                    <Fragment>
                        <TKUIRow
                            title={confirmation.purchase.productName}
                            subtitle={confirmation.purchase.brand.phone}
                            styles={{
                                main: overrideClass({
                                    padding: '16px 0'
                                })
                            }}
                        />
                        <div>{FormatUtil.toMoney(confirmation.purchase.price, { currency: confirmation.purchase.currency, forceDecimals: true })}</div>
                    </Fragment>}
                {/* {paymentOption &&
                    <div>{FormatUtil.toMoney(paymentOption.fullPrice, { currency: paymentOption.currency + " ", nInCents: true, forceDecimals: true })}</div>} */}
                <div className={classes.paymentForm}>
                    {form}
                </div>
            </div>
            {waiting &&
                <div className={classes.loadingPanel}>
                    <TKLoading />
                </div>}
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUIStripePaymentCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));