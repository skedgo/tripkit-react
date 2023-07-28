import * as React from "react";
import { Moment } from "moment-timezone";
import DateTimeUtil from "../util/DateTimeUtil";
// import * as $ from "jquery";

interface IProps {
    value: Moment;
    timeZone?: string;
    onChange?: (value: Moment) => void;
    disabled?: boolean;
    className?: string;
    showTimeInput?: boolean;    // default true
    min?: Moment;
    max?: Moment;
}

class DateTimeHTML5Input extends React.Component<IProps, {}> {

    private inputRef: any;

    /**
     * Programmatically open the datepicker.
     * Both focus and click is needed to trigger show of native widget in Chrome for Android.
     * It doesn't work on Firefox for Android.
     */
    public focus() {
        if (this.inputRef) {
            this.inputRef.focus();
            // TODO: re-enable
            // $("#query-datetime-picker").trigger("click");
        }
    }

    public render(): React.ReactNode {
        const { timeZone = DateTimeUtil.defaultTZ, showTimeInput = true, min, max } = this.props;
        const displayValue = this.props.value.tz(timeZone);
        return (
            <input
                type={showTimeInput ? "datetime-local" : "date"}
                value={displayValue.format(showTimeInput ? DateTimeUtil.HTML5_DATE_TIME_FORMAT : "YYYY-MM-DD")}
                onChange={() => {
                    if (this.inputRef && this.props.onChange) {
                        // Handle 'Clear' button click on Android Chrome
                        this.props.onChange(this.inputRef.value ? DateTimeUtil.momentFromStringTZ(this.inputRef.value, timeZone) : DateTimeUtil.getNow());
                    }
                }}
                disabled={this.props.disabled}
                ref={(el: any) => this.inputRef = el}
                id="query-datetime-picker"
                className={this.props.className}
                min={min?.format(showTimeInput ? DateTimeUtil.HTML5_DATE_TIME_FORMAT : "YYYY-MM-DD")}
                max={max?.format(showTimeInput ? DateTimeUtil.HTML5_DATE_TIME_FORMAT : "YYYY-MM-DD")}
            />
        )
    }

}

export default DateTimeHTML5Input;