import React, { useState, useEffect, Fragment } from 'react';
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
import { ReactComponent as IconMobilityOptions } from '../images/ic-mobility-options.svg';
import { ReactComponent as IconFlag } from '../images/ic-flag.svg';
import { ReactComponent as IconEdit } from '../images/ic-edit.svg';
import { ReactComponent as IconEditNote } from '../images/ic-add-note.svg';
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
import TKUITicketSelect from './TKUITicketSelect';
import classNames from 'classnames';

type IStyle = ReturnType<typeof tKUIMxMBookingCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    onRequestClose: () => void;
    refreshSelectedTrip: () => Promise<boolean>;
    onSuccess?: (bookingTripUpdateURL: string) => void;
    trip?: Trip;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIMxMBookingCardProps = IProps;
export type TKUIMxMBookingCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMBookingCard {...props} />,
    styles: tKUIMxMBookingCardDefaultStyle,
    classNamePrefix: "TKUIMxMBookingCard"
};

const canBook = (bookingInfo: BookingInfo) =>
    bookingInfo.input.every((field: BookingField) => !field.required || field.value || (field.values && field.values.length > 0))
    && (!bookingInfo.tickets || bookingInfo.tickets.length === 0 || bookingInfo.tickets.some(ticket => ticket.value > 0));

interface BookingInputProps {
    inputFields: BookingField[];
    onChange?: (update: BookingField[]) => void;
    classes: Classes<keyof IStyle>;
    injectedStyles: Styles<keyof IStyle, IProps>;
    segment?: Segment;
}

const inputIcon = (inputId: string) => {
    switch (inputId) {
        case "mobilityOptions":
            return <IconMobilityOptions />;
        case "purpose":
            return <IconFlag />;
        case "notes":
            return <IconEditNote />;
        case "returnTrip":
            return <IconEdit />;
        default:
            return null;
    }
};

export const BookingInputForm: React.FunctionComponent<BookingInputProps> =
    ({ inputFields, onChange, classes, injectedStyles, segment }) => {
        const readonly = !onChange;
        const selectOverrideStyle = (minWidth: number = 200) => ({
            main: overrideClass({ ...injectedStyles.optionSelect as any, minWidth: minWidth }),
            menu: overrideClass(injectedStyles.selectMenu),
            control: overrideClass(injectedStyles.selectControl),
            valueContainer: overrideClass(injectedStyles.selectValueContainer),
            placeholder: overrideClass(injectedStyles.link),
            singleValue: overrideClass(injectedStyles.selectSingleValue),
            multiValue: overrideClass(injectedStyles.selectMultiValue)
        });
        const valueToOption = (value, options) => options.find((option: any) => option.value === value);
        return (
            <div className={classes.form}>
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
                        const options = inputField.options?.map((option: BookingFieldOption) => ({
                            value: option.id,
                            label: option.title
                        })) || [];  // inputField.options shouldn't be undefined for "SINGLE_CHOICE" type
                        valueElem = readonly ?
                            inputField.value
                            :
                            <TKUISelect
                                options={options}
                                styles={selectOverrideStyle()}
                                value={valueToOption(inputField.value, options)}
                                onChange={update => changeHandler(update.value)}
                                placeholder={"Select"}
                                components={{
                                    IndicatorsContainer: () => !inputField.value ? null :
                                        <div className={classes.link}>Change</div>
                                }}
                            />;
                    } else if (inputField.type === "MULTIPLE_CHOICE") {
                        const multiSelectOptions = inputField.options?.map((option: BookingFieldOption) => ({
                            value: option.id,
                            label: option.title
                        })) || [];  // inputField.options shouldn't be undefined for "MULTIPLE_CHOICE" type
                        valueElem = readonly ?
                            inputField.values!.map((value, i) => <div key={i}>{Util.camelCaseToSpaced(value)}</div>)
                            :
                            <TKUISelect
                                options={multiSelectOptions}
                                isMulti
                                styles={selectOverrideStyle()}
                                value={inputField.values!.map(value => valueToOption(value, multiSelectOptions))}
                                onChange={(update: SelectOption[]) => // update is null if no option is selected.
                                    changeHandler((update || []).map(option => option.value))}
                                placeholder={"Select"}
                                components={{
                                    IndicatorsContainer: () => inputField.values?.length === 0 ? null :
                                        <div className={classes.link}>Add</div>
                                }}
                            />;
                    } else if (inputField.type === "LONG_TEXT") {
                        valueElem = readonly ?
                            inputField.value || "None provided"
                            :
                            <textarea
                                value={inputField.value}
                                onChange={e => changeHandler(e.target.value)}
                            />
                    } else if (inputField.type === "NUMBER") {
                        valueElem = readonly ? inputField.value
                            :
                            <input
                                type='number'
                                value={inputField.value ?? inputField.minValue ?? 1}
                                min={inputField.minValue ?? 1}
                                max={inputField.maxValue ?? 10}
                                onChange={e => changeHandler(e.target.value)}
                                className={classes.numberInput}
                            />
                    } else if (inputField.type === "RETURN_TRIP" && segment) {
                        const ONE_WAY_ONLY_OPTION = { value: "One-way only", label: "One-way only" };
                        const DATE_OPTION = { value: "Date", label: "Date" };
                        const options = [
                            ONE_WAY_ONLY_OPTION,
                            DATE_OPTION
                        ];
                        const returnValueToOption = value =>
                            // Leave undefined when required to force the user to explicitly pick an option,
                            // or default to "One-way only" when field is optional (since placeholder makes no sense in that case.)
                            value === "" ? (inputField.required ? undefined : ONE_WAY_ONLY_OPTION) :
                                value === ONE_WAY_ONLY_OPTION.value ? ONE_WAY_ONLY_OPTION : DATE_OPTION;
                        valueElem = readonly ?
                            returnValueToOption(inputField.value) === DATE_OPTION ?
                                DateTimeUtil.formatRelativeDay(DateTimeUtil.momentFromStringTZ(inputField.value!, segment.to.timezone), DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat(), DateTimeUtil.dateFormat()) :
                                returnValueToOption(inputField.value)?.label ?? "-"
                            :
                            <div className={classes.returnTripInput}>
                                <TKUISelect
                                    options={options}
                                    styles={selectOverrideStyle(150)}
                                    value={returnValueToOption(inputField.value)}
                                    onChange={update => changeHandler((update.value === ONE_WAY_ONLY_OPTION.value) ? ONE_WAY_ONLY_OPTION.value :
                                        DateTimeUtil.momentFromTimeTZ(segment.endTime * 1000, segment.to.timezone).toISOString())}
                                    placeholder={"Select one-way or enter a return trip date."}
                                    components={{
                                        IndicatorsContainer: () => null
                                    }}
                                />
                                {returnValueToOption(inputField.value) === DATE_OPTION &&
                                    <TKUIDateTimePicker     // Switch rotingQuery.time to region timezone.
                                        value={DateTimeUtil.momentFromStringTZ(inputField.value!, segment.to.timezone)}
                                        timeZone={segment.to.timezone}
                                        onChange={date => changeHandler(date.toISOString())}
                                        timeFormat={DateTimeUtil.timeFormat()}
                                        dateFormat={DateTimeUtil.dateTimeFormat()}
                                        disabled={readonly}
                                        popperPlacement={'top-end'}
                                    />}
                            </div>;
                    }
                    return (valueElem &&
                        <div className={classes.group} key={i}>
                            <div className={classes.icon}>
                                {inputIcon(inputField.id)}
                            </div>
                            <div className={classes.groupRight}>
                                <div className={classes.label}>
                                    {inputField.title + (!readonly && inputField.required ? " (required)" : "")}
                                </div>
                                <div className={readonly ? classes.value : classes.input}>
                                    {valueElem}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>)
    };

const TKUIMxMBookingCard: React.FunctionComponent<IProps> = ({ segment, trip, onRequestClose, onSuccess, refreshSelectedTrip, classes, injectedStyles, t }) => {
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
                    setRequestBookingForm(bookingsInfo[0]);
                    // Environment.isLocal() && setRequestBookingForm(Util.deserialize(require("../tmp/tickets.json")[0], BookingInfo));
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
                        <div className={classes.price}>{FormatUtil.toMoney(confirmation.purchase.price, { currency: confirmation.purchase.currency + " ", forceDecimals: true })}</div>}
                </div>
                <div className={classes.bookingFormMain}>
                    {confirmation.tickets && confirmation.tickets?.length > 0 &&
                        <div className={classNames(classes.group, classes.divider)}>
                            <TKUITicketSelect
                                tickets={confirmation.tickets}
                            />
                        </div>}
                    <BookingInputForm
                        inputFields={confirmation.input}
                        classes={classes}
                        injectedStyles={injectedStyles}
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
                <div className={classes.startTime}>
                    {DateTimeUtil.formatRelativeDay(DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone),
                        DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat(), DateTimeUtil.dateFormat())}
                </div>
                <div className={classes.fromTo}>
                    <TKUIFromTo
                        from={segment.from}
                        to={segment.to}
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
                <div className={classes.separator} />
                <BookingInputForm
                    inputFields={requestBookingForm.input}
                    onChange={update => setRequestBookingForm(Util.iAssign(requestBookingForm, { input: update }))}
                    classes={classes}
                    injectedStyles={injectedStyles}
                    segment={segment}
                />
                <TKUIButton
                    text={t("Book")}
                    onClick={() => {
                        setWaiting(true);
                        TripGoApi.apiCallUrl(requestBookingForm.bookingURL, NetworkUtil.MethodType.POST, Util.serialize(requestBookingForm))
                            // For testing without performing booking.
                            // Promise.resolve({ "type": "bookingForm", "action": { "title": "Done", "done": true }, "refreshURLForSourceObject": "https://lepton.buzzhives.com/satapp/booking/v1/2c555c5c-b40d-481a-89cc-e753e4223ce6/update" })
                            .then(bookingForm => {
                                if (bookingForm.form?.[0]?.fields?.[0]?.value?.toUpperCase() !== "PENDING_CHANGES") {
                                    onSuccess?.(bookingForm.refreshURLForSourceObject);
                                }
                                // Workaround for (selected) trip with empty ("") updateUrl.
                                if (trip && !trip.updateURL) {
                                    trip.updateURL = bookingForm.refreshURLForSourceObject;
                                }
                                return refreshSelectedTrip();
                            })
                            .catch(UIUtil.errorMsg)
                            .finally(() => setWaiting(false))
                    }}
                    disabled={!canBook(requestBookingForm)}
                />
            </div>
        );
    }
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
            {waiting &&
                <div className={classes.loadingPanel}>
                    <IconSpin className={classes.iconLoading} focusable="false" role="status" aria-label="Waiting results" />
                </div>}
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUIMxMBookingCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));