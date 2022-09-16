import React, { Fragment, useEffect, useState } from 'react';
import { useElements, Elements, PaymentElement, CardElement } from '@stripe/react-stripe-js';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { black, TKUITheme } from '../jss/TKUITheme';
import genStyles from '../css/GenStyle.css';
import TKUIPaymentMethodSelect from './TKUIPaymentMethodSelect';
import TripGoApi from '../api/TripGoApi';
import NetworkUtil from '../util/NetworkUtil';
import EphemeralResult from '../model/payment/EphemeralResult';
import { PaymentMethod } from '@stripe/stripe-js/types/api/payment-methods';
import { ReactComponent as IconCard } from "../images/payment/ic-creditcard-big.svg";
import { withStyles as muiWithStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import { TKError } from '../error/TKError';
import UIUtil from '../util/UIUtil';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import PaymentOption from '../model/trip/PaymentOption';
import { StripeElements } from '@stripe/stripe-js/types/stripe-js/elements-group';
import TKUINewCardView from './TKUINewCardView';

const tKUICheckoutFormPropsDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    body: {
        ...genStyles.flex,
        ...genStyles.column
    },
    newPayment: {
        ...genStyles.flex,
        ...genStyles.column
    },
    futurePayment: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        marginTop: '20px'
    },
    buttonsPanel: {
        marginTop: 'auto',
        display: 'flex',
        ...genStyles.justifyEnd,
        '&>*:not(:first-child)': {
            marginLeft: '20px'
        }
    },
    card: {
        height: '150px',
        margin: '15px 0 30px',
        '& path': {
            fill: theme.colorPrimary,
            opacity: '.8'
        }
    },
    tabs: {
        ...genStyles.flex,
        margin: '15px 0 25px 18px',
        '& :not($tabSelected) button': {
            color: black(1)
        },
        '& :not($tabSelected) button:hover': {
            borderBottom: '1px solid ' + black(1)
        }
    },
    tabSelected: {
        '& button': {
            borderBottom: '1px solid rgb(226, 115, 56)'
        }
    },
    tabSeparator: {
        borderLeft: '1px solid ' + black(2),
        margin: '0 20px'
    }
});

type IStyle = ReturnType<typeof tKUICheckoutFormPropsDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    publicKey: string;
    paymentOption: PaymentOption;
    ephemeralKeyObj: EphemeralResult;
    onClose: (success?: boolean) => void;
    setWaiting: (waiting: boolean) => void;
}

const TKUICheckoutView: React.FunctionComponent<IProps> =
    ({ publicKey, paymentOption, ephemeralKeyObj, setWaiting, onClose, ...remainingProps }) => {
        const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | undefined>(undefined);
        const [paymentIntentSecret, setPaymentIntentSecret] = useState<string | undefined>(undefined);
        const [paidUrl, setPaidUrl] = useState<string | undefined>(undefined);
        const isExternalPayment = paymentOption.method === "GET";
        useEffect(() => {
            setStripePromise(loadStripe(publicKey));
            const initPaymentUrl = paymentOption.url;
            if (isExternalPayment) {
                setWaiting(true);
                TripGoApi.apiCallUrl(initPaymentUrl, NetworkUtil.MethodType.GET)
                    .then(({ clientSecret, paymentIntentID, url: paidUrl }) => {
                        if (!clientSecret || !paymentIntentID) {
                            throw new TKError("Unexpected error. Contact SkedGo support");
                        }
                        setPaymentIntentSecret(clientSecret);
                        setPaidUrl(paidUrl);
                        setWaiting(false);
                    });
            }
        }, []);
        if (isExternalPayment && !paymentIntentSecret || !stripePromise) {
            return null;
        }
        const options = paymentIntentSecret ?
            {
                clientSecret: paymentIntentSecret
            } : undefined;
        const onConfirmPayment: (props: { paymentMethod?: PaymentMethod, elements?: StripeElements, saveForFuture?: boolean }) => void =
            async ({ paymentMethod, elements, saveForFuture }) => {
                const stripe = await stripePromise;
                if (isExternalPayment) {
                    if (!stripe || !paymentMethod && !elements) {
                        // Stripe.js has not yet loaded.
                        // Make sure to disable form submission until Stripe.js has loaded.
                        return;
                    }
                    let result;
                    setWaiting(true);   //??? The setWaiting(false) is called by the parent component, after taking additional actions on success.
                    if (paymentMethod) {
                        result = await stripe.confirmCardPayment(paymentIntentSecret!, {
                            payment_method: paymentMethod!.id
                        })
                    } else {
                        result = await stripe.confirmPayment({
                            //`Elements` instance that was used to create the Payment Element
                            elements: elements!,
                            confirmParams: {
                                return_url: "https://example.com/order/123/complete",
                                save_payment_method: saveForFuture,
                                // setup_future_usage: "on_session" // See if I need also this.   
                            },
                            redirect: 'if_required'
                        });
                    }
                    if (result.error) {
                        // Show error to your customer (for example, payment details incomplete)
                        console.log(result.error.message);
                        setWaiting(false);
                    } else {
                        TripGoApi.apiCallUrl(paidUrl!, NetworkUtil.MethodType.GET)
                            .then(() => onClose(true))
                            .catch(UIUtil.errorMsg)
                            .finally(() => setWaiting(false));
                    }
                } else {
                    if (!paymentMethod) {
                        return;
                    }
                    setWaiting(true);
                    TripGoApi.apiCallUrl(paymentOption.url, NetworkUtil.MethodType.POST, { paymentMethod: paymentMethod.id })
                        .then(() => onClose(true))
                        .catch(UIUtil.errorMsg)
                        .finally(() => setWaiting(false));
                }
            }
        return (
            <Elements stripe={stripePromise} options={options}>
                <TKUICheckoutForm
                    ephemeralKeyObj={ephemeralKeyObj}
                    onConfirmPayment={onConfirmPayment}
                    onClose={onClose}
                    setWaiting={setWaiting}
                    payAndSaveEnabled={isExternalPayment}
                    {...remainingProps}
                />
            </Elements>
        );
    }

interface CheckoutFormProps extends TKUIWithClasses<IStyle, IProps> {
    ephemeralKeyObj: EphemeralResult;
    onConfirmPayment: (props: { paymentMethod?: PaymentMethod, elements?: StripeElements, saveForFuture?: boolean }) => void;
    setWaiting: (waiting: boolean) => void;
    onClose: (success?: boolean) => void;
    payAndSaveEnabled?: boolean;
}

const TKUICheckoutForm: React.FunctionComponent<CheckoutFormProps> =
    ({ ephemeralKeyObj, onConfirmPayment, onClose, setWaiting, payAndSaveEnabled, t, classes, theme }) => {
        const ephemeralKey = ephemeralKeyObj.secret;
        const customerId = ephemeralKeyObj?.associated_objects[0]?.id;
        const elements = useElements();
        const [newCard, setNewCard] = useState<boolean>(false);
        const [newPaymentMethodAndPay, setNewPaymentMethodAndPay] = useState<boolean>(false);
        const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | undefined>(undefined);
        const [selectedPM, setSelectedPM] = useState<PaymentMethod | undefined>(undefined);
        const [saveForFuture, setSaveForFuture] = useState<boolean>(true);
        // const [ephemeralKey, setEphemeralKey] = useState<string | undefined>(undefined); // Now it will come from quick/1, so remove it.

        const refreshData = () => {
            setWaiting(true);
            return fetch(`https://api.stripe.com/v1/customers/${customerId}/payment_methods?type=card`, {
                method: 'get',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${ephemeralKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Stripe-Version': '2020-08-27'
                })
            })
                .then(NetworkUtil.jsonCallback)                
                .finally(() => setWaiting(false));
        };

        useEffect(() => {
            refreshData()
            .then(result => {
                setPaymentMethods(result.data);
                result.data?.length > 0 && setSelectedPM(result.data[0]);
            });
        }, []);

        useEffect(() => {
            if (payAndSaveEnabled && paymentMethods && paymentMethods.length === 0) {
                setNewPaymentMethodAndPay(true);
            }
        }, [paymentMethods]);

        const [StyledCheckbox] = useState<React.ComponentType<any>>(muiWithStyles({
            root: {
                // marginLeft: '0',
                // width: '50px',
                '&$checked': {
                    color: theme.colorPrimary
                }
            },
            checked: {},
        })(Checkbox));

        const handleSubmit = (event) => {
            // We don't want to let default form submission happen here,
            // which would refresh the page.
            event.preventDefault();
            if (newPaymentMethodAndPay) {
                onConfirmPayment({ elements: elements ?? undefined, saveForFuture: true });
            } else {
                onConfirmPayment({ paymentMethod: selectedPM });
            }
        };

        const onRemovePM = async (value: PaymentMethod) => {
            setWaiting(true);
            const response = await fetch(`https://api.stripe.com/v1/payment_methods/${value.id}/detach`, {
                method: 'post',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${ephemeralKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Stripe-Version': '2020-08-27'
                })
            });
            setWaiting(false);
            if (!response.ok) {
                UIUtil.errorMsg(new TKError("Could not delete the card.", response.status.toString(), false));
            } else {
                const updatedPMs = paymentMethods!.filter(pm => pm !== value);
                setPaymentMethods(updatedPMs);
                if (selectedPM === value) {
                    setSelectedPM(updatedPMs.length > 0 ? updatedPMs[0] : undefined);
                }
            }
        }
        if (newCard) {
            return (
                <TKUINewCardView
                    ephemeralKeyObj={ephemeralKeyObj}
                    onRequestClose={cardId => {
                        setNewCard(false);
                        if (cardId) {
                            refreshData()
                            .then(result => {
                                setPaymentMethods(result.data);
                                console.log(result.data)
                                result.data && result.data.length > 0 && setSelectedPM(result.data.find(pm => pm.id === cardId))                      
                            });                            
                        }
                    }}
                />
            );
        }
        return (
            <Fragment>
                <form onSubmit={handleSubmit} className={classes.main}>
                    <div className={classes.body}>
                        <IconCard className={classes.card} />
                        {payAndSaveEnabled && paymentMethods && paymentMethods.length > 0 &&
                            <div className={classes.tabs}>
                                <div className={!newPaymentMethodAndPay ? classes.tabSelected : undefined}>
                                    <TKUIButton
                                        type={TKUIButtonType.PRIMARY_LINK}
                                        text={"Existing payment method"}
                                        onClick={e => {
                                            e.preventDefault();
                                            setNewPaymentMethodAndPay(false);
                                        }}
                                    />
                                </div>
                                <div className={classes.tabSeparator} />
                                <div className={newPaymentMethodAndPay ? classes.tabSelected : undefined}>
                                    <TKUIButton
                                        type={TKUIButtonType.PRIMARY_LINK}
                                        text={"New payment method"}
                                        onClick={e => {
                                            e.preventDefault();
                                            setNewPaymentMethodAndPay(true);
                                        }}
                                    />
                                </div>
                            </div>}
                        {newPaymentMethodAndPay ?
                            <div className={classes.newPayment}>
                                <PaymentElement />
                                <div className={classes.futurePayment}>
                                    <StyledCheckbox
                                        checked={saveForFuture}
                                        onChange={e => setSaveForFuture(e.target.checked)}
                                    />
                                    Save for future payments
                                </div>
                            </div>
                            :
                            <div>
                                {paymentMethods && selectedPM &&
                                    <TKUIPaymentMethodSelect
                                        value={selectedPM}
                                        options={paymentMethods}
                                        onChange={value => setSelectedPM(value)}
                                        onRemove={onRemovePM}
                                    />}
                                <TKUIButton
                                    type={TKUIButtonType.PRIMARY_LINK}
                                    text={"Add card"}
                                    onClick={e => {
                                        e.preventDefault();
                                        setNewCard(true);
                                    }}
                                />
                            </div>}
                    </div>
                    <div className={classes.buttonsPanel}>
                        <TKUIButton
                            text={t("Back")}
                            type={TKUIButtonType.SECONDARY}
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                            }}
                        />
                        <TKUIButton
                            text={t("Confirm")}
                            type={TKUIButtonType.PRIMARY}
                            // disabled={!stripe || !newPaymentMethod && !selectedPM}
                            disabled={!newPaymentMethodAndPay && !selectedPM}
                        />
                    </div>
                </form>
            </Fragment>

        )
    }

export default withStyles(TKUICheckoutView, tKUICheckoutFormPropsDefaultStyle);