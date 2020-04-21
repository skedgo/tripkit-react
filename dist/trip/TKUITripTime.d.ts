/// <reference types="react" />
import Trip from "../model/trip/Trip";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Trip;
    brief?: boolean;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export interface IStyle {
    main: CSSProps<IProps>;
    timePrimary: CSSProps<IProps>;
    timeSecondary: CSSProps<IProps>;
}
export declare type TKUITripTimeProps = IProps;
export declare type TKUITripTimeStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
