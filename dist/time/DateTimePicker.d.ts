import * as React from "react";
import { Moment } from "moment";
interface IProps {
    value: Moment;
    onChange?: (value: Moment) => void;
    disabled?: boolean;
    timeFormat?: string;
    dateFormat?: string;
}
declare class DateTimePicker extends React.Component<IProps, {}> {
    private datePickerRef;
    private dateTimeHTML5Ref;
    private changedRaw;
    constructor(props: IProps);
    setFocus(): void;
    private onValueChange;
    render(): React.ReactNode;
}
export default DateTimePicker;
