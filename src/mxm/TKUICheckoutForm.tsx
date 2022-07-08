import React from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';

import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { TKUITheme } from '../jss/TKUITheme';

const tKUICheckoutFormPropsDefaultStyle = (theme: TKUITheme) => ({
    buttonsPanel: {
        marginTop: '20px', display: 'flex', justifyContent: 'center',
        '&>*:not(:first-child)': {
            marginLeft: '20px'
        } 
    }
});

type IStyle = ReturnType<typeof tKUICheckoutFormPropsDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    onClose: (success?: boolean) => void;
    setWaiting: (waiting: boolean) => void;    
}

const TKUICheckoutForm: React.FunctionComponent<IProps> =
    ({ onClose, setWaiting, t, classes }) => {
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
                onClose(true);
            }
        };

        return (
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <div className={classes.buttonsPanel}>
                    <TKUIButton
                        text={t("Back")}
                        type={TKUIButtonType.SECONDARY}
                        onClick={(e) => {
                            console.log("clicked");
                            e.preventDefault();
                            onClose();
                        }}
                    />
                    <TKUIButton
                        text={t("Confirm")}
                        type={TKUIButtonType.PRIMARY}
                        disabled={!stripe}
                    />
                </div>
            </form>
        )
    }

export default withStyles(TKUICheckoutForm, tKUICheckoutFormPropsDefaultStyle);