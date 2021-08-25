import React, {useState, useEffect, Fragment} from 'react';
import {overrideClass, TKUIWithClasses, withStyles} from "../jss/StyleHelper";
import Segment from "../model/trip/Segment";
import TKUICard from "../card/TKUICard";
import TripGoApi from "../api/TripGoApi";
import {tKUIMxMBookingCardDefaultStyle} from "./TKUIMxMBookingCard.css";
import DateTimeUtil from "../util/DateTimeUtil";
import Util from "../util/Util";
import BookingInfo, {BookingField, BookingFieldOption} from "../model/trip/BookingInfo";
import TKUISelect, {SelectOption} from "../buttons/TKUISelect";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import NetworkUtil from "../util/NetworkUtil";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import {ClassNameMap, Styles} from "react-jss";
import {ReactComponent as IconClock} from '../images/ic-clock.svg';
import {TKError} from "..";
import TKUIErrorView from "../error/TKUIErrorView";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";

type IStyle = ReturnType<typeof tKUIMxMBookingCardDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    segment: Segment;
    onRequestClose: () => void;
    refreshSelectedTrip: () => Promise<boolean>;
}

const canBook = (bookingInfo: BookingInfo) =>
    bookingInfo.input.every((field: BookingField) => !field.required || field.value || (field.values && field.values.length > 0));

interface BookingInputProps {
    inputFields: BookingField[];
    onChange?: (update: BookingField[]) => void;
    classes: ClassNameMap<keyof IStyle>;
    injectedStyles: Styles<keyof IStyle, IProps>;
}

const BookingInput: React.SFC<BookingInputProps> =
    ({inputFields, onChange, classes, injectedStyles}) => {
        const readonly = !onChange;
        return (
            <Fragment>
                {inputFields.map((inputField, i) => {
                    let valueElem: React.ReactNode = undefined;
                    const changeHandler = valueUpdate => {
                        const inputFieldsUpdate = inputFields.slice();
                        const fieldUpdate = Util.clone(inputFields[i]);
                        inputFieldsUpdate[i] = fieldUpdate;
                        if (Array.isArray(valueUpdate)) {
                            fieldUpdate.values = valueUpdate;
                        } else {
                            fieldUpdate.value = valueUpdate;
                        }
                        onChange!(inputFieldsUpdate);
                    };
                    if (inputField.type === "SINGLE_CHOICE") {
                        valueElem = readonly ?
                            inputField.value
                            :
                            <TKUISelect
                                options={inputField.options.map((option: BookingFieldOption) => ({
                                    value: option.id,
                                    label: option.title
                                }))}
                                styles={() => ({
                                    main: overrideClass(injectedStyles.optionSelect),
                                    menu: overrideClass({marginTop: '2px'})
                                })}
                                onChange={update => changeHandler(update.value)}
                            />;
                    } else if (inputField.type === "MULTIPLE_CHOICE") {
                        valueElem = readonly ?
                            inputField.values!.map((value, i) => <div key={i}>{Util.camelCaseToSpaced(value)}</div>)
                            :
                            <TKUISelect
                                options={inputField.options.map((option: BookingFieldOption) => ({
                                    value: option.id,
                                    label: option.title
                                }))}
                                isMulti
                                styles={() => ({
                                    main: overrideClass(injectedStyles.optionSelect),
                                    menu: overrideClass({marginTop: '2px'})
                                })}
                                onChange={(update: SelectOption[]) => // update is null if no option is selected.
                                    changeHandler((update || []).map(option => option.value))}
                            />;
                    } else if (inputField.type === "LONG_TEXT") {
                        valueElem = readonly ?
                            inputField.value || "None provided"
                            :
                            <textarea
                                placeholder={inputField.title}
                                onChange={e => changeHandler(e.target.value)}
                            />
                    }
                    return (
                        <div className={classes.group} key={i}>
                            <div className={classes.icon}>
                                <IconClock/>
                            </div>
                            <div className={classes.groupRight}>
                                <div className={classes.label}>
                                    {inputField.title}
                                    {!readonly && inputField.required &&
                                    <div className={classes.required}>required</div>}
                                </div>
                                <div className={readonly ? classes.value : classes.input}>
                                    {valueElem}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Fragment>)
    };

const TKUIMxMBookingCard: React.SFC<IProps> = ({segment, onRequestClose, refreshSelectedTrip, classes, injectedStyles}) => {
    const booking = segment.booking!;
    const confirmation = booking.confirmation;
    const [requestBookingForm, setRequestBookingForm] = useState<BookingInfo | undefined>(undefined);
    const [waiting, setWaiting] = useState<boolean>(!confirmation);
    const [error, setError] = useState<TKError | undefined>(undefined);
    useEffect(() => {
        if (!confirmation) {
            const bookingInfosUrl = booking.quickBookingsUrl!;
            TripGoApi.apiCallUrl(bookingInfosUrl, "GET")
                .then((bookingsInfoJsonArray) => {
                    const bookingsInfo = bookingsInfoJsonArray.map(infoJson => Util.deserialize(infoJson, BookingInfo));
                    console.log(bookingsInfo);
                    setRequestBookingForm(bookingsInfo[0]);
                    setWaiting(false);
                })
                .catch((e) => setError(e))
                .finally(() => setWaiting(false));
        }
    }, []);
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
                    <img src={status.imageURL} className={classes.statusImg}/>
                </div>
                <div className={classes.bookingFormMain}>
                    <BookingInput
                        inputFields={confirmation.input}
                        classes={classes}
                        injectedStyles={injectedStyles}
                    />
                </div>
                {confirmation.actions.length > 0 &&
                <div className={classes.actions}>
                    {confirmation.actions.map((action, i) =>
                        <TKUIButton
                            text={action.title}
                            type={TKUIButtonType.PRIMARY_LINK}
                            onClick={() => {
                                if (action.internalURL) {
                                    setWaiting(true);
                                    TripGoApi.apiCallUrl(action.internalURL, NetworkUtil.MethodType.GET)
                                        .then(refreshSelectedTrip)
                                        .catch((e) => setError(e))
                                        .finally(() => setWaiting(false));
                                }
                            }}
                            key={i}
                        />)}
                </div>}
            </Fragment>
        )
    } else if (requestBookingForm) {
        content = (
            <div className={classes.bookingFormMain}>
                <div className={classes.startTime}>
                    {DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone)
                        .format(DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat())}
                </div>
                <div className={classes.form}>
                    <div className={classes.group}>
                        <div className={classes.fromToTrack}>
                            <div className={classes.circle}/>
                            <div className={classes.line}/>
                            <div className={classes.circle}/>
                        </div>
                        <div className={classes.groupRight}>
                            <div className={classes.label} style={{marginTop: 0}}>
                                Pickup
                            </div>
                            <div className={classes.value} style={{marginTop: 0, marginBottom: 10}}>
                                {segment.from.getDisplayString()}
                            </div>
                            <div className={classes.label}>
                                Drop off
                            </div>
                            <div className={classes.value}>
                                {segment.to.getDisplayString()}
                            </div>
                        </div>
                    </div>
                    <BookingInput
                        inputFields={requestBookingForm.input}
                        onChange={(inputUpdate) =>
                            setRequestBookingForm(Util.iAssign(requestBookingForm, {input: inputUpdate}))}
                        classes={classes}
                        injectedStyles={injectedStyles}
                    />
                    <TKUIButton
                        text={"Book"}
                        onClick={() => {
                            setWaiting(true);
                            TripGoApi.apiCallUrl(requestBookingForm.bookingURL, NetworkUtil.MethodType.POST, Util.serialize(requestBookingForm))
                                .then(refreshSelectedTrip)
                                .catch((e) => setError(e))
                                .finally(() => setWaiting(false))
                        }}
                        disabled={!canBook(requestBookingForm)}
                    />
                </div>
            </div>
        );
    }
    return (
        <TKUICard
            title={segment.getAction()}
            subtitle={segment.to.getDisplayString()}
            onRequestClose={onRequestClose}
            renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props}/>}
            styles={{
                main: overrideClass({ height: '100%', position: 'relative'})
            }}
            key={segment.id}
        >
            {error && <TKUIErrorView error={error}/>}
            {content}
            {waiting &&
            <div className={classes.loadingPanel}>
                <IconSpin className={classes.iconLoading} focusable="false" role="status" aria-label="Waiting results"/>
            </div>}
        </TKUICard>
    );
};

export default withStyles(TKUIMxMBookingCard, tKUIMxMBookingCardDefaultStyle);