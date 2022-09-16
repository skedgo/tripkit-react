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
        margin: '20px 0 0 6px'
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
    },
    cardElement: {
        margin: '18px'
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
        // External payment means that is performed directly by hitting Stripe, as opposed to passing through our BE.
        const isExternalPayment = paymentOption.method === "GET";
        useEffect(() => {
            setStripePromise(loadStripe(publicKey));
            const initPaymentUrl = paymentOption.url;
            if (isExternalPayment) {
                setWaiting(true);
                TripGoApi.apiCallUrl(initPaymentUrl, NetworkUtil.MethodType.GET)
                    .then(({ clientSecret, url: paidUrl }) => {
                        if (!clientSecret) {
                            throw new TKError("Unexpected error. Contact SkedGo support");
                        }
                        setPaymentIntentSecret(clientSecret);
                        setPaidUrl(paidUrl);
                    })
                    .catch(UIUtil.errorMsg)
                    .finally(() => setWaiting(false));;
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
                if (!stripe || !paymentMethod && !elements) {
                    // Stripe.js has not yet loaded.
                    // Make sure to disable form submission until Stripe.js has loaded.
                    return;
                }
                if (isExternalPayment) {
                    let result;
                    setWaiting(true);
                    if (paymentMethod) {
                        result = await stripe.confirmCardPayment(paymentIntentSecret!, {
                            payment_method: paymentMethod!.id
                        })
                    } else {
                        if (elements!.getElement(CardElement)) {
                            result = await stripe.confirmCardPayment(paymentIntentSecret!, {
                                payment_method: {
                                    card: elements!.getElement(CardElement)!
                                },
                                save_payment_method: saveForFuture
                            })
                        } else { // UI currently does not enable this way (just card payment).
                            result = await stripe.confirmPayment({
                                //`Elements` instance that was used to create the Payment Element
                                elements: elements!,
                                confirmParams: {
                                    return_url: "https://example.com/order/123/complete",
                                    save_payment_method: saveForFuture
                                },
                                redirect: 'if_required'
                            });
                        }
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
                    setWaiting(true);
                    if (!paymentMethod) {
                        const payload = await stripe.createPaymentMethod({
                            type: "card",
                            card: elements!.getElement(CardElement)!
                        });
                        if (!payload.paymentMethod) { // Throw error
                            return;
                        }
                        paymentMethod = payload.paymentMethod;
                        if (saveForFuture) {
                            fetch(`https://api.stripe.com/v1/payment_methods/${payload.paymentMethod.id}/attach`, {
                                method: 'post',
                                headers: new Headers({
                                    'Accept': 'application/json',
                                    'Authorization': `Bearer ${ephemeralKeyObj.secret}`,
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Stripe-Version': '2020-08-27'
                                }),
                                body: `customer=${ephemeralKeyObj.associated_objects[0]?.id}`
                            })
                                .then(NetworkUtil.jsonCallback);
                        }
                    }
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
}

const TKUICheckoutForm: React.FunctionComponent<CheckoutFormProps> =
    ({ ephemeralKeyObj, onConfirmPayment, onClose, setWaiting, t, classes, theme }) => {
        const ephemeralKey = ephemeralKeyObj.secret;
        const customerId = ephemeralKeyObj?.associated_objects[0]?.id;
        const elements = useElements();
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
            if (paymentMethods && paymentMethods.length === 0) {
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

        const handleSubmit = async () => {
            if (newPaymentMethodAndPay) {
                onConfirmPayment({ elements: elements ?? undefined, saveForFuture });
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
        // if (newCard) {
        //     return (
        //         <TKUINewCardView
        //             ephemeralKeyObj={ephemeralKeyObj}
        //             onRequestClose={cardId => {
        //                 setNewCard(false);
        //                 if (cardId) {
        //                     refreshData()
        //                         .then(result => {
        //                             setPaymentMethods(result.data);
        //                             console.log(result.data)
        //                             result.data && result.data.length > 0 && setSelectedPM(result.data.find(pm => pm.id === cardId))
        //                         });
        //                 }
        //             }}
        //         />
        //     );
        // }
        return (
            <Fragment>
                <div className={classes.main}>
                    <div className={classes.body}>
                        <IconCard className={classes.card} />
                        {paymentMethods && paymentMethods.length > 0 &&
                            <div className={classes.tabs}>
                                <div className={!newPaymentMethodAndPay ? classes.tabSelected : undefined}>
                                    <TKUIButton
                                        type={TKUIButtonType.PRIMARY_LINK}
                                        text={"Existing card"}
                                        onClick={() => setNewPaymentMethodAndPay(false)}
                                    />
                                </div>
                                <div className={classes.tabSeparator} />
                                <div className={newPaymentMethodAndPay ? classes.tabSelected : undefined}>
                                    <TKUIButton
                                        type={TKUIButtonType.PRIMARY_LINK}
                                        text={"New card"}
                                        onClick={() => setNewPaymentMethodAndPay(true)}
                                    />
                                </div>
                            </div>}
                        {newPaymentMethodAndPay ?
                            <div className={classes.newPayment}>
                                {/* <PaymentElement /> */}
                                <CardElement className={classes.cardElement} />
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
                            </div>}
                    </div>
                    <div className={classes.buttonsPanel}>
                        <TKUIButton
                            text={t("Back")}
                            type={TKUIButtonType.SECONDARY}
                            onClick={() => onClose()}
                        />
                        <TKUIButton
                            text={t("Confirm")}
                            type={TKUIButtonType.PRIMARY}
                            disabled={!newPaymentMethodAndPay && !selectedPM}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>
            </Fragment>

        )
    }

export default withStyles(TKUICheckoutView, tKUICheckoutFormPropsDefaultStyle);