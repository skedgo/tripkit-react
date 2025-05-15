import React, { Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { useElements, Elements, CardElement } from '@stripe/react-stripe-js';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TKUIWithClasses, TKUIWithStyle, overrideClass, withStyles } from '../jss/StyleHelper';
import { black, TKUITheme } from '../jss/TKUITheme';
import genStyles from '../css/GenStyle.css';
import TKUIPaymentMethodSelect, { SGPaymentMethod } from './TKUIPaymentMethodSelect';
import TripGoApi from '../api/TripGoApi';
import NetworkUtil from '../util/NetworkUtil';
import EphemeralResult from '../model/payment/EphemeralResult';
import { PaymentMethod } from '@stripe/stripe-js/types/api/payment-methods';
import { ReactComponent as IconCard } from "../images/payment/ic-creditcard-big.svg";
import { TKError } from '../error/TKError';
import UIUtil from '../util/UIUtil';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import PaymentOption from '../model/trip/PaymentOption';
import { StripeElements } from '@stripe/stripe-js/types/stripe-js/elements-group';
import TKUISettingSection from '../options/TKUISettingSection';
import FormatUtil from '../util/FormatUtil';
import classNames from 'classnames';
import TKUISelect, { SelectOption } from '../buttons/TKUISelect';
import { i18n } from '../i18n/TKI18nConstants';
import { TKComponentDefaultConfig } from '../config/TKComponentConfig';
import { connect, mapperFromFunction } from '../config/TKConfigHelper';
import { TKUIConfig } from '../config/TKUIConfig';
import { BookingPaymentForm } from '../model/payment/BookingPaymentForm';
import { BookingField } from '../model/trip/BookingInfo';
import { ReactComponent as IconRecent } from "../images/ic-recent.svg";
import DateTimeUtil from '../util/DateTimeUtil';
import TKUICheckbox from '../util_components/TKUICheckbox';

const tKUICheckoutFormPropsDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    body: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.scrollableY,
        ...genStyles.grow
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
        display: 'flex',
        ...genStyles.justifyEnd,
        '&>*:not(:first-child)': {
            marginLeft: '20px'
        },
        padding: '15px 0'
    },
    card: {
        ...genStyles.noShrink,
        height: '110px',
        marginBottom: '10px',
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

    },
    value: {

    },
    actualPrice: {
        ...theme.textWeightBold,
    },
    strikeThroughPrice: {
        textDecoration: 'line-through',
        ...theme.textSizeCaption,
        ...theme.textColorGray
    },
    priceValue: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignEnd
    },
    initiativeValue: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignEnd,
        '& > *': {
            width: '300px'
        }
    },
    section: {
        border: '1px solid ' + black(4, theme.isDark),
        ...genStyles.borderRadius(8)
    },
    sectionTitle: {
        textTransform: 'capitalize',
        ...theme.textWeightSemibold
    },
    selectPaymentMethod: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.grow,
        marginLeft: '-18px'
    },
    review: {
        // marginTop: '30px'
    },
    // selectPaymentMethod: {
    //     ...theme.textWeightBold,
    //     ...genStyles.flex,
    //     marginLeft: '19px'
    // },
    error: {
        marginTop: '24px',
        color: 'red'
    },
    sponsorDescription: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter
    }
});

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    bookingPaymentForm: BookingPaymentForm;
    onSubmit: (data: { updateURL?: string }) => void;
    onClose?: () => void;
    setWaiting?: (waiting: boolean) => void;
    organizationOptions?: SelectOption[];
    defaultOrganizationOption?: SelectOption;
    defaultPaymentMethodFc?: (paymentMethods: SGPaymentMethod[]) => SGPaymentMethod | undefined;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUICheckoutFormPropsDefaultStyle>

export type TKUICheckoutViewProps = IProps;
export type TKUICheckoutViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUICheckoutView {...props} />,
    styles: tKUICheckoutFormPropsDefaultStyle,
    classNamePrefix: "TKUICheckoutView"
};

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUICheckoutViewClientProps = IClientProps;

function handlePayResponse(request: Promise<any>, onSubmit: (data: { updateURL?: string }) => void, setWaiting?: (waiting: boolean) => void) {
    setWaiting?.(true);
    request.then(data => {
        if (data.warning) {
            UIUtil.customConfirmAlert({
                title: "Warning",
                message: data.warning,
                buttons: [{
                    label: i18n.t("OK"),
                    onClick: () => { }
                }]
            })
        }
        return data;
    })
        .then(data => onSubmit(data))
        .catch(UIUtil.errorMsg)
        .finally(() => setWaiting?.(false));
}

const TKUICheckoutView: React.FunctionComponent<IProps> =
    ({ bookingPaymentForm, setWaiting, onSubmit, onClose, ...remainingProps }) => {
        const { publishableApiKey: publicKey, paymentOptions, ephemeralKey: ephemeralKeyObj } = bookingPaymentForm
        const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | undefined>(undefined);
        const [paymentIntentSecret, setPaymentIntentSecret] = useState<string | undefined>(undefined);
        const [paidUrl, setPaidUrl] = useState<string | undefined>(undefined);

        // "INTERNAL" means FE does payment directly with Stripe, "EXTERNAL" means FE does payment indirectly through our BE. 
        const internalPaymentOption = paymentOptions!.find(option => option.paymentMode === "INTERNAL");
        useEffect(() => {
            if (internalPaymentOption) {
                setStripePromise(loadStripe(publicKey));
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
        const onConfirmPayment: (props: { paymentMethod: SGPaymentMethod, elements?: StripeElements, saveForFuture?: boolean, selectedOrganizationId?: string, selectedInitiative?: string }) => void =
            async ({ paymentMethod, elements, saveForFuture, selectedOrganizationId, selectedInitiative }) => {
                const paymentOption = paymentMethod.paymentOption;
                let stripePaymentMethod = paymentMethod.data?.stripePaymentMethod;
                const method = paymentOption.method;
                let paymentOptionUrl = paymentOption.url;
                if (method === NetworkUtil.MethodType.GET && (selectedInitiative || selectedOrganizationId)) {
                    const paymentOptionUrlObj = new URL(paymentOption.url);
                    selectedInitiative && paymentOptionUrlObj.searchParams.set("initiativeID", selectedInitiative);
                    selectedOrganizationId && paymentOptionUrlObj.searchParams.set("organizationID", selectedOrganizationId);
                    paymentOptionUrl = paymentOptionUrlObj.toString();
                }
                paymentOption.url
                    + (method === NetworkUtil.MethodType.GET && selectedInitiative) ? `?initiativeID=${selectedInitiative}` : "";
                const body: any = method === NetworkUtil.MethodType.POST && (selectedInitiative || selectedOrganizationId) ?
                    { initiativeID: selectedInitiative, organizationID: selectedOrganizationId } : undefined;
                if (paymentOption.paymentMode === "WALLET" || paymentOption.paymentMode === "INVOICE") {
                    handlePayResponse(TripGoApi.fetchAPI(paymentOptionUrl, { method, body }), onSubmit, setWaiting);
                } else if (paymentOption.paymentMode === "INTERNAL") {
                    const stripe = await stripePromise;
                    if (!stripe || !stripePaymentMethod && !elements) {
                        // Stripe.js has not yet loaded.
                        // Make sure to disable form submission until Stripe.js has loaded.
                        return;
                    }
                    let result;
                    setWaiting?.(true);
                    if (stripePaymentMethod) {
                        result = await stripe.confirmCardPayment(paymentIntentSecret!, {
                            payment_method: stripePaymentMethod!.id
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
                        let message = "The payment was not successful. Please try again.";
                        if (result.error.message) {
                            message = result.error.message + "\n" + message;
                        }
                        const tkError = new TKError(message, undefined, true);
                        UIUtil.errorMsg(tkError);
                    } else {
                        let paidUrlWithInitiative = paidUrl!;
                        if (method === NetworkUtil.MethodType.GET && (selectedInitiative || selectedOrganizationId)) {
                            const paidUrlObj = new URL(paidUrlWithInitiative);
                            selectedInitiative && paidUrlObj.searchParams.set("initiativeID", selectedInitiative);
                            selectedOrganizationId && paidUrlObj.searchParams.set("organizationID", selectedOrganizationId);
                            paidUrlWithInitiative = paidUrlObj.toString();
                        }
                        handlePayResponse(TripGoApi.fetchAPI(paidUrlWithInitiative, { method, body }), onSubmit, setWaiting);
                    }
                } else {    // paymentOption.paymentMode === "EXTERNAL"
                    const stripe = await stripePromise;
                    if (!stripe || !stripePaymentMethod && !elements) {
                        // Stripe.js has not yet loaded.
                        // Make sure to disable form submission until Stripe.js has loaded.
                        return;
                    }
                    setWaiting?.(true);
                    if (!stripePaymentMethod) {
                        const payload = await stripe.createPaymentMethod({
                            type: "card",
                            card: elements!.getElement(CardElement)!
                        });
                        if (!payload.paymentMethod) { // Throw error
                            return;
                        }
                        stripePaymentMethod = payload.paymentMethod;
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
                    handlePayResponse(TripGoApi.fetchAPI(paymentOptionUrl!, { method, body: { ...body, paymentMethod: stripePaymentMethod.id } }), onSubmit, setWaiting);
                }
            }
        const checkoutForm = (
            <TKUICheckoutForm
                ephemeralKeyObj={internalPaymentOption ? ephemeralKeyObj : undefined}
                paymentOptions={paymentOptions!}
                initiativeField={bookingPaymentForm.initiative}
                onConfirmPayment={onConfirmPayment}
                onClose={onClose}
                setWaiting={setWaiting}
                {...remainingProps}
            />
        );
        if (internalPaymentOption) {
            if (!stripePromise || !paymentIntentSecret) {
                return null;
            }
            const options = {
                clientSecret: paymentIntentSecret
            };
            return (
                <Elements stripe={stripePromise} options={options}>
                    {checkoutForm}
                </Elements>
            );
        }
        return checkoutForm;
    }

const selectOptionJss = (theme: TKUITheme) => ({
    option: (props) => ({
        ...genStyles.flex,
        padding: '8px',
        ...genStyles.borderRadius(6),
        '&$selected': {
            backgroundColor: '#ebebeb'
        },
        '&$focused': {
            backgroundColor: black(4)
        },
        '& path, polygon': {
            fill: 'gray'
        }
    }),
    optionLeft: {
        ...genStyles.flex,
        ...genStyles.column
    },
    subtitle: {
        ...theme.textSizeCaption,
        ...theme.textColorGray
    },
    selected: {},
    focused: {}
});

export const InitiativeSelectOption = withStyles(props => {
    const { isFocused, isSelected, classes, data, innerProps } = props as any;
    const subtitleParts: string[] = [];
    if (data.option?.lastUsed) {
        subtitleParts.push("Last used " + DateTimeUtil.momentFromStringTZ(data.option.lastUsed, DateTimeUtil.defaultTZ).format(DateTimeUtil.dateFormat()));
    }
    if (data.walletName) {
        subtitleParts.push("From " + data.walletName + " wallet");
    }
    if (data.organization) {
        subtitleParts.push("From " + data.organization.name + " department");
    }
    if (data.option?.atUserProfile) {
        subtitleParts.push("At user profile");
    }
    return (
        <div className={classNames(classes.option,
            isSelected && classes.selected, !isSelected && isFocused && classes.focused)} {...innerProps}>
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'space-between' }}>
                <div className={classes.optionLeft}>
                    <div>
                        {data.label}
                    </div>
                    <div className={classes.subtitle}>
                        {subtitleParts.join(" ⋅ ")}
                    </div>
                </div>
                {data.option?.lastUsed && <IconRecent style={{ marginLeft: '10px' }} />}
            </div>
        </div>
    );
}, selectOptionJss);

interface CheckoutFormProps extends TKUIWithClasses<IStyle, IProps> {
    /**
     * If it is undefined, it means Stripe is not required.
     */
    ephemeralKeyObj?: EphemeralResult;
    paymentOptions: PaymentOption[];
    initiativeField?: BookingField;
    onConfirmPayment: (props: { paymentMethod: SGPaymentMethod, elements?: StripeElements, saveForFuture?: boolean, selectedInitiative?: string, selectedOrganizationId?: string }) => void;
    setWaiting?: (waiting: boolean) => void;
    onClose?: () => void;
    organizationOptions?: SelectOption[];
    defaultOrganizationOption?: SelectOption;
    defaultPaymentMethodFc?: (paymentMethods: SGPaymentMethod[]) => SGPaymentMethod | undefined;
}

const TKUICheckoutForm: React.FunctionComponent<CheckoutFormProps> =
    ({ ephemeralKeyObj, paymentOptions, initiativeField, onConfirmPayment, onClose, setWaiting, organizationOptions, defaultOrganizationOption, defaultPaymentMethodFc, t, classes, theme, injectedStyles }) => {
        const ephemeralKey = ephemeralKeyObj?.secret;
        const customerId = ephemeralKeyObj?.associated_objects[0]?.id;
        const elements = ephemeralKeyObj && useElements();
        const [newPaymentMethodAndPay, setNewPaymentMethodAndPay] = useState<boolean>(false);
        const [stripePaymentMethods, setStripePaymentMethods] = useState<PaymentMethod[] | undefined>(undefined);
        const [saveForFuture, setSaveForFuture] = useState<boolean>(true);
        // const [newCard, setNewCard] = useState<boolean>(true);
        const cardPaymentOption = paymentOptions.find(option => option.paymentMode === "INTERNAL");
        // organizationOptions = organizationOptions ?? [{ label: "Hospital A1", value: "48bb5fdd-448b-4706-8f36-b018ed1ca45d" }, { label: "Hospital A2", value: "f40cfc7a-d0e6-41dc-a73e-823214a35558" }];
        organizationOptions = organizationOptions ?? [];
        const paymentMethods = useMemo(() =>
            stripePaymentMethods && paymentOptions.reduce((pms: SGPaymentMethod[], option: PaymentOption) => {
                if (option.paymentMode === "INTERNAL") {
                    stripePaymentMethods.forEach(spm => {
                        pms.push({ paymentOption: option, data: { stripePaymentMethod: spm } });
                    })
                } else {
                    const paymentMethod: SGPaymentMethod = { paymentOption: option };
                    pms.push(paymentMethod);
                }
                return pms;
            }, [] as SGPaymentMethod[]),
            [stripePaymentMethods]);
        const [selectedMethod, setSelectedMethod] = useState<SGPaymentMethod | undefined>(undefined);
        const paymentMode = newPaymentMethodAndPay ? "INTERNAL" : selectedMethod?.paymentOption.paymentMode;
        const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

        const departmentOptions = useMemo(() =>
            [{ label: "None", value: "none" }, ...organizationOptions]
            , [organizationOptions]);

        const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(defaultOrganizationOption?.value);
        const selectedDepartment = (departmentOptions.find(option => option.value === selectedDepartmentId) as any)?.organization;

        useEffect(() => {
            if (paymentMode === "INVOICE") {
                if (selectedDepartment?.initiatives.length === 1) {
                    setSelectedInitiative(selectedDepartment.initiatives[0].id);
                } else {    // To contemplate the case where the organization changed, so need to reset the value.
                    setSelectedInitiative(undefined);
                }
            } else {
                setSelectedInitiative(newPaymentMethodAndPay ? cardPaymentOption?.preFilledInitiative : selectedMethod?.paymentOption.preFilledInitiative);
            }
        }, [paymentMode, selectedDepartment]); // The default initiative selection should be updated on any update of these data. 

        useEffect(() => {
            if (newPaymentMethodAndPay || (selectedMethod && selectedMethod.paymentOption.paymentMode !== "INVOICE" || selectedDepartmentId)) {
                setErrorMsg(undefined);
            }
        }, [selectedMethod, newPaymentMethodAndPay, selectedDepartmentId])

        useEffect(() => {
            // Initially select first payment option by default.
            if (paymentMethods && paymentMethods.length > 0 && !selectedMethod) {
                setSelectedMethod(defaultPaymentMethodFc?.(paymentMethods) ?? paymentMethods[0]);
            }
            // This will happen if removed the selected payment method.
            if (paymentMethods && selectedMethod && !paymentMethods.includes(selectedMethod)) {
                setSelectedMethod(paymentMethods.length > 0 ? paymentMethods[0] : undefined);
            }
        }, [paymentMethods]);

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
            if (!ephemeralKeyObj) {
                setStripePaymentMethods([]);
                return;
            }
            refreshData()
                .then(result => {
                    setStripePaymentMethods(result.data);
                    // result.data?.length > 0 && setSelectedPM(result.data[0]);
                });
        }, []);

        useEffect(() => {
            if (paymentMethods && paymentMethods.length === 0) {
                setNewPaymentMethodAndPay(true);
            }
        }, [paymentMethods]);

        const handleSubmit = async () => {
            if (!newPaymentMethodAndPay && selectedMethod!.paymentOption.paymentMode === "INVOICE" && !selectedDepartmentId) {
                setErrorMsg("You need to select an organization to invoice to");
                return;
            } else {
                setErrorMsg(undefined);
            }
            if (newPaymentMethodAndPay) {
                onConfirmPayment({ paymentMethod: { paymentOption: cardPaymentOption! }, elements: elements ?? undefined, saveForFuture, selectedInitiative, selectedOrganizationId: selectedDepartmentId });
            } else {
                onConfirmPayment({ paymentMethod: selectedMethod!, selectedInitiative, selectedOrganizationId: selectedDepartmentId });
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
                const updatedPMs = stripePaymentMethods!.filter(pm => pm !== value);
                setStripePaymentMethods(updatedPMs);
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
        //                             setStripePaymentMethods(result.data);
        //                             console.log(result.data)
        //                             // result.data && result.data.length > 0 && setSelectedPM(result.data.find(pm => pm.id === cardId))
        //                         });
        //                 }
        //             }}
        //         />
        //     );
        // }

        const sectionStyles = { sectionBody: overrideClass(injectedStyles.section), sectionTitle: overrideClass(injectedStyles.sectionTitle) };
        const imageSectionStyles = { sectionBody: overrideClass(injectedStyles.section), sectionTitle: overrideClass(injectedStyles.sectionTitle) };

        let review: ReactNode = null;
        if (selectedMethod || newPaymentMethodAndPay) {
            const paymentOption = newPaymentMethodAndPay ? cardPaymentOption! : selectedMethod!.paymentOption;
            let sponsorImgAlt;
            if (paymentOption.paymentMode === "WALLET") {
                const sponsorImgAltSentences: string[] = [];
                if (paymentOption.sponsorTitle) {
                    sponsorImgAltSentences.push(paymentOption.sponsorTitle);
                }
                if (paymentOption.sponsorDescription) {
                    sponsorImgAltSentences.push(paymentOption.sponsorDescription);
                }
                sponsorImgAlt = sponsorImgAltSentences.length === 0 ? undefined : sponsorImgAltSentences.join("\n");
            }
            review =
                <div className={classes.review}>
                    <TKUISettingSection styles={sectionStyles} title={paymentOption.paymentMode === "WALLET" ? "Balance" : undefined}>
                        {paymentOption.paymentMode === "WALLET" &&
                            <div className={classes.group}>
                                <div className={classes.label}>{"Current Balance"}</div>
                                <div className={classes.value}>{FormatUtil.toMoney(paymentOption.currentBalance!, { currency: paymentOption.currency, nInCents: true })}</div>
                            </div>}
                        {paymentOption.discountedPrice &&
                            <div className={classes.group}>
                                <div className={classes.label}>{"Discount"}</div>
                                <div className={classes.value}>{FormatUtil.toMoney(paymentOption.fullPrice - paymentOption.discountedPrice, { currency: paymentOption.currency, nInCents: true }) + " off"}</div>
                            </div>}
                        <div className={classes.group}>
                            <div className={classes.label}>{t("Price")}</div>
                            <div className={classNames(classes.value, classes.priceValue)}>
                                <div className={classes.actualPrice}>
                                    {FormatUtil.toMoney(paymentOption.discountedPrice ?? paymentOption.fullPrice, { currency: paymentOption.currency, nInCents: true })}
                                </div>
                                {paymentOption.discountedPrice &&
                                    <div className={classes.strikeThroughPrice}>
                                        {FormatUtil.toMoney(paymentOption.fullPrice, { currency: paymentOption.currency, nInCents: true })}
                                    </div>}
                            </div>
                        </div>
                        {paymentOption.paymentMode === "WALLET" &&
                            <div className={classes.group}>
                                <div className={classes.label}>{"New Balance"}</div>
                                <div className={classes.value}>{FormatUtil.toMoney(paymentOption.newBalance!, { currency: paymentOption.currency, nInCents: true })}</div>
                            </div>}
                    </TKUISettingSection>
                    {paymentOption.paymentMode === "WALLET" && paymentOption.sponsorImageURL &&
                        <TKUISettingSection styles={sectionStyles} title='Sponsored by'>
                            <img src={paymentOption.sponsorImageURL} alt={sponsorImgAlt} style={{ borderBottom: 'none' }} />
                            {paymentOption.sponsorDescription &&
                                <div className={classes.sponsorDescription}>
                                    {paymentOption.sponsorDescription}
                                </div>}
                        </TKUISettingSection>}
                </div>
        }

        const initiativeOptions = useMemo(() => {
            if (selectedMethod && initiativeField) {
                let result: any[] = [{ label: "None", value: "none" }];
                if (selectedMethod.paymentOption.paymentMode === "WALLET" && selectedMethod.paymentOption.preFilledInitiative) {
                    // Add walletName for that initiative option that corresponds to the prefilled initiative, and so, we know it's the wallet initiative.
                    const preFilledInitiativeOption = initiativeField.options!.find(option => option.id === selectedMethod.paymentOption.preFilledInitiative);
                    if (preFilledInitiativeOption) {
                        result = [
                            ...result,
                            { label: preFilledInitiativeOption.title, value: preFilledInitiativeOption.id, option: preFilledInitiativeOption, walletName: selectedMethod.paymentOption.walletName }
                        ];
                    }
                }
                if (selectedDepartment) {
                    result = [
                        ...result,
                        ...initiativeField.options!.filter(option => selectedDepartment.initiatives.some(initiative => initiative.id === option.id))
                            .map((option) => ({ label: option.title, value: option.id, option, organization: selectedDepartment }))
                    ];
                }
                result = [...result, ...initiativeField.options!.map(option => ({ label: option.title, value: option.id, option })).filter(option => !result.find(r => r.value === option.value))];
                result.sort((a, b) => {
                    if (a.value === "none") {
                        return -1;
                    }
                    if (b.value === "none") {
                        return 1;
                    }
                    if (a.walletName) {
                        return -1;
                    }
                    if (b.walletName) {
                        return 1;
                    }
                    if (a.organization && b.organization) {
                        return a.organization.name.localeCompare(b.organization.name);
                    }
                    if (a.organization) {
                        return -1;
                    }
                    if (b.organization) {
                        return 1;
                    }
                    if (a.option.lastUsed && b.option.lastUsed) {
                        return b.option.lastUsed.localeCompare(a.option.lastUsed);
                    }
                    if (a.option.lastUsed) {
                        return -1;
                    }
                    if (b.option.lastUsed) {
                        return 1;
                    }
                    if (a.option.atUserProfile) {
                        return -1;
                    }
                    if (b.option.atUserProfile) {
                        return 1;
                    }
                });
                return result;
            }
            return undefined;
        }, [selectedMethod, selectedDepartmentId]);
        const [selectedInitiative, setSelectedInitiative] = useState<string | undefined>(undefined);

        const tabsExisting_NewCard = paymentMethods && paymentMethods.length > 0 && ephemeralKeyObj &&
            <div className={classes.tabs}>
                <div className={!newPaymentMethodAndPay ? classes.tabSelected : undefined}>
                    <TKUIButton
                        type={TKUIButtonType.PRIMARY_LINK}
                        text={"Existing"}
                        onClick={() => {
                            setNewPaymentMethodAndPay(false);
                        }} />
                </div>
                <div className={classes.tabSeparator} />
                <div className={newPaymentMethodAndPay ? classes.tabSelected : undefined}>
                    <TKUIButton
                        type={TKUIButtonType.PRIMARY_LINK}
                        text={"New card"}
                        onClick={() => {
                            setNewPaymentMethodAndPay(true);
                        }} />
                </div>
            </div>;
        return (
            <Fragment>
                <div className={classes.main}>
                    <div className={classes.body}>
                        <TKUISettingSection styles={sectionStyles} title={paymentMethods && paymentMethods.length > 0 ? 'Select payment method' : undefined}>
                            <div className={classes.selectPaymentMethod}>
                                {tabsExisting_NewCard}
                                {newPaymentMethodAndPay ?
                                    <div className={classes.newPayment}>
                                        <IconCard className={classes.card} />
                                        <CardElement className={classes.cardElement} />
                                        <div className={classes.futurePayment}>
                                            <TKUICheckbox
                                                checked={saveForFuture}
                                                onChange={e => setSaveForFuture(e.target.checked)}
                                                theme={theme}
                                            />
                                            Save for future payments
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        {paymentMethods && selectedMethod &&
                                            <TKUIPaymentMethodSelect
                                                value={selectedMethod}
                                                options={paymentMethods}
                                                onChange={setSelectedMethod}
                                                onRemove={onRemovePM}
                                            />}
                                    </div>}
                            </div>
                        </TKUISettingSection>
                        {organizationOptions &&
                            <TKUISettingSection styles={sectionStyles} title={"Select department"}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className={classes.group} style={{ ...genStyles.justifyStart }}>
                                        <div className={classes.label}>Department</div>
                                        <div className={classNames(classes.value, classes.initiativeValue)} style={{ marginLeft: '30px' }}>
                                            <TKUISelect
                                                options={departmentOptions}
                                                value={departmentOptions.find(option => option.value === (selectedDepartmentId ?? "none"))}
                                                onChange={(option) => {
                                                    setSelectedDepartmentId(option?.value === "none" ? undefined : option?.value);
                                                }}
                                                placeholder={"Select department"}
                                                isDisabled={false}
                                            />
                                        </div>
                                    </div>
                                    {errorMsg &&
                                        <div className={classes.error}>{errorMsg}</div>}
                                </div>
                            </TKUISettingSection>}
                        {initiativeOptions &&
                            <TKUISettingSection styles={sectionStyles} title={"Select initiative"}>
                                <div className={classes.group} style={{ ...genStyles.justifyStart }}>
                                    <div className={classes.label}>Initiative</div>
                                    <div className={classNames(classes.value, classes.initiativeValue)} style={{ marginLeft: '30px' }}>
                                        <TKUISelect
                                            options={initiativeOptions}
                                            value={initiativeOptions.find(option => option.value === (selectedInitiative ?? "none"))}
                                            onChange={(option) => {
                                                setSelectedInitiative(option?.value === "none" ? undefined : option?.value);
                                            }}
                                            placeholder="Select initiative"
                                            components={{
                                                Option: InitiativeSelectOption
                                            }}
                                        />
                                    </div>
                                </div>
                            </TKUISettingSection>}
                        {review}
                    </div>
                    <div className={classes.buttonsPanel}>
                        {onClose &&
                            <TKUIButton
                                text={t("Back")}
                                type={TKUIButtonType.SECONDARY}
                                onClick={() => onClose()}
                            />}
                        <TKUIButton
                            text={"Purchase"}
                            type={TKUIButtonType.PRIMARY}
                            disabled={!newPaymentMethodAndPay && !selectedMethod}
                            onClick={handleSubmit}
                            name={"confirm-payment-btn"}
                        />
                    </div>
                </div>
            </Fragment>

        )
    }

export default connect((config: TKUIConfig) => config.TKUICheckoutView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));