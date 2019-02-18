import * as React from "react";
import { Moment } from "moment-timezone";
interface IProps {
    value: Moment;
    onChange?: (value: Moment) => void;
    disabled?: boolean;
}
declare class DateTimeHTML5Input extends React.Component<IProps, {}> {
    private inputRef;
    constructor(props: IProps);
    /**
     * Programmatically open the datepicker.
     * Both focus and click is needed to trigger show of native widget in Chrome for Android.
     * It doesn't work on Firefox for Android.
     */
    focus(): void;
    render(): React.ReactNode;
}
export default DateTimeHTML5Input;
