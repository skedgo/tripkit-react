import * as React from "react";
import DeviceUtil, {BROWSER, OS} from "../util/DeviceUtil";
import {Moment} from "moment";
import DatePicker from 'react-datepicker';
import * as Popper from 'popper.js';
import DateTimeHTML5Input from "./DateTimeHTML5Input";
import DateTimeUtil from "../util/DateTimeUtil";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIDateTimePickerDefaultStyle} from "./TKUIDateTimePicker.css";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Moment;
    timeZone?: string;
    onChange?: (value: Moment) => void;
    disabled?: boolean;
    timeFormat?: string;
    dateFormat?: string;
    renderCustomInput?: (value: any, onClick: any, onKeyDown: any, ref: any) => JSX.Element;
    popperPlacement?: Popper.Placement;
    popperModifiers?: any;
}

export interface IStyle {
    datePicker: CSSProps<IProps>;
    calendarPopper: CSSProps<IProps>;
    calendar: CSSProps<IProps>;
    inputElem: CSSProps<IProps>;
    face: CSSProps<IProps>;
    faceHidden: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {

}

interface IState {
    dateSelection: Moment;
}

export type TKUIDateTimePickerProps = IProps;
export type TKUIDateTimePickerStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIDateTimePicker {...props}/>,
    styles: tKUIDateTimePickerDefaultStyle,
    classNamePrefix: "TKUIDateTimePicker"
};

class TKUIDateTimePicker extends React.Component<IProps, IState> {

    private datePickerRef: any;
    private dateTimeHTML5Ref: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            // To register date selection while interacting with calendar, and trigger value change on calendar close.
            dateSelection: this.props.value
        };
        this.onValueChange = this.onValueChange.bind(this);
    }

    private onValueChange(value: Moment) {
        this.props.onChange && this.props.onChange(value);
    }

    public isPopupOpen(): boolean {
        return this.datePickerRef !== undefined && this.datePickerRef.state.open;
    }

    public render(): React.ReactNode {
        const value = this.state.dateSelection;
        const displayValue = value.tz(this.props.timeZone ? this.props.timeZone : DateTimeUtil.defaultTZ);
        const displayDate = utcToZonedTime(displayValue.toDate(), this.props.timeZone ? this.props.timeZone : DateTimeUtil.defaultTZ);
        const classes = this.props.classes;
        const CustomInput = this.props.renderCustomInput ?
            React.forwardRef(((props: {value?: any, onClick?: any, onKeyDown?: any}, ref: any) => this.props.renderCustomInput!(props.value, props.onClick, props.onKeyDown, ref))) : undefined;
        return (DeviceUtil.isDesktop || (DeviceUtil.os === OS.IOS && DeviceUtil.browser === BROWSER.FIREFOX)) ?
            <div onKeyDown={(e) => {
                // Esc key is used to close calendar, so this avoids esc key press to bubble up and cause current card
                // to be closed.
                if (e.keyCode === 27) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }}>
            <DatePicker
                selected={displayDate}
                onChange={(value: Date) => {
                    const dateUTCValue = zonedTimeToUtc(value, this.props.timeZone ? this.props.timeZone : DateTimeUtil.defaultTZ);
                    const momentTZValue = DateTimeUtil.momentTZ(dateUTCValue, this.props.timeZone ? this.props.timeZone : DateTimeUtil.defaultTZ);
                    this.setState({
                        dateSelection: momentTZValue
                    });
                }}
                shouldCloseOnSelect={false}
                // showTimeSelect={true}
                showTimeInput={true}
                timeFormat={this.props.timeFormat}
                dateFormat={this.props.dateFormat}
                className={classes.datePicker}
                popperClassName={classes.calendarPopper}
                calendarClassName={classes.calendar}
                disabled={this.props.disabled}
                // preventOpenOnFocus={true}   // prevents calendar re-opening after picking time
                ref={(el: any) => this.datePickerRef = el}
                // disabledKeyboardNavigation={true}   // Since want to enable user to navigate / update date-time text.
                disabledKeyboardNavigation={false}
                onCalendarOpen={() => {
                    // Give focus to selected day on calendar open (date input as text has no sense anymore, anyway it's
                    // not well supported by react-datepicker).
                    const elems = document.getElementsByClassName("react-datepicker__day--selected");
                    if (elems.length > 0) {
                        (elems[0] as any).focus();
                    }
                }}
                onCalendarClose={() => {
                    this.onValueChange(this.state.dateSelection);
                }}
                popperModifiers={{
                    preventOverflow: {
                        enabled: true,
                        escapeWithReference: false,
                        boundariesElement: "viewport"
                    },
                    ...this.props.popperModifiers
                }}
                customInput={CustomInput && <CustomInput/>}
                popperPlacement={this.props.popperPlacement}
            /></div> :
            (CustomInput ?
                <div className={classes.face}>
                    {<CustomInput onClick={() => {
                        this.dateTimeHTML5Ref && this.dateTimeHTML5Ref.focus();
                    }}/>}
                    <div className={classes.faceHidden}>
                        <DateTimeHTML5Input
                            value={displayValue}
                            timeZone={this.props.timeZone}
                            onChange={this.onValueChange}
                            disabled={this.props.disabled}
                            ref={(el: any) => this.dateTimeHTML5Ref = el}
                            className={classes.inputElem}
                        />
                    </div>
                </div> :
                <DateTimeHTML5Input
                    value={displayValue}
                    timeZone={this.props.timeZone}
                    onChange={this.onValueChange}
                    disabled={this.props.disabled}
                    ref={(el: any) => this.dateTimeHTML5Ref = el}
                    className={classes.inputElem}
                />)
    }

}

export default connect((config: TKUIConfig) => config.TKUIDateTimePicker, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));