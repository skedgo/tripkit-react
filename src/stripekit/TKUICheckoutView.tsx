import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useElements, Elements, CardElement } from '@stripe/react-stripe-js';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TKUIWithClasses, overrideClass, withStyles } from '../jss/StyleHelper';
import { black, colorWithOpacity, TKUITheme } from '../jss/TKUITheme';
import genStyles from '../css/GenStyle.css';
import TKUIPaymentMethodSelect, { SGPaymentMethod } from './TKUIPaymentMethodSelect';
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
import Radio from '@material-ui/core/Radio';
import TKUISettingSection from '../options/TKUISettingSection';
import FormatUtil from '../util/FormatUtil';
import classNames from 'classnames';

const tKUICheckoutFormPropsDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    body: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.scrollableY
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
        },
        paddingBottom: '15px'
    },
    card: {
        ...genStyles.noShrink,
        height: '150px',
        margin: '15px 0 30px',
        '& path': {
            fill: theme.colorPrimary,
            opacity: '.8'
        }
    },
    tabs: {
        ...genStyles.flex,
        margin: '15px 0 15px 18px',
        '& :not($tabSelected) button': {
            color: black(1, theme.isDark)
        },
        '& :not($tabSelected) button:hover': {
            borderBottom: '1px solid ' + black(1, theme.isDark)
        }
    },
    tabSelected: {
        '& button': {
            borderBottom: '1px solid ' + theme.colorPrimary
        }
    },
    tabSeparator: {
        borderLeft: '1px solid ' + black(2, theme.isDark),
        margin: '0 20px'
    },
    cardElement: {
        margin: '18px'
    },
    group: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.spaceBetween
    },
    label: {
        ...theme.textWeightSemibold
    },
    value: {

    },
    discountedPrice: {
        ...theme.textWeightBold,
    },
    fullPrice: {
        textDecoration: 'line-through',
        ...theme.textSizeCaption,
        ...theme.textColorGray
    },
    priceValue: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignEnd
    },
    section: {
        border: '1px solid ' + black(4, theme.isDark),
        ...genStyles.borderRadius(8)
    },
    review: {
        marginTop: '30px'
    },
    selectPaymentMethod: {
        ...theme.textWeightBold,
        ...genStyles.flex,
        marginLeft: '19px'
    }
});

type IStyle = ReturnType<typeof tKUICheckoutFormPropsDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    publicKey: string;
    paymentOptions: PaymentOption[];
    ephemeralKeyObj: EphemeralResult;
    onClose: (success?: boolean, data?: { updateURL?: string }) => void;
    setWaiting?: (waiting: boolean) => void;
}

const TKUICheckoutView: React.FunctionComponent<IProps> =
    ({ publicKey, paymentOptions, ephemeralKeyObj, setWaiting, onClose, ...remainingProps }) => {
        const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | undefined>(undefined);
        const [paymentIntentSecret, setPaymentIntentSecret] = useState<string | undefined>(undefined);
        const [paidUrl, setPaidUrl] = useState<string | undefined>(undefined);

        // "INTERNAL" means FE does payment directly with Stripe, "EXTERNAL" means FE does payment indirectly through our BE. 
        const internalPaymentOption = paymentOptions.find(option => option.paymentMode === "INTERNAL");
        useEffect(() => {
            setStripePromise(loadStripe(publicKey));
            if (internalPaymentOption) {
                const initPaymentUrl = internalPaymentOption.url;
                setWaiting?.(true);
                TripGoApi.apiCallUrl(initPaymentUrl, internalPaymentOption.method)
                    .then(({ clientSecret, url: paidUrl }) => {
                        if (!clientSecret) {
                            throw new TKError("Unexpected error. Contact SkedGo support");
                        }
                        setPaymentIntentSecret(clientSecret);
                        setPaidUrl(paidUrl);
                    })
                    .catch(UIUtil.errorMsg)
                    .finally(() => setWaiting?.(false));;
            }
        }, []);
        if (internalPaymentOption && !paymentIntentSecret || !stripePromise) {
            return null;
        }
        const options = paymentIntentSecret ?
            {
                clientSecret: paymentIntentSecret
            } : undefined;
        const onConfirmPayment: (props: { paymentOption: PaymentOption, paymentMethod?: PaymentMethod, elements?: StripeElements, saveForFuture?: boolean }) => void =
            async ({ paymentOption, paymentMethod, elements, saveForFuture }) => {
                if (paymentOption.paymentMode === "WALLET") {
                    setWaiting?.(true);
                    TripGoApi.apiCallUrl(paymentOption.url, paymentOption.method)
                        .then(data => onClose(true, data))
                        .catch(UIUtil.errorMsg)
                        .finally(() => setWaiting?.(false));
                } else if (paymentOption.paymentMode === "INTERNAL") {
                    const stripe = await stripePromise;
                    if (!stripe || !paymentMethod && !elements) {
                        // Stripe.js has not yet loaded.
                        // Make sure to disable form submission until Stripe.js has loaded.
                        return;
                    }
                    let result;
                    setWaiting?.(true);
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
                        setWaiting?.(false);
                    } else {
                        TripGoApi.apiCallUrl(paidUrl!, NetworkUtil.MethodType.GET)
                            .then(data => onClose(true, data))
                            .catch(e => {
                                UIUtil.errorMsg(e, { onClose });
                            })
                            .finally(() => setWaiting?.(false));
                    }
                } else {    // paymentOption.paymentMode === "EXTERNAL"
                    const stripe = await stripePromise;
                    if (!stripe || !paymentMethod && !elements) {
                        // Stripe.js has not yet loaded.
                        // Make sure to disable form submission until Stripe.js has loaded.
                        return;
                    }
                    setWaiting?.(true);
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
                    TripGoApi.apiCallUrl(paymentOption.url, paymentOption.method, { paymentMethod: paymentMethod.id })
                        .then(data => onClose(true, data))
                        .catch(UIUtil.errorMsg)
                        .finally(() => setWaiting?.(false));
                }
            }
        return (
            <Elements stripe={stripePromise} options={options}>
                <TKUICheckoutForm
                    ephemeralKeyObj={ephemeralKeyObj}
                    paymentOptions={paymentOptions}
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
    paymentOptions: PaymentOption[];
    onConfirmPayment: (props: { paymentOption: PaymentOption, paymentMethod?: PaymentMethod, elements?: StripeElements, saveForFuture?: boolean }) => void;
    setWaiting?: (waiting: boolean) => void;
    onClose: (success?: boolean) => void;
}

const TKUICheckoutForm: React.FunctionComponent<CheckoutFormProps> =
    ({ ephemeralKeyObj, paymentOptions, onConfirmPayment, onClose, setWaiting, t, classes, theme, injectedStyles }) => {
        const ephemeralKey = ephemeralKeyObj.secret;
        const customerId = ephemeralKeyObj?.associated_objects[0]?.id;
        const elements = useElements();
        const [newPaymentMethodAndPay, setNewPaymentMethodAndPay] = useState<boolean>(false);
        const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | undefined>(undefined);
        const [saveForFuture, setSaveForFuture] = useState<boolean>(true);
        // const [ephemeralKey, setEphemeralKey] = useState<string | undefined>(undefined); // Now it will come from quick/1, so remove it.

        const cardPaymentOption = paymentOptions.find(option => option.paymentMode === "INTERNAL");
        const walletPaymentOption = paymentOptions.find(option => option.paymentMode === "WALLET");
        const walletPaymentMethod: SGPaymentMethod | undefined = useMemo(() =>
            walletPaymentOption && { type: walletPaymentOption.paymentMode, description: walletPaymentOption.description, balance: walletPaymentOption.currentBalance!, currency: walletPaymentOption.currency },
            [walletPaymentOption]);
        const paymentSelectOptions: (PaymentMethod | SGPaymentMethod)[] | undefined = paymentMethods && [...walletPaymentMethod ? [walletPaymentMethod] : [], ...paymentMethods ?? []];
        const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | SGPaymentMethod | undefined>(undefined);
        const paymentOption = (newPaymentMethodAndPay || (selectedMethod && selectedMethod.type !== "WALLET") ? cardPaymentOption : walletPaymentOption) ?? paymentOptions[0]!;

        useEffect(() => {
            // Initially select first payment option by default.
            if (paymentSelectOptions && paymentOptions.length > 0 && !selectedMethod) {
                setSelectedMethod(paymentSelectOptions[0])
            }
            // This will happen if removed the selected payment method.
            if (paymentSelectOptions && selectedMethod && !paymentSelectOptions.includes(selectedMethod)) {
                setSelectedMethod(paymentSelectOptions.length > 0 ? paymentSelectOptions[0] : undefined)
            }
        }, [paymentSelectOptions])

        console.log("render CheckoutForm");

        const refreshData = () => {
            setWaiting?.(true);
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
                .finally(() => setWaiting?.(false));
        };

        useEffect(() => {
            refreshData()
                .then(result => {
                    setPaymentMethods(result.data);
                    // result.data?.length > 0 && setSelectedPM(result.data[0]);
                });
        }, []);

        useEffect(() => {
            if (paymentSelectOptions && paymentSelectOptions.length === 0) {
                setNewPaymentMethodAndPay(true);
            }
        }, [paymentMethods]);

        const [StyledCheckbox] = useState<React.ComponentType<any>>(muiWithStyles({
            root: {
                color: colorWithOpacity(theme.colorPrimary, .5),
                '&$checked': {
                    color: theme.colorPrimary
                }
            },
            checked: {},
        })(Checkbox));

        const handleSubmit = async () => {
            if (newPaymentMethodAndPay) {
                onConfirmPayment({ paymentOption, elements: elements ?? undefined, saveForFuture });
            } else {
                onConfirmPayment({ paymentOption, paymentMethod: selectedMethod!.type !== "WALLET" ? selectedMethod as PaymentMethod : undefined });
            }
        };

        const onRemovePM = async (value: PaymentMethod) => {
            setWaiting?.(true);
            const response = await fetch(`https://api.stripe.com/v1/payment_methods/${value.id}/detach`, {
                method: 'post',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${ephemeralKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Stripe-Version': '2020-08-27'
                })
            });
            setWaiting?.(false);
            if (!response.ok) {
                UIUtil.errorMsg(new TKError("Could not delete the card.", response.status.toString(), false));
            } else {
                const updatedPMs = paymentMethods!.filter(pm => pm !== value);
                setPaymentMethods(updatedPMs);
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

        const sectionStyles = { sectionBody: overrideClass(injectedStyles.section) };

        return (
            <Fragment>
                <div className={classes.main}>
                    <div className={classes.body}>
                        <IconCard className={classes.card} />
                        {paymentSelectOptions && paymentSelectOptions.length > 0 &&
                            <>
                                <div className={classes.selectPaymentMethod}>
                                    Select payment method
                                </div>
                                <div className={classes.tabs}>
                                    <div className={!newPaymentMethodAndPay ? classes.tabSelected : undefined}>
                                        <TKUIButton
                                            type={TKUIButtonType.PRIMARY_LINK}
                                            text={"Existing"}
                                            onClick={() => {
                                                setNewPaymentMethodAndPay(false);
                                            }}
                                        />
                                    </div>
                                    <div className={classes.tabSeparator} />
                                    <div className={newPaymentMethodAndPay ? classes.tabSelected : undefined}>
                                        <TKUIButton
                                            type={TKUIButtonType.PRIMARY_LINK}
                                            text={"New card"}
                                            onClick={() => {
                                                setNewPaymentMethodAndPay(true);
                                            }}
                                        />
                                    </div>
                                </div>
                            </>}
                        {newPaymentMethodAndPay ?
                            <div className={classes.newPayment}>
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
                                {paymentSelectOptions && selectedMethod &&
                                    <TKUIPaymentMethodSelect
                                        value={selectedMethod}
                                        options={paymentSelectOptions}
                                        onChange={setSelectedMethod}
                                        onRemove={onRemovePM}
                                    />}
                            </div>}
                        {(selectedMethod || newPaymentMethodAndPay) && paymentOption.discountedPrice &&
                            <div className={classes.review}>
                                <TKUISettingSection styles={sectionStyles}>
                                    <div className={classes.group}>
                                        <div className={classes.label}>{"Discount"}</div>
                                        <div className={classes.value}>{FormatUtil.toMoney(paymentOption.fullPrice - paymentOption.discountedPrice, { currency: paymentOption.currency, nInCents: true }) + " off"}</div>
                                    </div>
                                    <div className={classes.group}>
                                        <div className={classes.label}>{t("Price")}</div>
                                        <div className={classNames(classes.value, classes.priceValue)}>
                                            <div className={classes.discountedPrice}>
                                                {FormatUtil.toMoney(paymentOption.discountedPrice, { currency: paymentOption.currency, nInCents: true })}
                                            </div>
                                            <div className={classes.fullPrice}>
                                                {FormatUtil.toMoney(paymentOption.fullPrice, { currency: paymentOption.currency, nInCents: true })}
                                            </div>
                                        </div>
                                    </div>
                                    {paymentOption.paymentMode === "WALLET" &&
                                        <div className={classes.group}>
                                            <div className={classes.label}>{"New Balance"}</div>
                                            <div className={classes.value}>{FormatUtil.toMoney(paymentOption.newBalance!, { currency: paymentOption.currency, nInCents: true })}</div>
                                        </div>}
                                </TKUISettingSection>
                            </div>}
                    </div>
                    <div className={classes.buttonsPanel}>
                        <TKUIButton
                            text={t("Back")}
                            type={TKUIButtonType.SECONDARY}
                            onClick={() => onClose()}
                        />
                        <TKUIButton
                            text={"Purchase"}
                            type={TKUIButtonType.PRIMARY}
                            disabled={!newPaymentMethodAndPay && !selectedMethod}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>
            </Fragment>

        )
    }

export default withStyles(TKUICheckoutView, tKUICheckoutFormPropsDefaultStyle);