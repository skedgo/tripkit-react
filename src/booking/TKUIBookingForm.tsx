import React, { Fragment } from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIBookingFormDefaultStyle } from "./TKUIBookingForm.css";
import DateTimeUtil from '../util/DateTimeUtil';
import BookingInfo, { BookingField, BookingFieldOption } from '../model/trip/BookingInfo';
import TKUIFromTo from './TKUIFromTo';
import TKUITicketSelect from '../stripekit/TKUITicketSelect';
import TKUIButton from '../buttons/TKUIButton';
import FormatUtil from '../util/FormatUtil';
import Util from '../util/Util';
import { Styles } from "react-jss";
import { Classes } from "jss";
import Segment from '../model/trip/Segment';
import { ReactComponent as IconMobilityOptions } from '../images/ic-mobility-options.svg';
import { ReactComponent as IconFlag } from '../images/ic-flag.svg';
import { ReactComponent as IconEdit } from '../images/ic-edit.svg';
import { ReactComponent as IconEditNote } from '../images/ic-add-note.svg';
import TKUISelect, { SelectOption } from '../buttons/TKUISelect';
import TKUIDateTimePicker from '../time/TKUIDateTimePicker';
import Trip from '../model/trip/Trip';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: BookingInfo;
    onChange: (bookingForm: BookingInfo) => void;
    trip: Trip;
    onSubmit: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingFormDefaultStyle>

export type TKUIBookingFormProps = IProps;
export type TKUIBookingFormStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingForm {...props} />,
    styles: tKUIBookingFormDefaultStyle,
    classNamePrefix: "TKUIBookingForm"
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
                                placeholder={"Enter text here"}
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
                        const DATE_OPTION = { value: "Round trip", label: "Round trip" };
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
                                DateTimeUtil.formatRelativeDay(DateTimeUtil.momentFromStringTZ(inputField.value!, segment.to.timezone), DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat(), { partialReplace: DateTimeUtil.dateFormat() }) :
                                returnValueToOption(inputField.value)?.label ?? "-"
                            :
                            <div className={classes.returnTripInput}>
                                <TKUISelect
                                    options={options}
                                    styles={selectOverrideStyle(150)}
                                    value={returnValueToOption(inputField.value)}
                                    onChange={update => changeHandler((update.value === ONE_WAY_ONLY_OPTION.value) ? ONE_WAY_ONLY_OPTION.value :
                                        DateTimeUtil.momentFromTimeTZ(segment.endTimeSeconds * 1000, segment.to.timezone).toISOString())}
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

const TKUIBookingForm: React.FunctionComponent<IProps> = (props: IProps) => {
    const { value, onChange, trip, onSubmit, classes, injectedStyles, t } = props;
    const segment = trip!.segments.find(segment => segment.booking)!;
    return (
        <div className={classes.main}>
            <div className={classes.fromTo}>
                <TKUIFromTo
                    from={segment.from}
                    to={segment.to}
                    startTime={segment.startTime}
                    endTime={segment.endTime}
                    timezone={segment.from.timezone}
                />
            </div>
            {value.tickets && value.tickets?.length > 0 &&
                <Fragment>
                    <div className={classes.separator} />
                    <TKUITicketSelect
                        title={"Select tickets"}
                        tickets={value.tickets}
                        onChange={update => onChange(Util.iAssign(value, { tickets: update }))}
                    />
                </Fragment>}
            {value.input.length > 0 &&
                <Fragment>
                    <div className={classes.separator} />
                    <BookingInputForm
                        inputFields={value.input}
                        onChange={update => onChange(Util.iAssign(value, { input: update }))}
                        classes={classes}
                        injectedStyles={injectedStyles}
                        segment={segment}
                    />
                </Fragment>}
            <div className={classes.footer}>
                <div className={classes.separator} />
                {/* {value.tickets && value.tickets?.length > 0 &&    // Disabled as requested in #18575: to avoid confusion, since it is not considering the round trip, and we have the confirm screen for the pricing to be computed in the BE.
                    <div className={classes.paySummary}>
                        <div>{value.tickets.reduce((totalTickets, ticket) => totalTickets + ticket.value, 0) + " tickets"}</div>
                        <div>{FormatUtil.toMoney(value.tickets.reduce((totalPrice, ticket) => totalPrice + ticket.price * ticket.value, 0),
                            { currency: value.tickets[0].currency + " ", nInCents: true, forceDecimals: true })}</div>
                    </div>} */}
                <TKUIButton
                    text={t("Book")}
                    onClick={onSubmit}
                    disabled={!canBook(value)}
                />
            </div>
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingForm, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));