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
    timeZone?: string;
    onChange?: (value: Moment) => void;
    disabled?: boolean;
    timeFormat?: string;
    dateFormat?: string;
    onBlur?: () => void;
    onClose?: () => void;
    reference?: (ref: any) => void;
    renderCustomInput?: (value: any, onClick: any) => JSX.Element;
    popperPlacement?: string;
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
        props.reference && props.reference(this);
    }

    private onValueChange(value: Moment) {
        this.props.onChange && this.props.onChange(value);
    }

    public isPopupOpen(): boolean {
        return this.datePickerRef !== undefined && this.datePickerRef.state.open;
    }

    public render(): React.ReactNode {
        const displayValue = this.props.value.tz(this.props.timeZone ? this.props.timeZone : DateTimeUtil.defaultTZ);
        const classes = this.props.classes;
        const CustomInput = this.props.renderCustomInput ?
            ((props: {value?: any, onClick?: any}) => this.props.renderCustomInput!(props.value, props.onClick)) : undefined;
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
                    const moment = DateTimeUtil.momentFromStringTZ(date.target.value,
                        this.props.timeZone ? this.props.timeZone : DateTimeUtil.defaultTZ, this.props.dateFormat);
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
                    preventOverflow: {
                        enabled: true,
                        escapeWithReference: false,
                        boundariesElement: "viewport"
                    }
                }}
                customInput={CustomInput && <CustomInput/>}
                popperPlacement={this.props.popperPlacement}
            /> :
            (CustomInput ?
                <div className={classes.face}>
                    {<CustomInput onClick={() => {
                        this.dateTimeHTML5Ref && this.dateTimeHTML5Ref.focus();
                    }}/>}
                    <div className={classes.faceHidden}>
                        <DateTimeHTML5Input
                            value = {displayValue}
                            onChange = {this.onValueChange}
                            disabled={this.props.disabled}
                            ref={(el: any) => this.dateTimeHTML5Ref = el}
                            className={classes.inputElem}
                        />
                    </div>
                </div> :
                <DateTimeHTML5Input
                    value = {displayValue}
                    onChange = {this.onValueChange}
                    disabled={this.props.disabled}
                    ref={(el: any) => this.dateTimeHTML5Ref = el}
                    className={classes.inputElem}
                />)
    }

}

export default connect((config: TKUIConfig) => config.TKUIDateTimePicker, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));