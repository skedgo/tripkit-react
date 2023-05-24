import React from "react";
import { TKComponentDefaultConfig } from "../config/TKComponentConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKUIWithClasses, TKUIWithStyle, overrideClass } from "../jss/StyleHelper";
import { BookingField, BookingFieldOption } from "../model/trip/BookingInfo";
import Segment from "../model/trip/Segment";
import { tKUIBookingInputFormDefaultStyle } from "./TKUIBookingInputForm.css";
import { ReactComponent as IconMobilityOptions } from '../images/ic-mobility-options.svg';
import { ReactComponent as IconFlag } from '../images/ic-flag.svg';
import { ReactComponent as IconEdit } from '../images/ic-edit.svg';
import { ReactComponent as IconEditNote } from '../images/ic-add-note.svg';
import Util from "../util/Util";
import TKUISelect, { SelectOption } from "../buttons/TKUISelect";
import DateTimeUtil from "../util/DateTimeUtil";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    inputFields: BookingField[];
    onChange?: (update: BookingField[]) => void;    
    segment?: Segment;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }
type IStyle = ReturnType<typeof tKUIBookingInputFormDefaultStyle>

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingInputForm {...props} />,
    styles: tKUIBookingInputFormDefaultStyle,
    classNamePrefix: "TKUIBookingInputForm"
};

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

const TKUIBookingInputForm: React.FunctionComponent<IProps> =
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
                                DateTimeUtil.formatRelativeDay(DateTimeUtil.momentFromStringTZ(inputField.value!, segment.to.timezone), DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat(), DateTimeUtil.dateFormat()) :
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

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));