import React from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { tKUIStripePaymentCardDefaultStyle } from "./TKUIStripePaymentCard.css";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import TKUIErrorView from "../error/TKUIErrorView";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


type IStyle = ReturnType<typeof tKUIStripePaymentCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {

}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIStripePaymentCardProps = IProps;
export type TKUIStripePaymentCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIStripePaymentCard {...props} />,
    styles: tKUIStripePaymentCardDefaultStyle,
    classNamePrefix: "TKUIStripePaymentCard"
};

const stripePromise = loadStripe('pk_test_pcFz1IPSJed68tco8okyFcaw');

const CheckoutForm: React.FunctionComponent<{}> = () => {
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

        const result = await stripe.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: "https://example.com/order/123/complete",
            },
        });


        if (result.error) {
            // Show error to your customer (for example, payment details incomplete)
            console.log(result.error.message);
        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button disabled={!stripe}>Submit</button>
        </form>
    )
}

const TKUIStripePaymentCard: React.FunctionComponent<IProps> = ({ classes, injectedStyles, t }) => {
    const options = {
        // passing the client secret obtained from the server
        // clientSecret: '{{CLIENT_SECRET}}',
        // clientSecret: 'cus_LUMVWZNxY79kVv_secret_ek_test_YWNjdF8xNVNxdTZKTVNrc2pYdDNlLE5iY0FIVFFQTlN0cTVYY0h1QXNrQWQ5bWJ4a1JySHU_00PkxUXaXD',
        // clientSecret: 'cus_LUMVWZNxY79kVv_secret_ek_test_YWNjdF8xNVNxdTZKTVNrc2pYdDNlLHBRb05QT2JGVWxMRk9xRXQ5anJvenVYTE5XeGFhclE_00OJGtQCmV',
        clientSecret: 'ephkey_1KnOS8JMSksjXt3erLz8dxn0_secret_ek_test_YWNjdF8xNVNxdTZKTVNrc2pYdDNlLHBRb05QT2JGVWxMRk9xRXQ5anJvenVYTE5XeGFhclE_00OJGtQCmV',
    };
    return (
        <TKUICard
        // title={segment.getAction()}
        // subtitle={segment.to.getDisplayString()}
        // onRequestClose={onRequestClose}
        presentation={CardPresentation.MODAL}
        >   
            <button>Tabbable node</button>
            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm />
            </Elements>
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUIStripePaymentCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));