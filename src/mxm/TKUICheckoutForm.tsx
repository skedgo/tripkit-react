import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { black, TKUITheme } from '../jss/TKUITheme';
import genStyles from '../css/GenStyle.css';
import TKUIPaymentMethodSelect from '../payment/TKUIPaymentMethodSelect';
import TripGoApi from '../api/TripGoApi';
import Environment from '../env/Environment';
import NetworkUtil from '../util/NetworkUtil';
import EphemeralResult from '../model/payment/EphemeralResult';
import { PaymentMethod } from '@stripe/stripe-js/types/api/payment-methods';
import { ReactComponent as IconCard } from "../images/payment/ic-creditcard-big.svg";
import classnames from 'classnames';
import { withStyles as muiWithStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';

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
        margin: '15px 0 25px'
    },
    newSelected: {
        '& button:first-child': {
            color: black(1)
        },
        '& button:first-child:hover': {
            color: theme.colorPrimary,
            opacity: '.65'
        }
    },
    existingSelected: {
        '& button:last-child': {
            color: black(1)
        },
        '& button:last-child:hover': {
            color: theme.colorPrimary,
            opacity: '.65'
        }
    },
    tabSeparator: {
        borderLeft: '1px solid ' + black(2),
        margin: '0 10px'
    }
});

type IStyle = ReturnType<typeof tKUICheckoutFormPropsDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    paymentIntentSecret: string;
    onClose: (success?: boolean) => void;
    setWaiting: (waiting: boolean) => void;
}

const TKUICheckoutForm: React.FunctionComponent<IProps> =
    ({ paymentIntentSecret, onClose, setWaiting, t, classes, theme }) => {
        const stripe = useStripe();
        const elements = useElements();
        const [newPaymentMethod, setNewPaymentMethod] = useState<boolean>(false);
        const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | undefined>(undefined);
        const [selectedPM, setSelectedPM] = useState<PaymentMethod | undefined>(undefined);
        const [saveForFuture, setSaveForFuture] = useState<boolean>(true);
        const [ephemeralKey, setEphemeralKey] = useState<string | undefined>(undefined);

        useEffect(() => {
            TripGoApi.apiCall(`payment/ephemeral-key?stripe-api-version=2020-08-27${Environment.isBeta() ? "&psb=true" : ""}`, NetworkUtil.MethodType.GET)
                .then((result: EphemeralResult) => {
                        setEphemeralKey(result.secret);
                        return fetch(`https://api.stripe.com/v1/customers/${result.associated_objects[0].id}/payment_methods?type=card`, {
                            method: 'get',
                            headers: new Headers({
                                'Accept': 'application/json',
                                'Authorization': `Bearer ${result.secret}`,
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Stripe-Version': '2020-08-27'
                            })
                        });
                    }
                )
                .then(NetworkUtil.jsonCallback)
                .then(result => {
                    setPaymentMethods(result.data);
                    result.data?.length > 0 && setSelectedPM(result.data[0]);
                });
        }, []);

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
            let result;
            if (newPaymentMethod) {
                result = await stripe.confirmPayment({
                    //`Elements` instance that was used to create the Payment Element
                    elements,
                    confirmParams: {
                        return_url: "https://example.com/order/123/complete",
                        save_payment_method: saveForFuture,
                        // setup_future_usage: "on_session" // See if I need also this.   
                    },
                    redirect: 'if_required'
                });
            } else {
                result = stripe.confirmCardPayment(paymentIntentSecret, {
                    payment_method: selectedPM!.id                    
                })
            }
            if (result.error) {
                // Show error to your customer (for example, payment details incomplete)
                console.log(result.error.message);
                setWaiting(false);
            } else {
                onClose(true);
            }
        };

        return (
            <form onSubmit={handleSubmit} className={classes.main}>
                <div className={classes.body}>
                    <IconCard className={classes.card} />
                    <div className={classnames(classes.tabs, newPaymentMethod ? classes.newSelected : classes.existingSelected)}>
                        <TKUIButton
                            type={TKUIButtonType.PRIMARY_LINK}
                            text={"Existing payment method"}
                            onClick={e => {
                                e.preventDefault();
                                setNewPaymentMethod(false);
                            }}
                        />
                        <div className={classes.tabSeparator} />
                        <TKUIButton
                            type={TKUIButtonType.PRIMARY_LINK}
                            text={"New payment method"}
                            onClick={e => {
                                e.preventDefault();
                                setNewPaymentMethod(true);
                            }}
                        />
                    </div>
                    {newPaymentMethod ?
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
                        paymentMethods && selectedPM ?
                            <TKUIPaymentMethodSelect
                                value={selectedPM}
                                options={paymentMethods}
                                onChange={value => setSelectedPM(value)}
                            />
                            : null}
                </div>
                <div className={classes.buttonsPanel}>
                    <TKUIButton
                        text={t("Back")}
                        type={TKUIButtonType.SECONDARY}
                        onClick={(e) => {
                            e.preventDefault();
                            if (newPaymentMethod) {
                                setNewPaymentMethod(false);
                            } else {
                                onClose();
                            }
                        }}
                    />
                    <TKUIButton
                        text={t("Confirm")}
                        type={TKUIButtonType.PRIMARY}
                        disabled={!stripe || !newPaymentMethod && !selectedPM}
                    />
                </div>
            </form>
        )
    }

export default withStyles(TKUICheckoutForm, tKUICheckoutFormPropsDefaultStyle);