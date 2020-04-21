/// <reference types="react" />
import { Moment } from "moment";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
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
export declare type TKUIDateTimePickerProps = IProps;
export declare type TKUIDateTimePickerStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
