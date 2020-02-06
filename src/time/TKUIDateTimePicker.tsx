import * as React from "react";
import DeviceUtil, {BROWSER, OS} from "../util/DeviceUtil";
import {Moment} from "moment";
import DatePicker from 'react-datepicker';
import DateTimeHTML5Input from "./DateTimeHTML5Input";
import DateTimeUtil from "../util/DateTimeUtil";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIDateTimePickerDefaultStyle} from "./TKUIDateTimePicker.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Moment;
    onChange?: (value: Moment) => void;
    disabled?: boolean;
    timeFormat?: string;
    dateFormat?: string;
    onBlur?: () => void;
    onClose?: () => void;
}

export interface IStyle {
    datePicker: CSSProps<IProps>;
    calendarPopper: CSSProps<IProps>;
    calendar: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {

}

export type TKUIDateTimePickerProps = IProps;
export type TKUIDateTimePickerStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIDateTimePicker {...props}/>,
    styles: tKUIDateTimePickerDefaultStyle,
    classNamePrefix: "TKUIDateTimePicker"
};

class TKUIDateTimePicker extends React.Component<IProps, {}> {

    private datePickerRef: any;
    private dateTimeHTML5Ref: any;
    private changedRaw: boolean = false;

    constructor(props: IProps) {
        super(props);
        this.onValueChange = this.onValueChange.bind(this);
    }

    public setFocus() {
        if (this.datePickerRef) {   // just if Device.isDesktop
            this.datePickerRef.setOpen(true);
        } else if (this.dateTimeHTML5Ref) { // just if !Device.isDesktop
            this.dateTimeHTML5Ref.focus();
        }
    }

    /**
     * Version of setFocus that actually sets focus to input. Needed to take action on blur.
     */
    public setFocusActually() {
        if (this.datePickerRef) {   // just if Device.isDesktop
            this.datePickerRef.setFocus();
            this.datePickerRef.setOpen(true);
        } else if (this.dateTimeHTML5Ref) { // just if !Device.isDesktop
            this.dateTimeHTML5Ref.focus();
        }
    }

    private onValueChange(value: Moment) {
        const onChange = this.props.onChange ? this.props.onChange :
            () => { // Avoid empty block warning
            };
        const valueWithTimezone = DateTimeUtil.momentFromStringDefaultTZ(value.format(this.props.dateFormat), this.props.dateFormat);
        onChange(valueWithTimezone);
    }

    public isPopupOpen(): boolean {
        return this.datePickerRef !== undefined && this.datePickerRef.state.open;
    }

    public render(): React.ReactNode {
        // react-datepicker is timezone agnostic, and it parses dates in browser local timezone.
        // Switch to browser local timezone while preserving "display" date, so we avoid inconsistencies.
        const displayValue = DateTimeUtil.moment(this.props.value.format(this.props.dateFormat), this.props.dateFormat);
        const classes = this.props.classes;
        return (DeviceUtil.isDesktop || (DeviceUtil.os === OS.IOS && DeviceUtil.browser === BROWSER.FIREFOX)) ?
            <DatePicker
                selected={displayValue}
                onChange={(value: Moment) => {
                    if (this.changedRaw) {  // Avoid calling onValueChange again if already called by onChangeRaw handler.
                        this.changedRaw = false;
                        return;
                    }
                    this.onValueChange(value);
                    setTimeout(() => {
                        if (!this.isPopupOpen() && this.props.onClose) {
                            this.props.onClose();
                        }
                    }, 10);
                }}
                onChangeRaw={(date) => {
                    this.changedRaw = true;
                    setTimeout(() => this.changedRaw = false, 100); // To avoid it to keep true if onChange is not called
                    const moment = DateTimeUtil.momentFromStringDefaultTZ(date.target.value, this.props.dateFormat);
                    if (moment.isValid()) {
                        this.onValueChange(moment);
                    }
                }}
                showTimeSelect={true}
                timeFormat={this.props.timeFormat}
                dateFormat={this.props.dateFormat}
                className={classes.datePicker}
                popperClassName={classes.calendarPopper}
                calendarClassName={classes.calendar}
                disabled={this.props.disabled}
                preventOpenOnFocus={true}   // prevents calendar re-opening after picking time
                ref={(el: any) => this.datePickerRef = el}
                disabledKeyboardNavigation={true}   // Since want to enable user to navigate / update date-time text.
                onBlur = {() => {
                    if (this.props.onBlur) {
                        this.props.onBlur()
                    }
                    if (this.props.onClose) {
                        this.props.onClose();
                    }
                }}
                popperModifiers={{
                    offset: {
                        enabled: true,
                        offset: "-260px, 0"
                    },
                    preventOverflow: {
                        enabled: true,
                        escapeWithReference: false,
                        boundariesElement: "viewport"
                    }
                }}
            /> :
            <DateTimeHTML5Input
                value = {displayValue}
                onChange = {this.onValueChange}
                disabled={this.props.disabled}
                ref={(el: any) => this.dateTimeHTML5Ref = el}
            />
    }

}

export default connect((config: TKUIConfig) => config.TKUIDateTimePicker, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));