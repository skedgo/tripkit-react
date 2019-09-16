import * as React from "react";
import {Moment} from "moment-timezone";
import DateTimeUtil from "../util/DateTimeUtil";
import * as $ from "jquery";

interface IProps {
    value: Moment;
    onChange?: (value: Moment) => void;
    disabled?: boolean;
}

class DateTimeHTML5Input extends React.Component<IProps, {}> {

    private inputRef: any;

    constructor(props: IProps) {
        super(props);
    }

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
        return (
            <input type={"datetime-local"}
                   value={this.props.value.format(DateTimeUtil.HTML5_DATE_TIME_FORMAT)}
                   onChange={() => {
                       if (this.inputRef && this.props.onChange) {
                           this.props.onChange(DateTimeUtil.moment(this.inputRef.value));
                       }
                   }}
                   disabled={this.props.disabled}
                   ref={(el: any) => this.inputRef = el}
                   id="query-datetime-picker"
            />
        )
    }

}

export default DateTimeHTML5Input;