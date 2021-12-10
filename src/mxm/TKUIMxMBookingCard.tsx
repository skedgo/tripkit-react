import React, {useState, useEffect, Fragment} from 'react';
import {overrideClass, TKUIWithClasses, TKUIWithStyle, withStyles} from "../jss/StyleHelper";
import Segment from "../model/trip/Segment";
import TKUICard from "../card/TKUICard";
import TripGoApi from "../api/TripGoApi";
import {tKUIMxMBookingCardDefaultStyle} from "./TKUIMxMBookingCard.css";
import DateTimeUtil from "../util/DateTimeUtil";
import Util from "../util/Util";
import BookingInfo, {BookingField, BookingFieldOption} from "../model/trip/BookingInfo";
import TKUISelect, {SelectOption} from "../buttons/TKUISelect";
import TKUIButton from "../buttons/TKUIButton";
import NetworkUtil from "../util/NetworkUtil";
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg';
import {ClassNameMap, Styles} from "react-jss";
import {ReactComponent as IconUser} from '../images/ic-user.svg';
import {ReactComponent as IconFlag} from '../images/ic-flag.svg';
import {ReactComponent as IconEdit} from '../images/ic-edit.svg';
import {ReactComponent as IconNote} from '../images/ic-note.svg';
import {ReactComponent as IconPerson} from '../images/ic-person-circle.svg';
import {ReactComponent as IconShuttle} from '../images/ic-shuttle-circle.svg';
import TKUIErrorView from "../error/TKUIErrorView";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";
import TKUIFromTo from "../booking/TKUIFromTo";
import TKUIBookingActions from "../booking/TKUIBookingActions";
import {TKError} from "../error/TKError";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";

type IStyle = ReturnType<typeof tKUIMxMBookingCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    onRequestClose: () => void;
    refreshSelectedTrip: () => Promise<boolean>;
    onSuccess?: (bookingTripUpdateURL: string) => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIMxMBookingCardProps = IProps;
export type TKUIMxMBookingCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMBookingCard {...props}/>,
    styles: tKUIMxMBookingCardDefaultStyle,
    classNamePrefix: "TKUIMxMBookingCard"
};

const canBook = (bookingInfo: BookingInfo) =>
    bookingInfo.input.every((field: BookingField) => !field.required || field.value || (field.values && field.values.length > 0));

interface BookingInputProps {
    inputFields: BookingField[];
    onChange?: (update: BookingField[]) => void;
    classes: ClassNameMap<keyof IStyle>;
    injectedStyles: Styles<keyof IStyle, IProps>;
}

const inputIcon = (inputId: string) => {
    switch (inputId) {
        case "mobilityOptions":
            return <IconUser/>;
        case "purpose":
            return <IconFlag/>;
        case "notes":
            return <IconEdit/>;
        default:
            return null;
    }
};

const BookingInput: React.SFC<BookingInputProps> =
    ({inputFields, onChange, classes, injectedStyles}) => {
        const readonly = !onChange;
        const selectOverrideStyle = {
            main: overrideClass(injectedStyles.optionSelect),
            menu: overrideClass(injectedStyles.selectMenu),
            control: overrideClass(injectedStyles.selectControl),
            valueContainer: overrideClass(injectedStyles.selectValueContainer),
            placeholder: overrideClass(injectedStyles.link),
            singleValue: overrideClass(injectedStyles.selectSingleValue),
            multiValue: overrideClass(injectedStyles.selectMultiValue)
        };
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
                        valueElem = readonly ?
                            inputField.value
                            :
                            <TKUISelect
                                options={inputField.options.map((option: BookingFieldOption) => ({
                                    value: option.id,
                                    label: option.title
                                }))}
                                styles={selectOverrideStyle}
                                onChange={update => changeHandler(update.value)}
                                placeholder={"Select"}
                                components={{
                                    IndicatorsContainer: () => !inputField.value ? null :
                                        <div className={classes.link}>Change</div>
                                }}
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
                                styles={selectOverrideStyle}
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
                                placeholder={inputField.title}
                                onChange={e => changeHandler(e.target.value)}
                            />
                    }
                    return (
                        <div className={classes.group} key={i}>
                            <div className={classes.icon}>
                                {inputIcon(inputField.id)}
                            </div>
                            <div className={classes.groupRight}>
                                {(inputField.type !== "LONG_TEXT" || readonly) &&
                                <div className={classes.label}>
                                    {inputField.title + (!readonly && inputField.required ? " (required)" : "")}
                                </div>}
                                <div className={readonly ? classes.value : classes.input}>
                                    {valueElem}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>)
    };

const TKUIMxMBookingCard: React.SFC<IProps> = ({segment, onRequestClose, onSuccess, refreshSelectedTrip, classes, injectedStyles}) => {
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
                <div className={classes.service}>
                    <div className={classes.serviceImages}>
                        <IconPerson className={classes.iconPerson}/>
                        <IconShuttle className={classes.iconShuttle}/>
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
                </div>
                <div className={classes.bookingFormMain}>
                    <BookingInput
                        inputFields={confirmation.input}
                        classes={classes}
                        injectedStyles={injectedStyles}
                    />
                    {confirmation.notes &&
                    <div className={classes.group}>
                        <div className={classes.icon}>
                            <IconNote/>
                        </div>
                        <div className={classes.groupRight} style={{minWidth: 0}}>
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
                    setError={setError}
                    requestRefresh={() => refreshSelectedTrip().then(() => {})}
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
                            .then((bookingForm) => onSuccess?.(bookingForm.refreshURLForSourceObject))
                            .then(refreshSelectedTrip)
                            .catch((e) => setError(e))
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

export default connect((config: TKUIConfig) => config.TKUIMxMBookingCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));