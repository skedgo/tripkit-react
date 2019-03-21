import * as React from "react";
import {Moment} from "moment";
import DateTimeUtil from "../util/DateTimeUtil";
import DateTimePicker from "./DateTimePicker";
import "./DateTimePickerFace.css";
import {default as DeviceUtil} from "../util/DeviceUtil";

interface IProps {
    value: Moment;
    onChange?: (value: Moment) => void;
    format: (value: Moment) => string;
}

interface IState {
    textInput: boolean;
}

class DateTimePickerFace extends React.Component<IProps, IState> {

    private dateTimePickerRef: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            textInput: false
        };
        this.onFaceClick = this.onFaceClick.bind(this);
    }

    private onFaceClick() {
        if (this.dateTimePickerRef) {
            this.dateTimePickerRef.setFocusActually();
            if (DeviceUtil.isDesktop) {
                this.setState({textInput: true});
            }
        }
    }

    public render(): React.ReactNode {
        return (
            <div className={"DateTimePickerFace" + (this.state.textInput ? " DateTimePickerFace-textInput" : " DateTimePickerFace-face")}>
                <button className="DateTimePickerFace-label"
                        onClick={this.onFaceClick}
                        onFocus={this.onFaceClick}>
                    {this.props.format(this.props.value)}
                </button>
                <div className="DateTimePickerFace-hidden">
                    <DateTimePicker
                        value={this.props.value}
                        onChange={(value: Moment) => {
                            if (this.props.onChange) {
                                this.props.onChange(value);
                            }
                            // setTimeout(() => {
                            //     if (this.dateTimePickerRef && !this.dateTimePickerRef.isPopupOpen()) {
                            //         this.setState({textInput: false});
                            //     }
                            // }, 10);
                        }}
                        timeFormat={DateTimeUtil.TIME_FORMAT}
                        dateFormat={DateTimeUtil.DATE_TIME_FORMAT}
                        ref={(el: any) => this.dateTimePickerRef = el}
                        onClose={() => {
                            this.setState({textInput: false});
                        }}
                    />
                </div>
            </div>
        );
    }

}

export default DateTimePickerFace;