import * as React from "react";
import {Moment} from "moment";
import DateTimeUtil from "../util/DateTimeUtil";
import DateTimePicker from "./DateTimePicker";
import "./DateTimePickerFace.css";
import {default as DeviceUtil} from "../util/DeviceUtil";
import {default as moment} from 'moment-timezone';
import classNames from "classnames";

interface IProps {
    value: Moment;
    onChange?: (value: Moment) => void;
    renderFaceButton: (value: Moment, onClick: (e: any) => void, onFocus: (e: any) => void) => JSX.Element;
    textInputEnabled: boolean;
}

interface IState {
    textInput: boolean;
}

class DateTimePickerFace extends React.Component<IProps, IState> {

    public static defaultProps: Partial<IProps> = {
        renderFaceButton: (value: Moment, onClick: (e: any) => void, onFocus: (e: any) => void) => {
            let timeText;
            if (Math.abs(moment.duration(value.diff(DateTimeUtil.getNow())).asMinutes()) <= 1) {
                timeText = "Now"
            } else if (DateTimeUtil.getNow().format("ddd D") !== value.format("ddd D")) {
                timeText = value.format("ddd D, " + DateTimeUtil.TIME_FORMAT_TRIP);
            } else {
                timeText = value.format(DateTimeUtil.TIME_FORMAT_TRIP);
            }
            return (
                <button className={classNames("DateTimePickerFace-label")}
                        onClick={onClick}
                        onFocus={onFocus}>
                    {timeText}
                </button>
            );
        },
        textInputEnabled: false
    };

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
            if (DeviceUtil.isDesktop && this.props.textInputEnabled) {
                this.setState({textInput: true});
            }
        }
    }

    public render(): React.ReactNode {
        return (
            <div className={classNames("DateTimePickerFace", this.state.textInput ? "DateTimePickerFace-textInput" : "DateTimePickerFace-face")}>
                {this.props.renderFaceButton(this.props.value, this.onFaceClick, this.onFaceClick)}
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