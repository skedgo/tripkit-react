import React from 'react';
import { useElements, CardElement, useStripe } from '@stripe/react-stripe-js';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { overrideClass, TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { TKUITheme } from '../jss/TKUITheme';
import genStyles from '../css/GenStyle.css';
import NetworkUtil from '../util/NetworkUtil';
import EphemeralResult from '../model/payment/EphemeralResult';
import TKUICard, { CardPresentation } from '../card/TKUICard';
import { TKUIViewportUtil } from '../util/TKUIResponsiveUtil';

const tKUINewCardViewPropsDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    buttonsPanel: {
        marginTop: 'auto',
        display: 'flex',
        ...genStyles.justifyEnd,
        '&>*:not(:first-child)': {
            marginLeft: '20px'
        }
    }
});

type IStyle = ReturnType<typeof tKUINewCardViewPropsDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    onRequestClose?: (cardId?: string) => void;
    // publicKey: string;
    // paymentOption: PaymentOption;
    ephemeralKeyObj: EphemeralResult;
    // onClose: (success?: boolean) => void;
    // setWaiting: (waiting: boolean) => void;
}

const TKUINewCardView: React.FunctionComponent<IProps> =
    ({ ephemeralKeyObj, onRequestClose, t, classes, theme }) => {
        const stripe = useStripe();
        const elements = useElements();
        const handleAdd = async event => {
            // event.preventDefault();
            if (!stripe || !elements) {
                // Stripe.js has not loaded yet. Make sure to disable
                // form submission until Stripe.js has loaded.
                return;
            }
            const payload = await stripe.createPaymentMethod({
                type: "card",
                card: elements.getElement(CardElement)!
            });
            console.log("[PaymentMethod]", payload);
            if (!payload.paymentMethod) {
                return;
            }
            const response = await fetch(`https://api.stripe.com/v1/payment_methods/${payload.paymentMethod.id}/attach`, {
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
            console.log(response);
            onRequestClose?.(payload.paymentMethod?.id);

            // // Trying the SetupIntent flow
            // const setupIntent = stripe.confirmSetup({   // IntegrationError: Invalid value for stripe.confirmSetup(): elements should have a mounted Payment Element
            //     elements,
            //     redirect: 'if_required'
            // })
            // console.log("[SetupIntent]", setupIntent);
            // // If the above actually creates a SetupIntent, then I need to pass it's client secret to the following method. 
            // const payload = await stripe.confirmCardSetup(`${ephemeralKeyObj.associated_objects[0]?.id}_secret_${ephemeralKeyObj.secret}`, {
            //     payment_method: {
            //         card: elements.getElement(CardElement)!
            //         // billing_details: {
            //         //     name: 'Jenny Rosen',
            //         // },
            //     },
            // })
            // console.log("[PaymentMethod]", payload);
            // onRequestClose?.(payload.setupIntent?.payment_method ?? undefined);
        };
        return (
            <TKUIViewportUtil>
                {(viewportProps) =>
                    <TKUICard
                        title={"New Card"}
                        onRequestClose={onRequestClose}
                        presentation={viewportProps.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                        slideUpOptions={{ draggable: false }}
                        focusTrap={false}   // Since this causes confirmAlert buttons to be un-clickable.
                        styles={{
                            modalContent: overrideClass({
                                width: '800px'
                            })
                        }}
                    >
                        <CardElement onChange={e => console.log(e.value)} />
                        <div className={classes.buttonsPanel}>
                            <TKUIButton
                                text={t("Back")}
                                type={TKUIButtonType.SECONDARY}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onRequestClose?.();
                                }}
                            />
                            <TKUIButton
                                text={t("add")}
                                type={TKUIButtonType.PRIMARY}
                                disabled={false}
                                onClick={handleAdd}
                            />
                        </div>
                    </TKUICard>}
            </TKUIViewportUtil>
        );
    }

export default withStyles(TKUINewCardView, tKUINewCardViewPropsDefaultStyle);