/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
}
export interface IStyle {
    main: CSSProps<IProps>;
    pin: CSSProps<IProps>;
    pinEffect: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIMyLocationMapIconProps = IProps;
export declare type TKUIMyLocationMapIconStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
