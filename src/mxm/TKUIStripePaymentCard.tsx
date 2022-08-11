import React, { useEffect, useState } from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { tKUIStripePaymentCardDefaultStyle } from "./TKUIStripePaymentCard.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import TripGoApi from '../api/TripGoApi';
import NetworkUtil from '../util/NetworkUtil';
import PaymentOption from '../model/trip/PaymentOption';
import TKLoading from '../card/TKLoading';
import UIUtil from '../util/UIUtil';
import { TKError } from '../error/TKError';
import BookingReview from '../model/trip/BookingReview';
import TKUIBookingReview from './TKUIBookingReview';
import TKUICheckoutForm from './TKUICheckoutForm';
import { TKUIViewportUtil } from '../util/TKUIResponsiveUtil';
import EphemeralResult from '../model/payment/EphemeralResult';


type IStyle = ReturnType<typeof tKUIStripePaymentCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {    
    paymentOptions: PaymentOption[];
    reviews: BookingReview[];
    onRequestClose: (success: boolean) => void;
    publicKey: string;
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



const TKUIStripePaymentCard: React.FunctionComponent<IProps> = ({ onRequestClose, paymentOptions, reviews, classes, injectedStyles, t, publicKey }) => {
    const [paymentIntentSecret, setPaymentIntentSecret] = useState<string | undefined>(undefined);
    const [paymentIntent, setPaymentIntent] = useState<string | undefined>(undefined);
    const [ephemeralResult, setEphemeralResult] = useState<EphemeralResult | undefined>(undefined);
    const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
    const [paidUrl, setPaidUrl] = useState<string | undefined>(undefined);
    const [waiting, setWaiting] = useState<boolean>(false);
    const [stripePromise, setStripePromise] = useState<any>(false);
    const title = showPaymentForm ? "Payment" : "Review booking";    
    useEffect(() => {
        setStripePromise(loadStripe(publicKey));
    }, []);
    const onPayOption = (payOption: PaymentOption) => {
        const initPaymentUrl = payOption.url;
        setWaiting(true);
        return TripGoApi.apiCallUrl(initPaymentUrl, NetworkUtil.MethodType.GET)
            .then(({ clientSecret, paymentIntentID, url: paidUrl }) => {
                if (!clientSecret || !paymentIntentID) {
                    throw new TKError("Unexpected error. Contact SkedGo support");
                }
                setPaymentIntent(paymentIntentID);
                setPaymentIntentSecret(clientSecret);
                setPaidUrl(paidUrl);
                setWaiting(false);
                setShowPaymentForm(true);
            });
    };
    const options = {
        clientSecret: paymentIntentSecret
    };
    const onPaySuccess = () => {
        setWaiting(true);
        TripGoApi.apiCallUrl(paidUrl!, NetworkUtil.MethodType.GET)
            .then(() => onRequestClose(true))
            .catch(UIUtil.errorMsg)
            .finally(() => setWaiting(false));
    };
    return (
        <TKUIViewportUtil>
            {(viewportProps) =>
                <TKUICard
                    title={title}
                    onRequestClose={() => onRequestClose(false)}
                    presentation={viewportProps.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                    slideUpOptions={{ draggable: false }}
                    focusTrap={false}   // Since this causes confirmAlert buttons to be un-clickable.
                    styles={{
                        modalContent: overrideClass({
                            width: '800px'
                        })
                    }}
                >
                    <div className={classes.main}>
                        {!showPaymentForm &&
                            <TKUIBookingReview
                                reviews={reviews}
                                paymentOptions={paymentOptions}
                                onPayOption={onPayOption}
                                onClose={() => onRequestClose(false)}
                                viewportProps={viewportProps}
                            />}
                        {showPaymentForm && stripePromise && paymentIntentSecret &&
                            <Elements stripe={stripePromise} options={options}>
                                <TKUICheckoutForm
                                    paymentIntentSecret={paymentIntentSecret}
                                    onClose={(success) => {
                                        if (!success) {
                                            setShowPaymentForm(false);
                                        } else {
                                            onPaySuccess();
                                        }
                                    }}
                                    setWaiting={setWaiting}
                                />
                            </Elements>}
                    </div>
                    {waiting &&
                        <div className={classes.loadingPanel}>
                            <TKLoading />
                        </div>}
                </TKUICard >
            }
        </TKUIViewportUtil >
    );
};

export default connect((config: TKUIConfig) => config.TKUIStripePaymentCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));