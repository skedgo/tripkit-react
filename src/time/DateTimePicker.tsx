import * as React from "react";
import DeviceUtil, {BROWSER, OS} from "../util/DeviceUtil";
import {Moment} from "moment";
import DatePicker from 'react-datepicker';
import DateTimeHTML5Input from "./DateTimeHTML5Input";
import DateTimeUtil from "../util/DateTimeUtil";

interface IProps {
    value: Moment;
    onChange?: (value: Moment) => void;
    disabled?: boolean;
    timeFormat?: string;
    dateFormat?: string;
}

class DateTimePicker extends React.Component<IProps, {}> {

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

    private onValueChange(value: Moment) {
        const onChange = this.props.onChange ? this.props.onChange :
            () => { // Avoid empty block warning
            };
        const valueWithTimezone = DateTimeUtil.momentDefaultTZ(value.format(this.props.dateFormat), this.props.dateFormat);
        onChange(valueWithTimezone);
    }

    public render(): React.ReactNode {
        // react-datepicker is timezone agnostic, and it parses dates in browser local timezone.
        // Switch to browser local timezone while preserving "display" date, so we avoid inconsistencies.
        const displayValue = DateTimeUtil.moment(this.props.value.format(this.props.dateFormat), this.props.dateFormat);
        return (DeviceUtil.isDesktop || (DeviceUtil.os === OS.IOS && DeviceUtil.browser === BROWSER.FIREFOX)) ?
            <DatePicker
                selected={displayValue}
                onChange={(value: Moment) => {
                    if (this.changedRaw) {  // Avoid calling onValueChange again if already called by onChangeRaw handler.
                        this.changedRaw = false;
                        return;
                    }
                    this.onValueChange(value);
                }}
                onChangeRaw={(date) => {
                    this.changedRaw = true;
                    setTimeout(() => this.changedRaw = false, 100); // To avoid it to keep true if onChange is not called
                    const moment = DateTimeUtil.momentDefaultTZ(date.target.value, this.props.dateFormat);
                    if (moment.isValid()) {
                        this.onValueChange(moment);
                    }
                }}
                showTimeSelect={true}
                timeFormat={this.props.timeFormat}
                dateFormat={this.props.dateFormat}
                calendarClassName="QueryInput-calendar"
                disabled={this.props.disabled}
                preventOpenOnFocus={true}   // prevents calendar re-opening after picking time
                ref={(el: any) => this.datePickerRef = el}
                disabledKeyboardNavigation={true}   // Since want to enable user to navigate / update date-time text.
            /> :
            <DateTimeHTML5Input
                value = {displayValue}
                onChange = {this.onValueChange}
                disabled={this.props.disabled}
                ref={(el: any) => this.dateTimeHTML5Ref = el}
            />
    }

}

export default DateTimePicker;