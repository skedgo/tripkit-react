import React, { useState, useEffect, Fragment, useContext, Key } from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Segment from "../model/trip/Segment";
import TKUICard from "../card/TKUICard";
import TripGoApi from "../api/TripGoApi";
import { tKUIMxMBookingCardDefaultStyle } from "./TKUIMxMBookingCard.css";
import DateTimeUtil from "../util/DateTimeUtil";
import Util from "../util/Util";
import BookingInfo, { BookingField, BookingFieldOption } from "../model/trip/BookingInfo";
import TKUISelect, { SelectOption } from "../buttons/TKUISelect";
import TKUIButton from "../buttons/TKUIButton";
import NetworkUtil from "../util/NetworkUtil";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import { Styles } from "react-jss";
import { Classes } from "jss";
import { ReactComponent as IconNote } from '../images/ic-note.svg';
import { ReactComponent as IconPerson } from '../images/ic-person-circle.svg';
import { ReactComponent as IconShuttle } from '../images/ic-shuttle-circle.svg';
import TKUIErrorView from "../error/TKUIErrorView";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";
import TKUIFromTo from "../booking/TKUIFromTo";
import TKUIBookingActions from "../booking/TKUIBookingActions";
import { TKError } from "../error/TKError";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import Trip from '../model/trip/Trip';
import UIUtil from '../util/UIUtil';
import FormatUtil from '../util/FormatUtil';
import TKUIDateTimePicker from '../time/TKUIDateTimePicker';
import TKUITicketSelect from '../stripekit/TKUITicketSelect';
import classNames from 'classnames';
import { TKUIConfigContext } from '../config/TKUIConfigProvider';
import BookingReview from '../model/trip/BookingReview';
import { TKUIStripePaymentCardClientProps } from '../stripekit/TKUIStripePaymentCard';
import { SignInStatus, TKAccountContext } from '../account/TKAccountContext';
import TKUIBookingInputForm from '../booking/TKUIBookingInputForm';

type IStyle = ReturnType<typeof tKUIMxMBookingCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    onRequestClose?: () => void;
    refreshSelectedTrip: () => Promise<boolean>;
    onSuccess?: (bookingTripUpdateURL: string) => void;
    trip?: Trip;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIMxMBookingCardProps = IProps;
export type TKUIMxMBookingCardStyle = IStyle;
export type TKUIBookingCardClientProps = IClientProps & { key?: Key };

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMBookingCard {...props} />,
    styles: tKUIMxMBookingCardDefaultStyle,
    classNamePrefix: "TKUIMxMBookingCard"
};

const canBook = (bookingInfo: BookingInfo) =>
    bookingInfo.input.every((field: BookingField) => !field.required || field.value || (field.values && field.values.length > 0))
    && (!bookingInfo.tickets || bookingInfo.tickets.length === 0 || bookingInfo.tickets.some(ticket => ticket.value > 0));

let segmentGlobal;

const TKUIMxMBookingCard: React.FunctionComponent<IProps> = ({ segment, trip, onRequestClose, onSuccess, refreshSelectedTrip, classes, injectedStyles, t }) => {
    const booking = segment.booking!;
    segmentGlobal = segment;
    const confirmation = booking.confirmation;
    const [requestBookingForm, setRequestBookingForm] = useState<BookingInfo | undefined>(undefined);
    const [reviewAndPaymentForm, setReviewAndPaymentForm] =
        useState<Pick<TKUIStripePaymentCardClientProps, "paymentOptions" | "reviews" | "publicKey" | "ephemeralKeyObj"> | undefined>(undefined);
    const [waiting, setWaiting] = useState<boolean>(!confirmation);
    const [error, setError] = useState<TKError | undefined>(undefined);
    const config = useContext(TKUIConfigContext);
    const { status } = useContext(TKAccountContext);
    useEffect(() => {
        if (!confirmation && status === SignInStatus.signedIn) {
            const bookingInfosUrl = booking.quickBookingsUrl!;
            TripGoApi.apiCallUrl(bookingInfosUrl, "GET")
                .then((bookingsInfoJsonArray) => {
                    const bookingsInfo = bookingsInfoJsonArray.map(infoJson => Util.deserialize(infoJson, BookingInfo));
                    setRequestBookingForm(bookingsInfo[0]);
                    // Environment.isLocal() && setRequestBookingForm(Util.deserialize(require("../tmp/tickets.json")[0], BookingInfo));
                    setWaiting(false);
                })
                .catch((e) => setError(e))
                .finally(() => setWaiting(false));
        }
    }, [status]);
    let content;
    if (confirmation) {
        const status = confirmation.status!;
        content = (
            <Fragment>
                <div className={classes.status}>
                    <div className={classes.statusInfo}>
                        <div className={classes.statusTitle}>
                            {status.title}
                        </div>
                        {status.subtitle}
                    </div>
                    <img src={status.imageURL} className={classes.statusImg} />
                </div>
                <div className={classes.service}>
                    <div className={classes.serviceImages}>
                        <IconPerson className={classes.iconPerson} />
                        <IconShuttle className={classes.iconShuttle} />
                    </div>
                    {confirmation.vehicle &&
                        <div className={classes.vehicle}>
                            <div className={classes.title}>{confirmation.vehicle.title}</div>
                            <div className={classes.subtitle}>{confirmation.vehicle.subtitle}</div>
                        </div>}
                    {confirmation.provider &&
                        <div className={classes.provider}>
                            <div className={classes.title}>{confirmation.provider.title}</div>
                            <a href={"tel:" + confirmation.provider.subtitle} className={classes.subtitle}>
                                {confirmation.provider.subtitle}
                            </a>
                        </div>}
                    {confirmation.purchase &&
                        <div className={classes.price}>{FormatUtil.toMoney(confirmation.purchase.price, { currency: confirmation.purchase.currency ? confirmation.purchase.currency + " " : undefined, forceDecimals: true })}</div>}
                </div>
                <div className={classes.bookingFormMain}>
                    {confirmation.tickets && confirmation.tickets?.length > 0 &&
                        <div className={classNames(classes.group, classes.divider)}>
                            <TKUITicketSelect
                                tickets={confirmation.tickets}
                            />
                        </div>}
                    <TKUIBookingInputForm
                        inputFields={confirmation.input}                        
                        segment={segment}
                    />
                    {confirmation.notes &&
                        <div className={classes.group}>
                            <div className={classes.icon}>
                                <IconNote />
                            </div>
                            <div className={classes.groupRight} style={{ minWidth: 0 }}>
                                <div className={classes.label}>
                                    Notes from operator
                                </div>
                                <div className={classes.value}>
                                    {confirmation.notes.map((note, i) => (
                                        <div className={classes.note} key={i}>
                                            <div className={classes.noteText}>
                                                {note.text}
                                            </div>
                                            <div className={classes.noteFooter}>
                                                <div className={classes.noteProvider}>{note.provider}</div>
                                                <div className={classes.noteTime}>{DateTimeUtil.formatRelativeDay(DateTimeUtil.moment(note.timestamp),
                                                    DateTimeUtil.dayMonthFormat() + ", YYYY") +
                                                    " at " + DateTimeUtil.moment(note.timestamp).format(DateTimeUtil.timeFormat())}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>}
                </div>
                {confirmation.actions.length > 0 &&
                    <TKUIBookingActions
                        actions={confirmation.actions}
                        setWaiting={setWaiting}
                        requestRefresh={() => refreshSelectedTrip().then(() => { })}
                        trip={trip}
                    />}
            </Fragment>
        )
    } else if (requestBookingForm) {
        content = (
            <div className={classes.bookingFormMain}>
                <div className={classes.fromTo}>
                    <TKUIFromTo
                        from={segment.from}
                        to={segment.to}
                        startTime={segment.startTime}
                        endTime={segment.endTime}
                    />
                </div>
                {requestBookingForm.tickets && requestBookingForm.tickets?.length > 0 &&
                    <Fragment>
                        <div className={classes.separator} />
                        <TKUITicketSelect
                            tickets={requestBookingForm.tickets}
                            onChange={update => setRequestBookingForm(Util.iAssign(requestBookingForm, { tickets: update }))}
                        />
                    </Fragment>}
                {requestBookingForm.input.length > 0 &&
                    <Fragment>
                        <div className={classes.separator} />
                        <TKUIBookingInputForm
                            inputFields={requestBookingForm.input}
                            onChange={update => setRequestBookingForm(Util.iAssign(requestBookingForm, { input: update }))}
                            segment={segment}
                        />
                    </Fragment>}
                <div className={classes.separator} />
                <TKUIButton
                    text={t("Book")}
                    onClick={() => {
                        setWaiting(true);
                        TripGoApi.apiCallUrl(requestBookingForm.bookingURL, NetworkUtil.MethodType.POST, Util.serialize(requestBookingForm))
                            // For testing without performing booking.
                            // Promise.resolve({ "type": "bookingForm", "action": { "title": "Done", "done": true }, "refreshURLForSourceObject": "https://lepton.buzzhives.com/satapp/booking/v1/2c555c5c-b40d-481a-89cc-e753e4223ce6/update" })
                            .then(result => {
                                if (result.paymentOptions && result.review) {
                                    setReviewAndPaymentForm({
                                        paymentOptions: result.paymentOptions,
                                        reviews: Util.jsonConvert().deserializeArray(result.review, BookingReview),
                                        publicKey: result.publishableApiKey,
                                        ephemeralKeyObj: result.ephemeralKey
                                    });
                                } else { // result is a booking form:                                    
                                    if (result.form?.[0]?.fields?.[0]?.value?.toUpperCase() !== "PENDING_CHANGES") {
                                        onSuccess?.(result.refreshURLForSourceObject);
                                    }
                                    // Workaround for (selected) trip with empty ("") updateUrl.
                                    if (trip && !trip.updateURL) {
                                        trip.updateURL = result.refreshURLForSourceObject;
                                    }
                                    return refreshSelectedTrip();
                                }
                            })
                            .catch(UIUtil.errorMsg)
                            .finally(() => setWaiting(false))
                    }}
                    disabled={!canBook(requestBookingForm)}
                />
            </div>
        );
    }
    const reviewAndPaymentUI = reviewAndPaymentForm && config.payment?.renderPaymentCard({
        ...reviewAndPaymentForm,
        publicKey: reviewAndPaymentForm.publicKey ?? config.payment.stripePublicKey,
        onRequestClose: success => {
            if (success) {
                setWaiting?.(true);
                refreshSelectedTrip()
                    .catch(UIUtil.errorMsg)
                    .finally(() => {
                        const bookingUrl = segmentGlobal.booking?.confirmation?.actions.find(action => action.type === "CANCEL")?.internalURL;
                        bookingUrl && onSuccess?.(bookingUrl);
                        setWaiting?.(false);
                    });
            }
            setReviewAndPaymentForm(undefined);
        }
    });
    return (
        <TKUICard
            title={segment.getAction()}
            subtitle={segment.to.getDisplayString()}
            onRequestClose={onRequestClose}
            renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props} />}
            styles={{
                main: overrideClass({ height: '100%', position: 'relative' })
            }}
            key={segment.id}
            slideUpOptions={{
                showHandle: true
            }}
        >
            {error && <TKUIErrorView error={error} />}
            {content}
            {reviewAndPaymentUI}
            {waiting &&
                <div className={classes.loadingPanel}>
                    <IconSpin className={classes.iconLoading} focusable="false" role="status" aria-label="Waiting results" />
                </div>}
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUIMxMBookingCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));