import React, { useState } from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { tKUIStripePaymentCardDefaultStyle } from "./TKUIStripePaymentCard.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import PaymentOption from '../model/trip/PaymentOption';
import TKLoading from '../card/TKLoading';
import BookingReview from '../model/trip/BookingReview';
import TKUIBookingReview from './TKUIBookingReview';
import TKUICheckoutView from './TKUICheckoutView';
import { TKUIViewportUtil } from '../util/TKUIResponsiveUtil';
import EphemeralResult from '../model/payment/EphemeralResult';
import TripGoApi from '../api/TripGoApi';
import UIUtil from '../util/UIUtil';


type IStyle = ReturnType<typeof tKUIStripePaymentCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    paymentOptions: PaymentOption[];
    reviews: BookingReview[];
    onRequestClose: (success: boolean) => void;
    publicKey?: string;
    ephemeralKeyObj?: EphemeralResult;
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



const TKUIStripePaymentCard: React.FunctionComponent<IProps> = ({ onRequestClose, paymentOptions, reviews, ephemeralKeyObj, classes, t, publicKey }) => {
    const [paymentOption, setPaymentOption] = useState<PaymentOption | undefined>(undefined);
    const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
    const [waiting, setWaiting] = useState<boolean>(false);
    const title = showPaymentForm ? "Payment" : "Review booking";
    const onPayOption = (payOption: PaymentOption) => {
        if (payOption.paymentMode === "FREE") {
            setWaiting(true);
            TripGoApi.apiCallUrl(payOption.url, payOption.method)
                .then(() => onRequestClose(true))
                .catch(UIUtil.errorMsg)
                .finally(() => setWaiting(false));
            return;
        }
        setPaymentOption(payOption);
        setShowPaymentForm(true)
    };
    return (
        <TKUIViewportUtil>
            {(viewportProps) =>
                <TKUICard
                    title={title}
                    onRequestClose={() => onRequestClose(false)}
                    presentation={viewportProps.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                    slideUpOptions={{ draggable: false }}
                    focusTrap={true}
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
                        {showPaymentForm && paymentOption && publicKey && ephemeralKeyObj &&
                            <TKUICheckoutView
                                publicKey={publicKey}
                                paymentOption={paymentOption}
                                setWaiting={setWaiting}
                                ephemeralKeyObj={ephemeralKeyObj}
                                onClose={success => {
                                    if (!success) {
                                        setShowPaymentForm(false);
                                    } else {
                                        onRequestClose(true);
                                    }
                                }}
                            />}
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